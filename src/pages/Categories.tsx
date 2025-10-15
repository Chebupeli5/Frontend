import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Progress,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../hooks/redux";
import type { Category } from "../types";
import { useGetOperationsQuery } from "../services/operationsApi";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryLimitsQuery,
  useCreateCategoryLimitMutation,
  useUpdateCategoryLimitMutation,
  useDeleteCategoryLimitMutation,
} from "../services/categoriesApi";
import styles from "./Categories.module.css";

const Categories: React.FC = () => {
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [categoryForm] = Form.useForm();
  const [limitForm] = Form.useForm();

  const { currentUser } = useAppSelector((state) => state.auth);
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useGetCategoriesQuery();
  const {
    data: categoryLimitsData,
    isLoading: limitsLoading,
    isFetching: limitsFetching,
  } = useGetCategoryLimitsQuery();
  const { data: operations = [] } = useGetOperationsQuery();
  const [createCategory, { isLoading: isCreatingCategory }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createCategoryLimit, { isLoading: isCreatingLimit }] =
    useCreateCategoryLimitMutation();
  const [updateCategoryLimit, { isLoading: isUpdatingLimit }] =
    useUpdateCategoryLimitMutation();
  const [deleteCategoryLimit] = useDeleteCategoryLimitMutation();

  if (!currentUser) return null;

  const categories = categoriesData ?? [];
  const categoryLimits = categoryLimitsData ?? [];
  const isLoadingData =
    categoriesLoading || categoriesFetching || limitsLoading || limitsFetching;
  const isSavingCategory = isCreatingCategory || isUpdatingCategory;
  const isSavingLimit = isCreatingLimit || isUpdatingLimit;

  const getCategoryData = (category: Category) => {
    const limitRecord = categoryLimits.find(
      (l) => l.category_id === category.category_id
    );
    const rawLimit = limitRecord?.limit ?? category.limit;
    const hasLimit = rawLimit !== undefined && rawLimit !== null;
    const limitValue = hasLimit ? rawLimit! : 0;
    const monthlyExpenses = operations
      .filter(
        (op) =>
          op.category_id === category.category_id &&
          op.type === "expense" &&
          new Date(op.date).getMonth() === new Date().getMonth() &&
          new Date(op.date).getFullYear() === new Date().getFullYear()
      )
      .reduce((sum, op) => sum + Math.abs(op.transaction), 0);

    const percentage = limitValue ? (monthlyExpenses / limitValue) * 100 : 0;

    return {
      limit: limitValue,
      spent: monthlyExpenses,
      percentage: Math.min(percentage, 100),
      hasLimit,
    };
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setIsCategoryModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue(category);
    setIsCategoryModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const limit = categoryLimits.find(
        (l) => l.category_id === categoryId && l.id !== undefined
      );
      if (limit?.id) {
        await deleteCategoryLimit(limit.id).unwrap();
      }
      await deleteCategory(categoryId).unwrap();
      message.success("Категория удалена");
    } catch {
      message.error("Не удалось удалить категорию");
    }
  };

  const handleCategorySubmit = async (values: {
    name: string;
    balance: number;
  }) => {
    const payload = {
      name: values.name,
      balance: values.balance ?? 0,
    };

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.category_id,
          ...payload,
        }).unwrap();
        message.success("Категория обновлена");
      } else {
        await createCategory(payload).unwrap();
        message.success("Категория добавлена");
      }
      setIsCategoryModalVisible(false);
      categoryForm.resetFields();
    } catch {
      message.error(
        editingCategory
          ? "Не удалось обновить категорию"
          : "Не удалось добавить категорию"
      );
    }
  };

  const handleSetLimit = (categoryId: number) => {
    const category = categories.find((c) => c.category_id === categoryId);
    const limit = categoryLimits.find((l) => l.category_id === categoryId);
    setSelectedCategoryId(categoryId);
    limitForm.setFieldsValue({
      category_name: category?.name,
      limit: limit?.limit || 0,
    });
    setIsLimitModalVisible(true);
  };

  const handleLimitSubmit = async (values: { limit: number }) => {
    if (!selectedCategoryId) return;
    const existingLimit = categoryLimits.find(
      (l) => l.category_id === selectedCategoryId
    );
    try {
      if (existingLimit?.id) {
        await updateCategoryLimit({
          id: existingLimit.id,
          limit: values.limit,
          category_id: selectedCategoryId,
        }).unwrap();
        message.success("Лимит обновлен");
      } else {
        await createCategoryLimit({
          category_id: selectedCategoryId,
          limit: values.limit,
        }).unwrap();
        message.success("Лимит установлен");
      }
      setIsLimitModalVisible(false);
      limitForm.resetFields();
    } catch {
      message.error("Не удалось сохранить лимит");
    }
  };

  return (
    <div className={styles.categories}>
      <Card
        title="Категории"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCategory}
            disabled={isLoadingData}
          >
            Добавить категорию
          </Button>
        }
        loading={isLoadingData}
      >
        {isLoadingData ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span>Загрузка данных...</span>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {categories.map((category) => {
              const categoryData = getCategoryData(category);

              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={category.category_id}>
                  <Card
                    size="small"
                    className={styles.categoryCard}
                    actions={[
                      <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={() => handleSetLimit(category.category_id)}
                        title="Установить лимит"
                        disabled={isLoadingData}
                      />,
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(category)}
                        title="Редактировать"
                        disabled={isLoadingData}
                      />,
                      <Popconfirm
                        title="Удалить категорию?"
                        description="Это действие нельзя отменить"
                        onConfirm={() =>
                          handleDeleteCategory(category.category_id)
                        }
                        okText="Да"
                        cancelText="Нет"
                        disabled={isLoadingData}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          title="Удалить"
                          disabled={isLoadingData}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <div className={styles.categoryHeader}>
                      <h4 className={styles.categoryName}>{category.name}</h4>
                    </div>

                    <div className={styles.categoryStats}>
                      <Statistic
                        title="Баланс"
                        value={Math.abs(category.balance)}
                        precision={0}
                        suffix="₽"
                        valueStyle={{
                          fontSize: "16px",
                          color: category.balance >= 0 ? "#52c41a" : "#f5222d",
                        }}
                      />
                    </div>

                    {categoryData.hasLimit && (
                      <div className={styles.limitSection}>
                        <div className={styles.limitHeader}>
                          <span className={styles.limitTitle}>
                            Лимит на месяц
                          </span>
                          <span className={styles.limitAmount}>
                            {categoryData.spent.toLocaleString("ru-RU")} /{" "}
                            {categoryData.limit.toLocaleString("ru-RU")} ₽
                          </span>
                        </div>
                        <Progress
                          percent={categoryData.percentage}
                          status={
                            categoryData.percentage > 90
                              ? "exception"
                              : categoryData.percentage > 70
                              ? "active"
                              : "normal"
                          }
                          showInfo={false}
                          strokeWidth={8}
                        />
                        <div className={styles.limitProgress}>
                          {categoryData.percentage.toFixed(1)}% использовано
                        </div>
                      </div>
                    )}

                    {!categoryData.hasLimit && (
                      <div className={styles.noLimit}>
                        <Button
                          type="dashed"
                          size="small"
                          block
                          onClick={() => handleSetLimit(category.category_id)}
                        >
                          Установить лимит
                        </Button>
                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Модал добавления/редактирования категории */}
      <Modal
        title={
          editingCategory ? "Редактировать категорию" : "Добавить категорию"
        }
        open={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        footer={null}
        confirmLoading={isSavingCategory}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
        >
          <Form.Item
            label="Название категории"
            name="name"
            rules={[{ required: true, message: "Введите название категории" }]}
          >
            <Input placeholder="Например: Продукты" />
          </Form.Item>

          <Form.Item label="Начальный баланс" name="balance" initialValue={0}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="0"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              suffix="₽"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSavingCategory}
              >
                {editingCategory ? "Обновить" : "Добавить"}
              </Button>
              <Button onClick={() => setIsCategoryModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модал установки лимита */}
      <Modal
        title="Установить лимит"
        open={isLimitModalVisible}
        onCancel={() => setIsLimitModalVisible(false)}
        footer={null}
        confirmLoading={isSavingLimit}
      >
        <Form form={limitForm} layout="vertical" onFinish={handleLimitSubmit}>
          <Form.Item label="Категория" name="category_name">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Месячный лимит"
            name="limit"
            rules={[
              { required: true, message: "Введите лимит" },
              { type: "number", min: 1, message: "Лимит должен быть больше 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Введите сумму лимита"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              suffix="₽"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSavingLimit}>
                Установить
              </Button>
              <Button onClick={() => setIsLimitModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
