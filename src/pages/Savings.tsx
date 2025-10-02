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
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import {
  addSavingsAccount,
  updateSavingsAccount,
  deleteSavingsAccount,
} from "../store/appSlice";
import type { SavingsAccount } from "../types";
import styles from "./Savings.module.css";

const Savings: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSaving, setEditingSaving] = useState<SavingsAccount | null>(
    null
  );
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { savingsAccounts } = useAppSelector((state) => state.app);

  if (!currentUser) return null;

  const userSavings = savingsAccounts.filter(
    (sa) => sa.user_id === currentUser.user_id
  );
  const totalSavings = userSavings.reduce(
    (sum, saving) => sum + saving.balance,
    0
  );
  const averageRate =
    userSavings.length > 0
      ? userSavings.reduce((sum, saving) => sum + saving.interest_rate, 0) /
        userSavings.length
      : 0;

  const handleAdd = () => {
    setEditingSaving(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (saving: SavingsAccount) => {
    setEditingSaving(saving);
    form.setFieldsValue(saving);
    setIsModalVisible(true);
  };

  const handleDelete = (savingName: string) => {
    dispatch(
      deleteSavingsAccount({
        user_id: currentUser.user_id,
        saving_name: savingName,
      })
    );
    message.success("Накопительный счёт удалён");
  };

  const handleSubmit = (values: {
    saving_name: string;
    balance: number;
    interest_rate: number;
  }) => {
    if (editingSaving) {
      dispatch(
        updateSavingsAccount({
          user_id: currentUser.user_id,
          saving_name: values.saving_name,
          balance: values.balance,
          interest_rate: values.interest_rate,
        })
      );
      message.success("Накопительный счёт обновлён");
    } else {
      const newSaving: SavingsAccount = {
        user_id: currentUser.user_id,
        saving_name: values.saving_name,
        balance: values.balance,
        interest_rate: values.interest_rate,
      };
      dispatch(addSavingsAccount(newSaving));
      message.success("Накопительный счёт добавлен");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const calculateYearlyReturn = (balance: number, rate: number) => {
    return (balance * rate) / 100;
  };

  return (
    <div className={styles.savings}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Общие накопления"
              value={totalSavings}
              precision={0}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
              prefix={<BankOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Средняя процентная ставка"
              value={averageRate}
              precision={1}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
              prefix={<PercentageOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Накопительные счета"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Добавить счёт
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {userSavings.map((saving) => {
                const yearlyReturn = calculateYearlyReturn(
                  saving.balance,
                  saving.interest_rate
                );
                const monthlyReturn = yearlyReturn / 12;

                return (
                  <Col xs={24} sm={12} lg={8} key={saving.saving_name}>
                    <Card
                      size="small"
                      className={styles.savingCard}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(saving)}
                          title="Редактировать"
                        />,
                        <Popconfirm
                          title="Удалить счёт?"
                          description="Это действие нельзя отменить"
                          onConfirm={() => handleDelete(saving.saving_name)}
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
                      <div className={styles.savingHeader}>
                        <BankOutlined className={styles.savingIcon} />
                        <h4 className={styles.savingName}>
                          {saving.saving_name}
                        </h4>
                      </div>

                      <div className={styles.savingBalance}>
                        <Statistic
                          title="Накоплено"
                          value={saving.balance}
                          precision={0}
                          suffix="₽"
                          valueStyle={{ fontSize: "20px", color: "#52c41a" }}
                        />
                      </div>

                      <div className={styles.rateSection}>
                        <div className={styles.rateDisplay}>
                          <span className={styles.rateLabel}>
                            Процентная ставка:
                          </span>
                          <span className={styles.rateValue}>
                            {saving.interest_rate}%
                          </span>
                        </div>

                        <div className={styles.returns}>
                          <div className={styles.returnItem}>
                            <span className={styles.returnLabel}>
                              Доход в месяц:
                            </span>
                            <span className={styles.returnValue}>
                              +
                              {monthlyReturn.toLocaleString("ru-RU", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              ₽
                            </span>
                          </div>
                          <div className={styles.returnItem}>
                            <span className={styles.returnLabel}>
                              Доход в год:
                            </span>
                            <span className={styles.returnValue}>
                              +
                              {yearlyReturn.toLocaleString("ru-RU", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              ₽
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {userSavings.length === 0 && (
              <div className={styles.emptyState}>
                <BankOutlined className={styles.emptyIcon} />
                <p>У вас пока нет накопительных счетов</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Создать первый счёт
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          editingSaving
            ? "Редактировать накопительный счёт"
            : "Добавить накопительный счёт"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Название счёта"
            name="saving_name"
            rules={[{ required: true, message: "Введите название счёта" }]}
          >
            <Input placeholder="Например: Накопления на отпуск" />
          </Form.Item>

          <Form.Item
            label="Текущий баланс"
            name="balance"
            rules={[{ required: true, message: "Введите баланс" }]}
          >
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

          <Form.Item
            label="Процентная ставка (годовая)"
            name="interest_rate"
            rules={[
              { required: true, message: "Введите процентную ставку" },
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Ставка должна быть от 0 до 100%",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="8.5"
              step={0.1}
              formatter={(value) => `${value}%`}
              parser={(value) => value!.replace("%", "")}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSaving ? "Обновить" : "Добавить"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Savings;
