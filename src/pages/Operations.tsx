import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Tag,
  Space,
  Card,
  message,
  Popconfirm,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { createNotification, checkLimitExceeded } from "../utils/notifications";
import type { Operation } from "../types";
import {
  useGetOperationsQuery,
  useCreateOperationMutation,
  useUpdateOperationMutation,
  useDeleteOperationMutation,
} from "../services/operationsApi";
import {
  useGetCategoriesQuery,
  useGetCategoryLimitsQuery,
} from "../services/categoriesApi";
import styles from "./Operations.module.css";

const { Option } = Select;

const Operations: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(
    null
  );
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
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
  const {
    data: operations = [],
    isLoading,
    isFetching,
  } = useGetOperationsQuery();
  const [createOperation, { isLoading: isCreating }] =
    useCreateOperationMutation();
  const [updateOperation, { isLoading: isUpdating }] =
    useUpdateOperationMutation();
  const [deleteOperationMutation, { isLoading: isDeleting }] =
    useDeleteOperationMutation();

  if (!currentUser) return null;

  const categories = categoriesData ?? [];
  const categoryLimits = categoryLimitsData ?? [];
  const isDataLoading =
    isLoading ||
    isFetching ||
    categoriesLoading ||
    categoriesFetching ||
    limitsLoading ||
    limitsFetching;
  const isProcessing = isCreating || isUpdating || isDeleting;

  const getLimitForCategory = (categoryId: number) => {
    const category = categories.find((c) => c.category_id === categoryId);
    const limitRecord = categoryLimits.find(
      (cl) => cl.category_id === categoryId
    );
    if (limitRecord?.limit !== undefined) {
      return limitRecord.limit;
    }
    if (category?.limit !== undefined && category.limit !== null) {
      return category.limit;
    }
    return undefined;
  };

  const columns: ColumnsType<Operation> = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString("ru-RU"),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Категория",
      dataIndex: "category_id",
      key: "category_id",
      render: (categoryId: number) => {
        const category = categories.find((c) => c.category_id === categoryId);
        return category?.name || "Неизвестная категория";
      },
      filters: categories.map((c) => ({
        text: c.name,
        value: c.category_id,
      })),
      onFilter: (value, record) => record.category_id === value,
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (type: "income" | "expense") => (
        <Tag color={type === "income" ? "green" : "red"}>
          {type === "income" ? "Доход" : "Расход"}
        </Tag>
      ),
      filters: [
        { text: "Доход", value: "income" },
        { text: "Расход", value: "expense" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Сумма",
      dataIndex: "transaction",
      key: "transaction",
      render: (amount: number, record) => (
        <span
          style={{ color: record.type === "income" ? "#52c41a" : "#f5222d" }}
        >
          {record.type === "income" ? "+" : "-"}
          {Math.abs(amount).toLocaleString("ru-RU")} ₽
        </span>
      ),
      sorter: (a, b) => Math.abs(a.transaction) - Math.abs(b.transaction),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить операцию?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(record.operation_id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingOperation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation);
    form.setFieldsValue({
      type: operation.type,
      category_id: operation.category_id,
      transaction: Math.abs(operation.transaction),
      date: dayjs(operation.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (operationId: number) => {
    try {
      await deleteOperationMutation(operationId).unwrap();
      message.success("Операция удалена");
    } catch {
      message.error("Не удалось удалить операцию");
    }
  };

  const handleSubmit = async (values: {
    type: "income" | "expense";
    category_id: number;
    transaction: number;
    date: dayjs.Dayjs;
  }) => {
    const transactionAmount = Math.round(Number(values.transaction));
    const payload = {
      category_id: values.category_id,
      type: values.type,
      transaction: transactionAmount,
      date: values.date.format("DD.MM.YYYY"),
    };

    try {
      if (editingOperation) {
        await updateOperation({
          id: editingOperation.operation_id,
          ...payload,
        }).unwrap();
        message.success("Операция обновлена");
      } else {
        const created = await createOperation(payload).unwrap();

        if (values.type === "expense") {
          const category = categories.find(
            (c) => c.category_id === values.category_id
          );
          const limitValue = getLimitForCategory(values.category_id);

          if (category && limitValue !== undefined) {
            const operationsWithCreated = operations.some(
              (op) => op.operation_id === created.operation_id
            )
              ? operations
              : [...operations, created];

            const now = new Date();

            const monthlyExpenses = operationsWithCreated
              .filter((op) => {
                if (
                  op.category_id !== values.category_id ||
                  op.type !== "expense"
                ) {
                  return false;
                }

                const opDate = new Date(op.date);
                return (
                  opDate.getMonth() === now.getMonth() &&
                  opDate.getFullYear() === now.getFullYear()
                );
              })
              .reduce((sum, op) => sum + Math.abs(op.transaction), 0);

            checkLimitExceeded(
              dispatch,
              currentUser.user_id,
              category.name,
              monthlyExpenses,
              limitValue
            );
          }
        }

        if (values.type === "income" && transactionAmount >= 10000) {
          createNotification(
            dispatch,
            currentUser.user_id,
            `Поступление дохода: +${transactionAmount.toLocaleString(
              "ru-RU"
            )} ₽`
          );
        }

        message.success("Операция добавлена");
      }

      setIsModalVisible(false);
      setEditingOperation(null);
      form.resetFields();
    } catch {
      message.error(
        editingOperation
          ? "Не удалось обновить операцию"
          : "Не удалось добавить операцию"
      );
    }
  };

  const totalIncome = operations
    .filter((o) => o.type === "income")
    .reduce((sum, o) => sum + Math.abs(o.transaction), 0);

  const totalExpenses = operations
    .filter((o) => o.type === "expense")
    .reduce((sum, o) => sum + Math.abs(o.transaction), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className={styles.operations}>
      <Card className={styles.summaryCard}>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Общий доход:</span>
            <span className={styles.incomeAmount}>
              +{totalIncome.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Общий расход:</span>
            <span className={styles.expenseAmount}>
              -{totalExpenses.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Баланс:</span>
            <span
              className={
                balance >= 0 ? styles.incomeAmount : styles.expenseAmount
              }
            >
              {balance >= 0 ? "+" : ""}
              {balance.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
      </Card>

      <Card
        title="История операций"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Добавить операцию
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={operations}
          rowKey="operation_id"
          loading={isDataLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} операций`,
          }}
        />
      </Card>

      <Modal
        title={
          editingOperation ? "Редактировать операцию" : "Добавить операцию"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingOperation(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Тип операции"
            name="type"
            rules={[{ required: true, message: "Выберите тип операции" }]}
          >
            <Select placeholder="Выберите тип">
              <Option value="income">Доход</Option>
              <Option value="expense">Расход</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Категория"
            name="category_id"
            rules={[{ required: true, message: "Выберите категорию" }]}
          >
            <Select placeholder="Выберите категорию">
              {categories.map((category) => (
                <Option key={category.category_id} value={category.category_id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Сумма"
            name="transaction"
            rules={[
              { required: true, message: "Введите сумму" },
              {
                type: "number",
                min: 1,
                message: "Сумма должна быть больше 0",
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Введите сумму"
              formatter={(value) =>
                value !== undefined && value !== null ? `${value} ₽` : ""
              }
            />
          </Form.Item>

          <Form.Item
            label="Дата"
            name="date"
            rules={[{ required: true, message: "Выберите дату" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD.MM.YYYY"
              placeholder="Выберите дату"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isProcessing}>
                {editingOperation ? "Сохранить" : "Добавить"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingOperation(null);
                  form.resetFields();
                }}
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Operations;
