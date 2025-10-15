import React from "react";
import {
  Card,
  List,
  Button,
  Empty,
  Tag,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  BellOutlined,
  DeleteOutlined,
  ClearOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { deleteNotification } from "../store/appSlice";
import styles from "./Notifications.module.css";

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.app);

  const hasNotifications = notifications.length > 0;

  const handleDeleteNotification = (index: number) => {
    dispatch(deleteNotification(index));
    message.success("Уведомление удалено");
  };

  const handleClearAll = () => {
    for (let i = notifications.length - 1; i >= 0; i -= 1) {
      dispatch(deleteNotification(i));
    }
    message.success("Все уведомления удалены");
  };

  const getNotificationType = (message: string) => {
    if (message.includes("Превышен лимит")) return { color: "red", icon: "⚠️" };
    if (message.includes("платежа")) return { color: "orange", icon: "💳" };
    if (message.includes("Поступление")) return { color: "green", icon: "💰" };
    if (message.includes("цель")) return { color: "blue", icon: "🎯" };
    return { color: "default", icon: "📢" };
  };

  return (
    <div className={styles.notifications}>
      <Card
        title={
          <Space>
            <BellOutlined />
            Уведомления
            {hasNotifications && (
              <Tag color="blue">{notifications.length}</Tag>
            )}
          </Space>
        }
        extra={
          hasNotifications && (
            <Popconfirm
              title="Удалить все уведомления?"
              description="Это действие нельзя отменить"
              onConfirm={handleClearAll}
              okText="Да"
              cancelText="Нет"
            >
              <Button icon={<ClearOutlined />} type="text" danger>
                Очистить все
              </Button>
            </Popconfirm>
          )
        }
      >
        {!hasNotifications ? (
          <div className={styles.emptyState}>
            <Empty
              image={<CheckCircleOutlined className={styles.emptyIcon} />}
              description={
                <div>
                  <p className={styles.emptyTitle}>Нет новых уведомлений</p>
                  <p className={styles.emptyDescription}>
                    Здесь будут отображаться важные уведомления о ваших финансах
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification, index) => {
              const notificationType = getNotificationType(
                notification.message
              );

              return (
                <List.Item
                  className={styles.notificationItem}
                  actions={[
                    <Popconfirm
                      title="Удалить уведомление?"
                      onConfirm={() => handleDeleteNotification(index)}
                      okText="Да"
                      cancelText="Нет"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                      />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className={styles.notificationAvatar}>
                        <span className={styles.notificationIcon}>
                          {notificationType.icon}
                        </span>
                      </div>
                    }
                    title={
                      <div className={styles.notificationHeader}>
                        <span className={styles.notificationMessage}>
                          {notification.message}
                        </span>
                        <Tag
                          color={notificationType.color}
                          className={styles.notificationTag}
                        >
                          {notification.message.includes("Превышен лимит") &&
                            "Лимит"}
                          {notification.message.includes("платежа") && "Платёж"}
                          {notification.message.includes("Поступление") &&
                            "Доход"}
                          {notification.message.includes("цель") && "Цель"}
                          {!notification.message.includes("Превышен лимит") &&
                            !notification.message.includes("платежа") &&
                            !notification.message.includes("Поступление") &&
                            !notification.message.includes("цель") &&
                            "Общее"}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className={styles.notificationFooter}>
                        <span className={styles.notificationTime}>
                          Только что
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Card
        title="Настройки уведомлений"
        style={{ marginTop: 24 }}
        size="small"
      >
        <div className={styles.settingsGrid}>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>
                💳 Напоминания о платежах
              </div>
              <div className={styles.settingDescription}>
                Уведомления о предстоящих платежах по кредитам
              </div>
            </div>
            <Tag color="green">Включено</Tag>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>⚠️ Превышение лимитов</div>
              <div className={styles.settingDescription}>
                Предупреждения при превышении установленных лимитов
              </div>
            </div>
            <Tag color="green">Включено</Tag>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>💰 Поступления доходов</div>
              <div className={styles.settingDescription}>
                Уведомления о поступлении средств на счета
              </div>
            </div>
            <Tag color="green">Включено</Tag>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>🎯 Достижение целей</div>
              <div className={styles.settingDescription}>
                Уведомления о прогрессе финансовых целей
              </div>
            </div>
            <Tag color="orange">В разработке</Tag>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
