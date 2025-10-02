import React, { useState } from "react";
import { Form, Input, Button, Card, message, Tabs } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";
import styles from "./Auth.module.css";

const { TabPane } = Tabs;

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState("login");
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const users = useAppSelector((state) => state.app.users);

  const onFinishLogin = (values: { login: string; password: string }) => {
    dispatch(loginStart());

    // Имитация запроса к API
    setTimeout(() => {
      const user = users.find(
        (u) => u.login === values.login && u.password === values.password
      );

      if (user) {
        dispatch(loginSuccess(user));
        message.success("Успешная авторизация!");
      } else {
        dispatch(loginFailure());
        message.error("Неверный логин или пароль");
      }
    }, 1000);
  };

  const onFinishRegister = (values: {
    login: string;
    password: string;
    visualname: string;
  }) => {
    dispatch(loginStart());

    // Имитация регистрации
    setTimeout(() => {
      const existingUser = users.find((u) => u.login === values.login);

      if (existingUser) {
        dispatch(loginFailure());
        message.error("Пользователь с таким email уже существует");
        return;
      }

      const newUser = {
        user_id: Math.max(...users.map((u) => u.user_id), 0) + 1,
        login: values.login,
        password: values.password,
        visualname: values.visualname,
      };

      dispatch(loginSuccess(newUser));
      message.success("Регистрация прошла успешно!");
    }, 1000);
  };

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard} title="Финансовый калькулятор">
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="Вход" key="login">
            <Form
              name="login"
              onFinish={onFinishLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Email"
                name="login"
                rules={[
                  { required: true, message: "Введите email!" },
                  { type: "email", message: "Введите корректный email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="example@email.com"
                />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: "Введите пароль!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Пароль"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Войти
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Регистрация" key="register">
            <Form
              name="register"
              onFinish={onFinishRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Имя"
                name="visualname"
                rules={[{ required: true, message: "Введите ваше имя!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Ваше имя" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="login"
                rules={[
                  { required: true, message: "Введите email!" },
                  { type: "email", message: "Введите корректный email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="example@email.com"
                />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[
                  { required: true, message: "Введите пароль!" },
                  {
                    min: 6,
                    message: "Пароль должен содержать минимум 6 символов!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Пароль"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Зарегистрироваться
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
