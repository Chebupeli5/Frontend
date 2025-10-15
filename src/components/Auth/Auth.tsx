import React, { useState } from "react";
import { Form, Input, Button, Card, message, Tabs, Spin } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";
import {
  useLoginMutation,
  useSignupMutation,
} from "../../services/authApi";
import styles from "./Auth.module.css";

const { TabPane } = Tabs;

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState("login");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();

  const resolveErrorMessage = (error: unknown) => {
    if (error && typeof error === "object" && "data" in error) {
      const data = (error as { data?: unknown }).data;
      if (typeof data === "string") {
        return data;
      }
      if (data && typeof data === "object" && "error" in data) {
        const payload = (data as { error?: unknown }).error;
        if (typeof payload === "string") return payload;
        if (payload && typeof payload === "object" && "message" in payload) {
          const msg = (payload as { message?: unknown }).message;
          if (typeof msg === "string") return msg;
        }
      }
    }
    return "Произошла ошибка. Попробуйте еще раз";
  };

  const onFinishLogin = (values: { login: string; password: string }) => {
    dispatch(loginStart());

    login(values)
      .unwrap()
      .then((response) => {
        dispatch(
          loginSuccess({
            user: {
              user_id: response.user.id,
              login: response.user.login,
              visualname: response.user.visualname,
            },
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })
        );
        message.success("Успешная авторизация!");
        navigate("/");
      })
      .catch((error) => {
        dispatch(loginFailure());
        message.error(resolveErrorMessage(error));
      });
  };

  const onFinishRegister = (values: {
    login: string;
    password: string;
    visualname: string;
  }) => {
    dispatch(loginStart());

    signup(values)
      .unwrap()
      .then((response) => {
        dispatch(
          loginSuccess({
            user: {
              user_id: response.user.id,
              login: response.user.login,
              visualname: response.user.visualname,
            },
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })
        );
        message.success("Регистрация прошла успешно!");
        navigate("/");
      })
      .catch((error) => {
        dispatch(loginFailure());
        message.error(resolveErrorMessage(error));
      });
  };

  const isSubmitting = loading || isLoginLoading || isSignupLoading;

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
                  autoComplete="email"
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
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
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
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Ваше имя"
                  autoComplete="name"
                />
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
                  autoComplete="email"
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
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  block
                >
                  Зарегистрироваться
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
        {isSubmitting && (
          <div className={styles.overlay}>
            <Spin size="large" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;
