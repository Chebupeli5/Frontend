import React, { useState } from "react";
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
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { addAsset, updateAsset, deleteAsset } from "../store/appSlice";
import type { Asset } from "../types";
import styles from "./Assets.module.css";

const Assets: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { assets } = useAppSelector((state) => state.app);

  if (!currentUser) return null;

  const userAssets = assets.filter((a) => a.user_id === currentUser.user_id);
  const totalBalance = userAssets.reduce(
    (sum, asset) => sum + asset.balance,
    0
  );

  const handleAdd = () => {
    setEditingAsset(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    form.setFieldsValue(asset);
    setIsModalVisible(true);
  };

  const handleDelete = (assetKey: string) => {
    dispatch(
      deleteAsset({
        user_id: currentUser.user_id,
        name: assetKey,
      })
    );
    message.success("Счёт удалён");
  };

  const handleSubmit = (values: { name: string; balance: number }) => {
    if (editingAsset) {
      dispatch(
        updateAsset({
          user_id: currentUser.user_id,
          name: values.name,
          balance: values.balance,
        })
      );
      message.success("Счёт обновлён");
    } else {
      const newAsset: Asset = {
        user_id: currentUser.user_id,
        name: values.name,
        balance: values.balance,
      };
      dispatch(addAsset(newAsset));
      message.success("Счёт добавлен");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className={styles.assets}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Statistic
              title="Общий баланс всех счетов"
              value={totalBalance}
              precision={0}
              valueStyle={{ color: "#1890ff", fontSize: "32px" }}
              prefix={<BankOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Мои счета"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Добавить счёт
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {userAssets.map((asset) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={asset.name}>
                  <Card
                    size="small"
                    className={styles.assetCard}
                    actions={[
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(asset)}
                        title="Редактировать"
                      />,
                      <Popconfirm
                        title="Удалить счёт?"
                        description="Это действие нельзя отменить"
                        onConfirm={() => handleDelete(asset.name)}
                        okText="Да"
                        cancelText="Нет"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          title="Удалить"
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <div className={styles.assetHeader}>
                      <CreditCardOutlined className={styles.assetIcon} />
                      <h4 className={styles.assetName}>{asset.name}</h4>
                    </div>

                    <div className={styles.assetBalance}>
                      <Statistic
                        value={asset.balance}
                        precision={0}
                        suffix="₽"
                        valueStyle={{
                          fontSize: "20px",
                          color: asset.balance >= 0 ? "#52c41a" : "#f5222d",
                        }}
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {userAssets.length === 0 && (
              <div className={styles.emptyState}>
                <CreditCardOutlined className={styles.emptyIcon} />
                <p>У вас пока нет счетов</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Добавить первый счёт
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingAsset ? "Редактировать счёт" : "Добавить счёт"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Название счёта"
            name="name"
            rules={[{ required: true, message: "Введите название счёта" }]}
          >
            <Input placeholder="Например: Основная карта Сбербанк" />
          </Form.Item>

          <Form.Item
            label="Баланс"
            name="balance"
            rules={[{ required: true, message: "Введите баланс" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="0"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              suffix="₽"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAsset ? "Обновить" : "Добавить"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Assets;
