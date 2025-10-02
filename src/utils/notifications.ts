import type { AppDispatch } from "../store";
import { addNotification } from "../store/appSlice";
import type { Notification } from "../types";

export const createNotification = (
  dispatch: AppDispatch,
  userId: number,
  message: string
) => {
  const notification: Notification = {
    user_id: userId,
    message,
  };
  dispatch(addNotification(notification));
};

export const checkLimitExceeded = (
  dispatch: AppDispatch,
  userId: number,
  categoryName: string,
  spent: number,
  limit: number
) => {
  if (spent > limit) {
    createNotification(
      dispatch,
      userId,
      `Превышен лимит по категории "${categoryName}": потрачено ${spent.toLocaleString(
        "ru-RU"
      )} ₽ из ${limit.toLocaleString("ru-RU")} ₽`
    );
  }
};

export const notifyLoanPaymentDue = (
  dispatch: AppDispatch,
  userId: number,
  creditName: string,
  daysLeft: number
) => {
  if (daysLeft <= 3 && daysLeft >= 0) {
    createNotification(
      dispatch,
      userId,
      `Приближается дата платежа по "${creditName}" (осталось ${daysLeft} дней)`
    );
  } else if (daysLeft < 0) {
    createNotification(
      dispatch,
      userId,
      `Просрочен платёж по "${creditName}" (просрочка: ${Math.abs(
        daysLeft
      )} дней)`
    );
  }
};

export const notifyGoalAchieved = (
  dispatch: AppDispatch,
  userId: number,
  goalName: string
) => {
  createNotification(
    dispatch,
    userId,
    `🎉 Поздравляем! Цель "${goalName}" достигнута!`
  );
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const calculateDaysUntilDate = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
