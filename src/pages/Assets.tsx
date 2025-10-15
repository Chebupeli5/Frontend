import React, { useMemo, useState } from "react";
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
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../hooks/redux";
import type { Asset } from "../types";
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} from "../services/assetsApi";
import styles from "./Assets.module.css";

const Assets: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form] = Form.useForm();

  const { currentUser } = useAppSelector((state) => state.auth);
  const shouldSkipAssetsQuery = !currentUser;
  const {
    data: assetsData,
    isLoading: assetsLoading,
    isFetching: assetsFetching,
  } = useGetAssetsQuery(undefined, { skip: shouldSkipAssetsQuery });
  const [createAsset, { isLoading: isCreating }] = useCreateAssetMutation();
  const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();
  const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

  const assets = useMemo(() => assetsData ?? [], [assetsData]);
  const isModalSubmitting = isCreating || isUpdating;
  const isTableLoading = assetsLoading || assetsFetching;

  const totalBalance = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.balance, 0),
    [assets]
  );

  if (!currentUser) return null;

  const handleAdd = () => {
    setEditingAsset(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    form.setFieldsValue({
      name: asset.name,
      balance: asset.balance,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (assetId: number) => {
    try {
      await deleteAsset(assetId).unwrap();
      message.success("Счёт удалён");
    } catch (error) {
      console.error("Failed to delete asset", error);
      message.error("Не удалось удалить счёт");
    }
  };

  const handleSubmit = async (values: { name: string; balance: number }) => {
    const commonPayload = {
      name: values.name,
      balance: Number(values.balance),
    };

    try {
      if (editingAsset) {
        await updateAsset({ id: editingAsset.id, ...commonPayload }).unwrap();
        message.success("Счёт обновлён");
      } else {
        await createAsset({ ...commonPayload }).unwrap();
        message.success("Счёт добавлен");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to submit asset", error);
      message.error("Не удалось сохранить счёт");
    }
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
            <Spin spinning={isTableLoading} tip="Загрузка счетов...">
              <div>
                <Row gutter={[16, 16]}>
                  {assets.map((asset) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={asset.id}>
                      <Card
                        size="small"
                        className={styles.assetCard}
                        actions={[
                          <Button
                            key="edit"
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(asset)}
                            title="Редактировать"
                          />,
                          <Popconfirm
                            key="delete"
                            title="Удалить счёт?"
                            description="Это действие нельзя отменить"
                            onConfirm={() => handleDelete(asset.id)}
                            okText="Да"
                            cancelText="Нет"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              title="Удалить"
                              loading={isDeleting}
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

                {assets.length === 0 && !isTableLoading && (
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
              </div>
            </Spin>
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
              <Button
                type="primary"
                htmlType="submit"
                loading={isModalSubmitting}
                disabled={isModalSubmitting}
              >
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
