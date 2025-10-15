import React from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Spin } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  WalletOutlined,
  BankOutlined,
  CreditCardOutlined,
  TagOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../store/authSlice";
import { useLogoutMutation } from "../../services/authApi";
import styles from "./AppLayout.module.css";

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { currentUser, refreshToken } = useAppSelector((state) => state.auth);
  const notifications = useAppSelector((state) => state.app.notifications);
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logoutRequest({ refreshToken }).unwrap();
      }
    } catch (error) {
      console.error("Ошибка при выходе", error);
    } finally {
      dispatch(logout());
      navigate("/auth");
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Профиль",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Настройки",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: isLoggingOut ? "Выход..." : "Выйти",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      disabled: isLoggingOut,
    },
  ];

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      label: "Главная",
      icon: <DashboardOutlined />,
    },
    {
      key: "/operations",
      label: "Операции",
      icon: <FileTextOutlined />,
    },
    {
      key: "/categories",
      label: "Категории",
      icon: <WalletOutlined />,
    },
    {
      key: "/assets",
      label: "Счета",
      icon: <CreditCardOutlined />,
    },
    {
      key: "/savings",
      label: "Накопления",
      icon: <BankOutlined />,
    },
    {
      key: "/loans",
      label: "Кредиты",
      icon: <CreditCardOutlined />,
    },
    {
      key: "/goals",
      label: "Цели",
      icon: <TagOutlined />,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  if (!currentUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className={styles.layout}>
      <Sider theme="light" width={250} className={styles.sider}>
        <div className={styles.logo}>
          <WalletOutlined className={styles.logoIcon} />
          <span className={styles.logoText}>Finansik</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.menu}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>
              {(() => {
                const item = menuItems.find(
                  (item) => item?.key === location.pathname
                );
                return (
                  item && "label" in item ? item.label : "Finansik"
                ) as string;
              })()}
            </div>
            <div className={styles.headerActions}>
              <Badge
                count={notifications.length}
                className={styles.notificationBadge}
              >
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  size="large"
                  onClick={() => navigate("/notifications")}
                />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text" className={styles.userButton}>
                  <Avatar icon={!currentUser.visualname ? <UserOutlined /> : undefined}>
                    {currentUser.visualname
                      ? currentUser.visualname.charAt(0).toUpperCase()
                      : undefined}
                  </Avatar>
                  <span className={styles.userName}>
                    {currentUser?.visualname}
                  </span>
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
