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
  DatePicker,
  Space,
  message,
  Popconfirm,
  Statistic,
  Progress,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { addLoan, updateLoan, deleteLoan } from "../store/appSlice";
import type { Loan } from "../types";
import styles from "./Loans.module.css";

const Loans: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { loans } = useAppSelector((state) => state.app);

  if (!currentUser) return null;

  const userLoans = loans.filter((l) => l.user_id === currentUser.user_id);
  const totalDebt = userLoans.reduce((sum, loan) => sum + loan.loan_balance, 0);
  const totalMonthlyPayment = userLoans.reduce(
    (sum, loan) => sum + loan.loan_payment,
    0
  );

  const handleAdd = () => {
    setEditingLoan(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    form.setFieldsValue({
      ...loan,
      payment_date: dayjs(loan.payment_date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (creditName: string) => {
    dispatch(
      deleteLoan({
        user_id: currentUser.user_id,
        credit_name: creditName,
      })
    );
    message.success("Кредит удалён");
  };

  const handleSubmit = (values: {
    credit_name: string;
    loan_balance: number;
    loan_payment: number;
    payment_date: dayjs.Dayjs;
  }) => {
    if (editingLoan) {
      dispatch(
        updateLoan({
          user_id: currentUser.user_id,
          credit_name: values.credit_name,
          loan_balance: values.loan_balance,
          loan_payment: values.loan_payment,
          payment_date: values.payment_date.format("YYYY-MM-DD"),
        })
      );
      message.success("Кредит обновлён");
    } else {
      const newLoan: Loan = {
        user_id: currentUser.user_id,
        credit_name: values.credit_name,
        loan_balance: values.loan_balance,
        loan_payment: values.loan_payment,
        payment_date: values.payment_date.format("YYYY-MM-DD"),
      };
      dispatch(addLoan(newLoan));
      message.success("Кредит добавлен");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const getDaysUntilPayment = (paymentDate: string) => {
    const today = dayjs();
    const payment = dayjs(paymentDate);
    return payment.diff(today, "day");
  };

  const getPaymentStatus = (daysUntil: number) => {
    if (daysUntil < 0) return { status: "exception", text: "Просрочен" };
    if (daysUntil <= 3) return { status: "active", text: "Требует внимания" };
    if (daysUntil <= 7) return { status: "normal", text: "Скоро платёж" };
    return { status: "success", text: "В порядке" };
  };

  return (
    <div className={styles.loans}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Общая задолженность"
              value={totalDebt}
              precision={0}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
              prefix={<CreditCardOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Ежемесячный платёж"
              value={totalMonthlyPayment}
              precision={0}
              valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
              prefix={<WarningOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
      </Row>

      {totalDebt > 0 && (
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Alert
              message="Помните о своих финансовых обязательствах"
              description={`У вас ${
                userLoans.length
              } активных кредитов на общую сумму ${totalDebt.toLocaleString(
                "ru-RU"
              )} ₽. Следите за датами платежей.`}
              type="info"
              showIcon
            />
          </Col>
        </Row>
      )}

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Мои кредиты"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Добавить кредит
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {userLoans.map((loan) => {
                const daysUntil = getDaysUntilPayment(loan.payment_date);
                const paymentStatus = getPaymentStatus(daysUntil);
                const monthsLeft = Math.ceil(
                  loan.loan_balance / loan.loan_payment
                );

                return (
                  <Col xs={24} sm={12} lg={8} key={loan.credit_name}>
                    <Card
                      size="small"
                      className={styles.loanCard}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(loan)}
                          title="Редактировать"
                        />,
                        <Popconfirm
                          title="Удалить кредит?"
                          description="Это действие нельзя отменить"
                          onConfirm={() => handleDelete(loan.credit_name)}
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
                      <div className={styles.loanHeader}>
                        <CreditCardOutlined className={styles.loanIcon} />
                        <h4 className={styles.loanName}>{loan.credit_name}</h4>
                      </div>

                      <div className={styles.loanBalance}>
                        <Statistic
                          title="Остаток долга"
                          value={loan.loan_balance}
                          precision={0}
                          suffix="₽"
                          valueStyle={{ fontSize: "18px", color: "#f5222d" }}
                        />
                      </div>

                      <div className={styles.paymentSection}>
                        <div className={styles.paymentInfo}>
                          <div className={styles.paymentAmount}>
                            <span className={styles.paymentLabel}>
                              Ежемесячный платёж:
                            </span>
                            <span className={styles.paymentValue}>
                              {loan.loan_payment.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>

                          <div className={styles.paymentDate}>
                            <span className={styles.paymentLabel}>
                              Следующий платёж:
                            </span>
                            <span className={styles.paymentValue}>
                              {dayjs(loan.payment_date).format("DD.MM.YYYY")}
                            </span>
                          </div>

                          <div className={styles.daysUntil}>
                            <span className={styles.paymentLabel}>
                              До платежа:
                            </span>
                            <span
                              className={`${styles.paymentValue} ${
                                styles[
                                  paymentStatus.status as keyof typeof styles
                                ]
                              }`}
                            >
                              {daysUntil >= 0
                                ? `${daysUntil} дней`
                                : `просрочен на ${Math.abs(daysUntil)} дней`}
                            </span>
                          </div>
                        </div>

                        <div className={styles.progressSection}>
                          <div className={styles.progressLabel}>
                            Примерно осталось: {monthsLeft} месяцев
                          </div>
                          <Progress
                            percent={
                              ((loan.loan_payment * monthsLeft -
                                loan.loan_balance) /
                                (loan.loan_payment * monthsLeft)) *
                              100
                            }
                            status={
                              paymentStatus.status as
                                | "success"
                                | "active"
                                | "exception"
                                | "normal"
                            }
                            showInfo={false}
                            strokeWidth={8}
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {userLoans.length === 0 && (
              <div className={styles.emptyState}>
                <CreditCardOutlined className={styles.emptyIcon} />
                <p>У вас нет активных кредитов</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Добавить кредит
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingLoan ? "Редактировать кредит" : "Добавить кредит"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Название кредита"
            name="credit_name"
            rules={[{ required: true, message: "Введите название кредита" }]}
          >
            <Input placeholder="Например: Ипотека, Автокредит" />
          </Form.Item>

          <Form.Item
            label="Остаток задолженности"
            name="loan_balance"
            rules={[{ required: true, message: "Введите сумму задолженности" }]}
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
            label="Ежемесячный платёж"
            name="loan_payment"
            rules={[{ required: true, message: "Введите сумму платежа" }]}
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
            label="Дата следующего платежа"
            name="payment_date"
            rules={[{ required: true, message: "Выберите дату платежа" }]}
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
                {editingLoan ? "Обновить" : "Добавить"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Loans;
