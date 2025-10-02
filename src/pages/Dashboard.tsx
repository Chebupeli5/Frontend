import React from "react";
import { Row, Col, Card, Statistic, Progress, List, Tag } from "antd";
import {
  WalletOutlined,
  BankOutlined,
  CreditCardOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../hooks/redux";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.auth);
  const {
    categories,
    assets,
    savingsAccounts,
    loans,
    operations,
    categoryLimits,
  } = useAppSelector((state) => state.app);

  if (!currentUser) return null;

  const userCategories = categories.filter(
    (c) => c.user_id === currentUser.user_id
  );
  const userAssets = assets.filter((a) => a.user_id === currentUser.user_id);
  const userSavings = savingsAccounts.filter(
    (sa) => sa.user_id === currentUser.user_id
  );
  const userLoans = loans.filter((l) => l.user_id === currentUser.user_id);
  const userOperations = operations.filter(
    (o) => o.user_id === currentUser.user_id
  );
  const userLimits = categoryLimits.filter(
    (cl) => cl.user_id === currentUser.user_id
  );

  const totalAssets = userAssets.reduce((sum, asset) => sum + asset.balance, 0);
  const totalSavings = userSavings.reduce(
    (sum, saving) => sum + saving.balance,
    0
  );
  const totalLoans = userLoans.reduce(
    (sum, loan) => sum + loan.loan_balance,
    0
  );

  const monthlyIncome = userOperations
    .filter(
      (op) =>
        op.type === "income" &&
        new Date(op.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, op) => sum + Math.abs(op.transaction), 0);

  const monthlyExpenses = userOperations
    .filter(
      (op) =>
        op.type === "expense" &&
        new Date(op.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, op) => sum + Math.abs(op.transaction), 0);

  const netWorth = totalAssets + totalSavings - totalLoans;

  const recentOperations = userOperations
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const categorySpending = userCategories.map((category) => {
    const limit = userLimits.find(
      (l) => l.category_id === category.category_id
    );
    const spent = Math.abs(category.balance);
    const limitAmount = limit?.limit || 0;
    const percentage = limitAmount > 0 ? (spent / limitAmount) * 100 : 0;

    return {
      ...category,
      spent,
      limit: limitAmount,
      percentage: Math.min(percentage, 100),
    };
  });

  return (
    <div className={styles.dashboard}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Общий капитал"
              value={netWorth}
              precision={0}
              valueStyle={{ color: netWorth >= 0 ? "#3f8600" : "#cf1322" }}
              prefix={netWorth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Счета"
              value={totalAssets}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CreditCardOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Накопления"
              value={totalSavings}
              precision={0}
              valueStyle={{ color: "#52c41a" }}
              prefix={<BankOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Кредиты"
              value={totalLoans}
              precision={0}
              valueStyle={{ color: "#f5222d" }}
              prefix={<WalletOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Доходы и расходы за месяц"
            className={styles.incomeExpenseCard}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Доходы"
                  value={monthlyIncome}
                  precision={0}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<RiseOutlined />}
                  suffix="₽"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Расходы"
                  value={monthlyExpenses}
                  precision={0}
                  valueStyle={{ color: "#f5222d" }}
                  prefix={<FallOutlined />}
                  suffix="₽"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Последние операции">
            <List
              size="small"
              dataSource={recentOperations}
              renderItem={(operation) => {
                const category = userCategories.find(
                  (c) => c.category_id === operation.category_id
                );
                return (
                  <List.Item>
                    <div className={styles.operationItem}>
                      <div>
                        <div className={styles.operationCategory}>
                          {category?.name}
                        </div>
                        <div className={styles.operationDate}>
                          {new Date(operation.date).toLocaleDateString("ru-RU")}
                        </div>
                      </div>
                      <div className={styles.operationAmount}>
                        <Tag
                          color={operation.type === "income" ? "green" : "red"}
                        >
                          {operation.type === "income" ? "+" : ""}
                          {operation.transaction.toLocaleString("ru-RU")} ₽
                        </Tag>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Лимиты по категориям">
            <Row gutter={[16, 16]}>
              {categorySpending.map((category) => (
                <Col xs={24} sm={12} lg={8} key={category.category_id}>
                  <div className={styles.categoryLimit}>
                    <div className={styles.categoryHeader}>
                      <span className={styles.categoryName}>
                        {category.name}
                      </span>
                      <span className={styles.categoryAmount}>
                        {category.spent.toLocaleString("ru-RU")} /{" "}
                        {category.limit.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    <Progress
                      percent={category.percentage}
                      status={
                        category.percentage > 90
                          ? "exception"
                          : category.percentage > 70
                          ? "active"
                          : "normal"
                      }
                      showInfo={false}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
