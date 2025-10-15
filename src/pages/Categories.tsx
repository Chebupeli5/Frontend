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
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  addCategoryLimit,
  deleteCategoryLimit,
} from "../store/appSlice";
import type { Category, CategoryLimit } from "../types";
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

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { categories, categoryLimits, operations } = useAppSelector(
    (state) => state.app
  );

  if (!currentUser) return null;

  const userCategories = categories.filter(
    (c) => c.user_id === currentUser.user_id
  );
  const userLimits = categoryLimits.filter(
    (cl) => cl.user_id === currentUser.user_id
  );

  const getCategoryData = (category: Category) => {
    const limit = userLimits.find(
      (l) => l.category_id === category.category_id
    );
    const monthlyExpenses = operations
      .filter(
        (op) =>
          op.category_id === category.category_id &&
          op.type === "expense" &&
          new Date(op.date).getMonth() === new Date().getMonth()
      )
      .reduce((sum, op) => sum + Math.abs(op.transaction), 0);

    const percentage = limit ? (monthlyExpenses / limit.limit) * 100 : 0;

    return {
      limit: limit?.limit || 0,
      spent: monthlyExpenses,
      percentage: Math.min(percentage, 100),
      hasLimit: !!limit,
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

  const handleDeleteCategory = (categoryId: number) => {
    dispatch(deleteCategory(categoryId));
    dispatch(
      deleteCategoryLimit({
        user_id: currentUser.user_id,
        category_id: categoryId,
      })
    );
    message.success("Категория удалена");
  };

  const handleCategorySubmit = (values: { name: string; balance: number }) => {
    if (editingCategory) {
      dispatch(updateCategory({ ...editingCategory, ...values }));
      message.success("Категория обновлена");
    } else {
      const newCategory: Category = {
        category_id: Math.max(...categories.map((c) => c.category_id), 0) + 1,
        user_id: currentUser.user_id,
        name: values.name,
        balance: values.balance || 0,
      };
      dispatch(addCategory(newCategory));
      message.success("Категория добавлена");
    }
    setIsCategoryModalVisible(false);
    categoryForm.resetFields();
  };

  const handleSetLimit = (categoryId: number) => {
    const category = userCategories.find((c) => c.category_id === categoryId);
    const limit = userLimits.find((l) => l.category_id === categoryId);

    setSelectedCategoryId(categoryId);
    limitForm.setFieldsValue({
      category_name: category?.name,
      limit: limit?.limit || 0,
    });
    setIsLimitModalVisible(true);
  };

  const handleLimitSubmit = (values: { limit: number }) => {
    if (selectedCategoryId) {
      const limitData: CategoryLimit = {
        user_id: currentUser.user_id,
        category_id: selectedCategoryId,
        limit: values.limit,
      };
      dispatch(addCategoryLimit(limitData));
      message.success("Лимит установлен");
      setIsLimitModalVisible(false);
      limitForm.resetFields();
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
          >
            Добавить категорию
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          {userCategories.map((category) => {
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
                    />,
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditCategory(category)}
                      title="Редактировать"
                    />,
                    <Popconfirm
                      title="Удалить категорию?"
                      description="Это действие нельзя отменить"
                      onConfirm={() =>
                        handleDeleteCategory(category.category_id)
                      }
                      okText="Да"
                      cancelText="Нет"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        title="Удалить"
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
      </Card>

      {/* Модал добавления/редактирования категории */}
      <Modal
        title={
          editingCategory ? "Редактировать категорию" : "Добавить категорию"
        }
        open={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        footer={null}
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
              <Button type="primary" htmlType="submit">
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
              <Button type="primary" htmlType="submit">
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
