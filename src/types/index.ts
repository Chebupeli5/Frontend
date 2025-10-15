export interface User {
  user_id: number;
  login: string;
  password?: string;
  visualname: string;
}

export interface Category {
  category_id: number;
  user_id: number;
  name: string;
  balance: number;
}

export interface CategoryLimit {
  user_id: number;
  category_id: number;
  limit: number;
}

export interface SavingsAccount {
  user_id: number;
  saving_name: string;
  balance: number;
  interest_rate: number;
}

export interface Asset {
  user_id: number;
  name: string;
  balance: number;
}

export interface FinancialGoal {
  user_id: number;
  goal_name: string;
  goal: number;
}

export interface Loan {
  user_id: number;
  credit_name: string;
  loan_balance: number;
  loan_payment: number;
  payment_date: string;
}

export interface Operation {
  operation_id: number;
  user_id: number;
  category_id: number;
  type: "income" | "expense";
  transaction: number;
  date: string;
}

export interface Report {
  user_id: number;
  file: string;
}

export interface Notification {
  user_id: number;
  message: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AppState {
  users: User[];
  categories: Category[];
  categoryLimits: CategoryLimit[];
  savingsAccounts: SavingsAccount[];
  assets: Asset[];
  financialGoals: FinancialGoal[];
  loans: Loan[];
  operations: Operation[];
  reports: Report[];
  notifications: Notification[];
}
