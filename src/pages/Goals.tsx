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
  TagOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import {
  addFinancialGoal,
  updateFinancialGoal,
  deleteFinancialGoal,
} from "../store/appSlice";
import type { FinancialGoal } from "../types";
import { useGetAssetsQuery } from "../services/assetsApi";
import styles from "./Goals.module.css";

const Goals: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { financialGoals, savingsAccounts } = useAppSelector(
    (state) => state.app
  );
  const shouldSkipAssetsQuery = !currentUser;
  const { data: assetsData } = useGetAssetsQuery(undefined, {
    skip: shouldSkipAssetsQuery,
  });

  if (!currentUser) return null;

  const assets = assetsData ?? [];
  const savingsAccountsList = savingsAccounts ?? [];
  const totalWealth =
    assets.reduce((sum, asset) => sum + asset.balance, 0) +
    savingsAccountsList.reduce((sum, saving) => sum + saving.balance, 0);

  const handleAdd = () => {
    setEditingGoal(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    form.setFieldsValue(goal);
    setIsModalVisible(true);
  };

  const handleDelete = (goalName: string) => {
    dispatch(deleteFinancialGoal(goalName));
    message.success("Цель удалена");
  };

  const handleSubmit = (values: { goal_name: string; goal: number }) => {
    if (editingGoal) {
      dispatch(
        updateFinancialGoal({
          user_id: currentUser.user_id,
          goal_name: values.goal_name,
          goal: values.goal,
        })
      );
      message.success("Цель обновлена");
    } else {
      const newGoal: FinancialGoal = {
        user_id: currentUser.user_id,
        goal_name: values.goal_name,
        goal: values.goal,
      };
      dispatch(addFinancialGoal(newGoal));
      message.success("Цель добавлена");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const calculateProgress = (goalAmount: number) => {
    const progress = (totalWealth / goalAmount) * 100;
    return Math.min(progress, 100);
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return "success";
    if (progress >= 75) return "active";
    if (progress >= 50) return "normal";
    return "exception";
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 100) return "🎉 Цель достигнута! Поздравляем!";
    if (progress >= 75) return "🔥 Отличный прогресс! Ещё немного!";
    if (progress >= 50) return "💪 Хорошая работа! Продолжайте!";
    if (progress >= 25) return "📈 Вы на правильном пути!";
    return "🚀 Начало положено! Двигайтесь к цели!";
  };

  const totalGoals = financialGoals.reduce((sum, goal) => sum + goal.goal, 0);
  const achievedGoalsCount = financialGoals.filter(
    (goal) => calculateProgress(goal.goal) >= 100
  ).length;

  return (
    <div className={styles.goals}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Общий капитал"
              value={totalWealth}
              precision={0}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
              prefix={<TrophyOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Сумма всех целей"
              value={totalGoals}
              precision={0}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
              prefix={<TagOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Мои финансовые цели"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Добавить цель
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {financialGoals.map((goal) => {
                const progress = calculateProgress(goal.goal);
                const progressStatus = getProgressStatus(progress);
                const motivationalMessage = getMotivationalMessage(progress);
                const remainingAmount = Math.max(goal.goal - totalWealth, 0);

                return (
                  <Col xs={24} sm={12} lg={8} key={goal.goal_name}>
                    <Card
                      size="small"
                      className={styles.goalCard}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(goal)}
                          title="Редактировать"
                        />,
                        <Popconfirm
                          title="Удалить цель?"
                          description="Это действие нельзя отменить"
                          onConfirm={() => handleDelete(goal.goal_name)}
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
                      <div className={styles.goalHeader}>
                        <TagOutlined className={styles.goalIcon} />
                        <h4 className={styles.goalName}>{goal.goal_name}</h4>
                      </div>

                      <div className={styles.goalAmount}>
                        <Statistic
                          title="Целевая сумма"
                          value={goal.goal}
                          precision={0}
                          suffix="₽"
                          valueStyle={{ fontSize: "18px", color: "#1890ff" }}
                        />
                      </div>

                      <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                          <span className={styles.progressLabel}>Прогресс</span>
                          <span className={styles.progressValue}>
                            {progress.toFixed(1)}%
                          </span>
                        </div>

                        <Progress
                          percent={progress}
                          status={progressStatus}
                          strokeWidth={12}
                          showInfo={false}
                        />

                        <div className={styles.progressDetails}>
                          <div className={styles.currentAmount}>
                            Накоплено: {totalWealth.toLocaleString("ru-RU")} ₽
                          </div>
                          <div className={styles.remainingAmount}>
                            Осталось: {remainingAmount.toLocaleString("ru-RU")}{" "}
                            ₽
                          </div>
                        </div>

                        <div className={styles.motivationalMessage}>
                          {motivationalMessage}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {financialGoals.length === 0 && (
              <div className={styles.emptyState}>
                <TagOutlined className={styles.emptyIcon} />
                <p>У вас пока нет финансовых целей</p>
                <p className={styles.emptySubtext}>
                  Поставьте цели и отслеживайте свой прогресс!
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  size="large"
                >
                  Поставить первую цель
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

    {financialGoals.length > 0 && (
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Общий прогресс" size="small">
              <div className={styles.overallProgress}>
                <div className={styles.overallStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Целей поставлено:</span>
                    <span className={styles.statValue}>{financialGoals.length}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Целей достигнуто:</span>
                    <span className={styles.statValue}>{achievedGoalsCount}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Общий прогресс:</span>
                    <span className={styles.statValue}>
                      {totalGoals > 0
                        ? ((totalWealth / totalGoals) * 100).toFixed(1)
                        : "0.0"}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        title={editingGoal ? "Редактировать цель" : "Добавить цель"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Название цели"
            name="goal_name"
            rules={[{ required: true, message: "Введите название цели" }]}
          >
            <Input placeholder="Например: Покупка автомобиля" />
          </Form.Item>

          <Form.Item
            label="Целевая сумма"
            name="goal"
            rules={[
              { required: true, message: "Введите целевую сумму" },
              { type: "number", min: 1, message: "Сумма должна быть больше 0" },
            ]}
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

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingGoal ? "Обновить" : "Добавить"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Goals;
