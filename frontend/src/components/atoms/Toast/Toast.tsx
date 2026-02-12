import React from 'react';
import { Button, notification, Space } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const Toast: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (
    type: NotificationType,
    title: string,
    description?: string
  ) => {
    api[type]({
      message: title,
      description,
      duration: 3,
      style: {
        backgroundColor: '#1b1d27',
        color: '#e0e6f0',
        borderRadius: 10,
        boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
      },
      closeIcon: <span style={{ color: '#4e88ff' }}>×</span>,
    });
  };

  return (
    <>
      {contextHolder}
      <Space size={12}>
        <Button
          style={{
            backgroundColor: '#4e88ff',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 500,
          }}
          onClick={() =>
            openNotificationWithIcon(
              'success',
              'Success!',
              'Operation completed successfully'
            )
          }
        >
          Success
        </Button>
        <Button
          style={{
            backgroundColor: '#61dafb',
            color: '#1b1d27',
            borderRadius: 8,
            fontWeight: 500,
          }}
          onClick={() =>
            openNotificationWithIcon(
              'info',
              'Info',
              'This is some informational message'
            )
          }
        >
          Info
        </Button>
        <Button
          style={{
            backgroundColor: '#f5a623',
            color: '#1b1d27',
            borderRadius: 8,
            fontWeight: 500,
          }}
          onClick={() =>
            openNotificationWithIcon(
              'warning',
              'Warning',
              'Watch out for this warning'
            )
          }
        >
          Warning
        </Button>
        <Button
          style={{
            backgroundColor: '#ff4d4f',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 500,
          }}
          onClick={() =>
            openNotificationWithIcon(
              'error',
              'Error',
              'An error occurred during the operation'
            )
          }
        >
          Error
        </Button>
      </Space>
    </>
  );
};

export default Toast;
