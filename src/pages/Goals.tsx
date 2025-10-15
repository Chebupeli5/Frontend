import React, { useMemo, useState } from "react";
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
  Spin,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../hooks/redux";
import type { FinancialGoal } from "../types";
import { useGetAssetsQuery } from "../services/assetsApi";
import { useGetSavingsAccountsQuery } from "../services/savingsAccountsApi";
import {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useGetGoalsSummaryQuery,
  type UpdateGoalRequest,
} from "../services/goalsApi";
import styles from "./Goals.module.css";

const Goals: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [form] = Form.useForm();

  const { currentUser } = useAppSelector((state) => state.auth);
  const shouldSkipQueries = !currentUser;
  const {
    data: goalsData,
    isLoading: goalsLoading,
    isFetching: goalsFetching,
  } = useGetGoalsQuery(undefined, { skip: shouldSkipQueries });
  const {
    data: goalsSummary,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
  } = useGetGoalsSummaryQuery(undefined, { skip: shouldSkipQueries });
  const {
    data: assetsData,
    isLoading: assetsLoading,
    isFetching: assetsFetching,
  } = useGetAssetsQuery(undefined, { skip: shouldSkipQueries });
  const {
    data: savingsAccountsData,
    isLoading: savingsLoading,
    isFetching: savingsFetching,
  } = useGetSavingsAccountsQuery(undefined, { skip: shouldSkipQueries });
  const [createGoal, { isLoading: isCreating }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: isUpdating }] = useUpdateGoalMutation();
  const [deleteGoal, { isLoading: isDeleting }] = useDeleteGoalMutation();

  const goals = useMemo(() => goalsData ?? [], [goalsData]);
  const assets = useMemo(() => assetsData ?? [], [assetsData]);
  const savingsAccounts = useMemo(
    () => savingsAccountsData ?? [],
    [savingsAccountsData]
  );
  const totalWealth = useMemo(
    () =>
      assets.reduce((sum, asset) => sum + asset.balance, 0) +
      savingsAccounts.reduce((sum, saving) => sum + saving.balance, 0),
    [assets, savingsAccounts]
  );
  const totalTargetAmount = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.goal, 0),
    [goals]
  );
  const totalCurrentAmount = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.current_amount, 0),
    [goals]
  );
  const completedGoalsCount = useMemo(
    () => goals.filter((goal) => goal.is_completed).length,
    [goals]
  );

  const summaryTargetAmount = goalsSummary?.total_target_amount;
  const summaryCompleted = goalsSummary?.completed_goals;
  const summaryTotalGoals = goalsSummary?.total_goals;
  const summaryCompletionRate = goalsSummary?.completion_rate;

  const goalsCount = summaryTotalGoals ?? goals.length;
  const achievedGoalsCount = summaryCompleted ?? completedGoalsCount;
  const totalGoalsAmount = summaryTargetAmount ?? totalTargetAmount;
  const overallProgress =
    summaryCompletionRate ??
    (totalGoalsAmount > 0
      ? Math.min((totalCurrentAmount / totalGoalsAmount) * 100, 100)
      : 0);

  const isModalSubmitting = isCreating || isUpdating;
  const isDataLoading =
    goalsLoading ||
    goalsFetching ||
    summaryLoading ||
    summaryFetching ||
    assetsLoading ||
    assetsFetching ||
    savingsLoading ||
    savingsFetching;

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingGoal(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingGoal(null);
    form.resetFields();
    openModal();
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    form.setFieldsValue({
      goal_name: goal.goal_name,
      goal: goal.goal,
      current_amount_delta: undefined,
      is_completed: goal.is_completed,
    });
    openModal();
  };

  const handleDelete = async (goalId: number) => {
    try {
      await deleteGoal(goalId).unwrap();
      message.success("Цель удалена");
    } catch (error) {
      console.error("Failed to delete goal", error);
      message.error("Не удалось удалить цель");
    }
  };

  const handleSubmit = async (values: {
    goal_name: string;
    goal: number;
    current_amount_delta?: number;
    is_completed?: boolean;
  }) => {
    const payload = {
      goal_name: values.goal_name,
      goal: Number(values.goal),
    };

    try {
      if (editingGoal) {
        const updates: UpdateGoalRequest = {
          id: editingGoal.id,
          ...payload,
        };

        const delta = Number(values.current_amount_delta || 0);
        if (delta > 0) {
          updates.current_amount = editingGoal.current_amount + delta;
        }

        if (typeof values.is_completed === "boolean") {
          updates.is_completed = values.is_completed;
        }

        await updateGoal(updates).unwrap();
        message.success("Цель обновлена");
      } else {
        await createGoal(payload).unwrap();
        message.success("Цель добавлена");
      }
      closeModal();
    } catch (error) {
      console.error("Failed to submit goal", error);
      message.error("Не удалось сохранить цель");
    }
  };

  const calculateProgress = (goal: FinancialGoal) => {
    if (goal.goal <= 0) return 0;
    const progress = (goal.current_amount / goal.goal) * 100;
    return Math.min(progress, 100);
  };

  const getProgressStatus = (
    goal: FinancialGoal,
    progress: number
  ): "success" | "exception" | "active" | "normal" => {
    if (goal.is_completed || progress >= 100) return "success";
    if (progress >= 75) return "active";
    if (progress >= 50) return "normal";
    return "exception";
  };

  const getMotivationalMessage = (goal: FinancialGoal, progress: number) => {
    if (goal.is_completed || progress >= 100)
      return "🎉 Цель достигнута! Поздравляем!";
    if (progress >= 75) return "🔥 Отличный прогресс! Ещё немного!";
    if (progress >= 50) return "💪 Хорошая работа! Продолжайте!";
    if (progress >= 25) return "📈 Вы на правильном пути!";
    return "🚀 Начало положено! Двигайтесь к цели!";
  };

  if (!currentUser) return null;

  return (
    <div className={styles.goals}>
      <Spin spinning={isDataLoading} tip="Загрузка целей...">
        <div>
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
                  value={totalGoalsAmount}
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
                  {goals.map((goal) => {
                    const progress = calculateProgress(goal);
                    const progressStatus = getProgressStatus(goal, progress);
                    const motivationalMessage = getMotivationalMessage(
                      goal,
                      progress
                    );
                    const remainingAmount = Math.max(
                      goal.goal - goal.current_amount,
                      0
                    );

                    return (
                      <Col xs={24} sm={12} lg={8} key={goal.id}>
                        <Card
                          size="small"
                          className={styles.goalCard}
                          actions={[
                            <Button
                              key="edit"
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(goal)}
                              title="Редактировать"
                            />,
                            <Popconfirm
                              key="delete"
                              title="Удалить цель?"
                              description="Это действие нельзя отменить"
                              onConfirm={() => handleDelete(goal.id)}
                              okText="Да"
                              cancelText="Нет"
                            >
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                title="Удалить"
                                loading={isDeleting}
                              />
                            </Popconfirm>,
                          ]}
                        >
                          <div className={styles.goalHeader}>
                            <TagOutlined className={styles.goalIcon} />
                            <h4 className={styles.goalName}>
                              {goal.goal_name}
                            </h4>
                          </div>

                          <div className={styles.goalAmount}>
                            <Statistic
                              title="Целевая сумма"
                              value={goal.goal}
                              precision={0}
                              suffix="₽"
                              valueStyle={{
                                fontSize: "18px",
                                color: "#1890ff",
                              }}
                            />
                          </div>

                          <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                              <span className={styles.progressLabel}>
                                Прогресс
                              </span>
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
                                Накоплено:{" "}
                                {goal.current_amount.toLocaleString("ru-RU")} ₽
                              </div>
                              <div className={styles.remainingAmount}>
                                Осталось:{" "}
                                {remainingAmount.toLocaleString("ru-RU")} ₽
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

                {goals.length === 0 && !isDataLoading && (
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

          {goalsCount > 0 && (
            <Row style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card title="Общий прогресс" size="small">
                  <div className={styles.overallProgress}>
                    <div className={styles.overallStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                          Целей поставлено:
                        </span>
                        <span className={styles.statValue}>{goalsCount}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                          Целей достигнуто:
                        </span>
                        <span className={styles.statValue}>
                          {achievedGoalsCount}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                          Накоплено по целям:
                        </span>
                        <span className={styles.statValue}>
                          {totalCurrentAmount.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                          Общий прогресс:
                        </span>
                        <span className={styles.statValue}>
                          {overallProgress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </Spin>

      <Modal
        title={editingGoal ? "Редактировать цель" : "Добавить цель"}
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={
            editingGoal
              ? {
                  goal_name: editingGoal.goal_name,
                  goal: editingGoal.goal,
                  is_completed: editingGoal.is_completed,
                }
              : {
                  goal_name: "",
                  goal: null,
                  is_completed: false,
                }
          }
        >
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
              parser={(value) =>
                value ? value.replace(/\$\s?|(,*)/g, "") : ""
              }
              suffix="₽"
            />
          </Form.Item>

          {editingGoal && (
            <>
              <Form.Item
                label="Добавить к накоплению"
                name="current_amount_delta"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    message: "Сумма должна быть неотрицательной",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? value.replace(/\$\s?|(,*)/g, "") : ""
                  }
                  suffix="₽"
                />
              </Form.Item>

              <Form.Item
                label="Статус цели"
                name="is_completed"
                valuePropName="checked"
              >
                <Checkbox
                  checked={form.getFieldValue("is_completed")}
                  disabled={editingGoal?.is_completed === true}
                >
                  Цель достигнута
                </Checkbox>
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isModalSubmitting}
                disabled={isModalSubmitting}
              >
                {editingGoal ? "Обновить" : "Добавить"}
              </Button>
              <Button onClick={closeModal}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Goals;
