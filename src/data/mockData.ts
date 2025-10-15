import type {
  User,
  Category,
  CategoryLimit,
  SavingsAccount,
  FinancialGoal,
  Loan,
  Operation,
  Report,
  Notification,
} from "../types";

export const mockUsers: User[] = [
  {
    user_id: 1,
    login: "user@example.com",
    password: "password123",
    visualname: "Иван Петров",
  },
  {
    user_id: 2,
    login: "admin@example.com",
    password: "admin123",
    visualname: "Администратор",
  },
];

export const mockCategories: Category[] = [
  { category_id: 1, user_id: 1, name: "Продукты", balance: 15000 },
  { category_id: 2, user_id: 1, name: "Транспорт", balance: 8000 },
  { category_id: 3, user_id: 1, name: "Развлечения", balance: 5000 },
  { category_id: 4, user_id: 1, name: "Здоровье", balance: 12000 },
  { category_id: 5, user_id: 1, name: "Коммунальные услуги", balance: 7000 },
];

export const mockCategoryLimits: CategoryLimit[] = [
  { user_id: 1, category_id: 1, limit: 20000 },
  { user_id: 1, category_id: 2, limit: 10000 },
  { user_id: 1, category_id: 3, limit: 8000 },
];

export const mockSavingsAccounts: SavingsAccount[] = [
  {
    id: 1,
    user_id: 1,
    saving_name: "Накопления на отпуск",
    balance: 85000,
    interest_rate: 8.5,
  },
  {
    id: 2,
    user_id: 1,
    saving_name: "Резервный фонд",
    balance: 150000,
    interest_rate: 7.2,
  },
  {
    id: 3,
    user_id: 1,
    saving_name: "На автомобиль",
    balance: 320000,
    interest_rate: 9.1,
  },
];

export const mockFinancialGoals: FinancialGoal[] = [
  { user_id: 1, goal_name: "Покупка квартиры", goal: 5000000 },
  { user_id: 1, goal_name: "Образование детей", goal: 1500000 },
  { user_id: 1, goal_name: "Пенсионные накопления", goal: 3000000 },
];

export const mockLoans: Loan[] = [
  {
    user_id: 1,
    credit_name: "Ипотека",
    loan_balance: 2800000,
    loan_payment: 35000,
    payment_date: "2025-10-15",
  },
  {
    user_id: 1,
    credit_name: "Автокредит",
    loan_balance: 450000,
    loan_payment: 18000,
    payment_date: "2025-10-20",
  },
];

export const mockOperations: Operation[] = [
  {
    operation_id: 1,
    user_id: 1,
    category_id: 1,
    type: "expense",
    transaction: -2500,
    date: "2025-09-28",
  },
  {
    operation_id: 2,
    user_id: 1,
    category_id: 2,
    type: "expense",
    transaction: -800,
    date: "2025-09-27",
  },
  {
    operation_id: 3,
    user_id: 1,
    category_id: 1,
    type: "expense",
    transaction: -1200,
    date: "2025-09-26",
  },
  {
    operation_id: 4,
    user_id: 1,
    category_id: 4,
    type: "income",
    transaction: 80000,
    date: "2025-09-25",
  },
  {
    operation_id: 5,
    user_id: 1,
    category_id: 3,
    type: "expense",
    transaction: -3000,
    date: "2025-09-24",
  },
];

export const mockReports: Report[] = [
  { user_id: 1, file: "monthly_report_september_2025.pdf" },
  { user_id: 1, file: "yearly_report_2024.pdf" },
];

export const mockNotifications: Notification[] = [
  {
    user_id: 1,
    message: "Приближается дата платежа по ипотеке (15 октября)",
  },
  {
    user_id: 1,
    message: 'Превышен лимит по категории "Развлечения"',
  },
  {
    user_id: 1,
    message: "Поступление зарплаты 80,000 ₽",
  },
];
