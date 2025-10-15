import React from "react";
import { Row, Col, Card, Statistic, Progress, List, Tag, Spin } from "antd";
import {
  WalletOutlined,
  BankOutlined,
  CreditCardOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../hooks/redux";
import { useGetOperationsQuery } from "../services/operationsApi";
import {
  useGetCategoriesQuery,
  useGetCategoryLimitsQuery,
} from "../services/categoriesApi";
import { useGetSavingsAccountsQuery } from "../services/savingsAccountsApi";
import { useGetAssetsQuery } from "../services/assetsApi";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { loans } = useAppSelector((state) => state.app);
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useGetCategoriesQuery();
  const {
    data: limitsData,
    isLoading: limitsLoading,
    isFetching: limitsFetching,
  } = useGetCategoryLimitsQuery();
  const {
    data: savingsAccountsData,
    isLoading: savingsLoading,
    isFetching: savingsFetching,
  } = useGetSavingsAccountsQuery();
  const shouldSkipAssetsQuery = !currentUser;
  const {
    data: assetsData,
    isLoading: assetsLoading,
    isFetching: assetsFetching,
  } = useGetAssetsQuery(undefined, { skip: shouldSkipAssetsQuery });
  const {
    data: operations = [],
    isLoading: operationsLoading,
    isFetching: operationsFetching,
  } = useGetOperationsQuery();

  if (!currentUser) return null;

  const categories = categoriesData ?? [];
  const categoryLimits = limitsData ?? [];
  const savingsAccounts = savingsAccountsData ?? [];
  const assets = assetsData ?? [];
  const isDataLoading =
    categoriesLoading ||
    categoriesFetching ||
    limitsLoading ||
    limitsFetching ||
    operationsLoading ||
    operationsFetching ||
    savingsLoading ||
    savingsFetching ||
    assetsLoading ||
    assetsFetching;

  const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0);
  const totalSavings = savingsAccounts.reduce(
    (sum, saving) => sum + saving.balance,
    0
  );
  const totalLoans = loans.reduce((sum, loan) => sum + loan.loan_balance, 0);

  const monthlyIncome = operations
    .filter((op) => {
      const date = new Date(op.date);
      const now = new Date();
      return (
        op.type === "income" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, op) => sum + Math.abs(op.transaction), 0);

  const monthlyExpenses = operations
    .filter((op) => {
      const date = new Date(op.date);
      const now = new Date();
      return (
        op.type === "expense" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, op) => sum + Math.abs(op.transaction), 0);

  const netWorth = totalAssets + totalSavings - totalLoans;

  const recentOperations = [...operations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const categorySpending = categories.map((category) => {
    const limitRecord = categoryLimits.find(
      (l) => l.category_id === category.category_id
    );
    const limitAmount = limitRecord?.limit ?? category.limit ?? 0;
    const spent = Math.abs(category.balance);
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
      <Spin spinning={isDataLoading} tip="Загрузка данных...">
        <div>
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
                  loading={operationsLoading || operationsFetching}
                  dataSource={recentOperations}
                  renderItem={(operation) => {
                    const category = categories.find(
                      (c) => c.category_id === operation.category_id
                    );
                    return (
                      <List.Item>
                        <div className={styles.operationItem}>
                          <div>
                            <div className={styles.operationCategory}>
                              {category?.name ?? "Категория"}
                            </div>
                            <div className={styles.operationDate}>
                              {new Date(operation.date).toLocaleDateString(
                                "ru-RU"
                              )}
                            </div>
                          </div>
                          <div className={styles.operationAmount}>
                            <Tag
                              color={
                                operation.type === "income" ? "green" : "red"
                              }
                            >
                              {operation.type === "income" ? "+" : "-"}
                              {Math.abs(operation.transaction).toLocaleString(
                                "ru-RU"
                              )}{" "}
                              ₽
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
                  {categorySpending.length === 0 && (
                    <Col span={24}>
                      <div
                        style={{
                          textAlign: "center",
                          padding: 16,
                          color: "#8c8c8c",
                        }}
                      >
                        Нет доступных категорий для отображения
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>
    </div>
  );
};

export default Dashboard;
