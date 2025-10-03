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
import { addOperation, deleteOperation } from "../store/appSlice";
import { createNotification, checkLimitExceeded } from "../utils/notifications";
import type { Operation } from "../types";
import styles from "./Operations.module.css";

const { Option } = Select;

const Operations: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { operations, categories, categoryLimits } = useAppSelector(
    (state) => state.app
  );

  if (!currentUser) return null;

  const userOperations = operations.filter(
    (o) => o.user_id === currentUser.user_id
  );
  const userCategories = categories.filter(
    (c) => c.user_id === currentUser.user_id
  );

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
        const category = userCategories.find(
          (c) => c.category_id === categoryId
        );
        return category?.name || "Неизвестная категория";
      },
      filters: userCategories.map((c) => ({
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
          {record.type === "income" ? "+" : ""}
          {amount.toLocaleString("ru-RU")} ₽
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
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (operation: Operation) => {
    form.setFieldsValue({
      ...operation,
      date: dayjs(operation.date),
      transaction: Math.abs(operation.transaction),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (operationId: number) => {
    dispatch(deleteOperation(operationId));
    message.success("Операция удалена");
  };

  const handleSubmit = (values: {
    type: "income" | "expense";
    category_id: number;
    transaction: number;
    date: dayjs.Dayjs;
  }) => {
    const newOperation: Operation = {
      operation_id: Math.max(...operations.map((o) => o.operation_id), 0) + 1,
      user_id: currentUser.user_id,
      category_id: values.category_id,
      type: values.type,
      transaction:
        values.type === "income" ? values.transaction : -values.transaction,
      date: values.date.format("YYYY-MM-DD"),
    };

    dispatch(addOperation(newOperation));

    // Проверка лимитов для расходов
    if (values.type === "expense") {
      const category = userCategories.find(
        (c) => c.category_id === values.category_id
      );
      const limit = categoryLimits.find(
        (cl) =>
          cl.user_id === currentUser.user_id &&
          cl.category_id === values.category_id
      );

      if (category && limit) {
        const monthlyExpenses =
          userOperations
            .filter(
              (op) =>
                op.category_id === values.category_id &&
                op.type === "expense" &&
                new Date(op.date).getMonth() === new Date().getMonth()
            )
            .reduce((sum, op) => sum + Math.abs(op.transaction), 0) +
          values.transaction;

        checkLimitExceeded(
          dispatch,
          currentUser.user_id,
          category.name,
          monthlyExpenses,
          limit.limit
        );
      }
    }

    // Уведомление о доходе
    if (values.type === "income" && values.transaction >= 10000) {
      createNotification(
        dispatch,
        currentUser.user_id,
        `Поступление дохода: +${values.transaction.toLocaleString("ru-RU")} ₽`
      );
    }

    message.success("Операция добавлена");
    setIsModalVisible(false);
    form.resetFields();
  };

  const totalIncome = userOperations
    .filter((o) => o.type === "income")
    .reduce((sum, o) => sum + Math.abs(o.transaction), 0);

  const totalExpenses = userOperations
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
          dataSource={userOperations}
          rowKey="operation_id"
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
        title="Добавить операцию"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
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
              {userCategories.map((category) => (
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
                min: 0.01,
                message: "Сумма должна быть больше 0",
              },
            ]}
          >
            <InputNumber
              placeholder="Введите сумму"
              formatter={(value) => `${value} ₽`}
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
              <Button type="primary" htmlType="submit">
                Добавить
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Operations;
