import { Button, Layout, Typography, Space, Card } from 'antd';
import { FaReact } from 'react-icons/fa';
import { useCreateProject } from '../hooks/apis/mutations/useCreateProject';
import { useEffect, useState } from 'react';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const loaderSteps = [
  'Provisioning isolated workspace…',
  'Setting up project structure…',
  'Installing core dependencies…',
  'Configuring build environment…',
  'Running setup scripts…',
  'Optimizing development runtime…',
  'Finalizing sandbox configuration…',
  'Almost ready…',
];

const CreateProject = () => {
  const { createProjectMutation, isSuccess, isPending } = useCreateProject();
  const [stepIndex, setStepIndex] = useState(0);

  const handleCreateProject = async () => {
    try {
      await createProjectMutation();
    } catch (err) {
      console.error('Error occurred', err);
    }
  };

  useEffect(() => {
    if (!isPending) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % loaderSteps.length);
    }, 900);

    return () => clearInterval(interval);
  }, [isPending]);

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 30% 10%, rgba(97,218,251,0.08) 0%, #0b0c10 70%),
          linear-gradient(135deg, #0c0d14 0%, #101216 100%)`,
      }}
    >
      {/* Header */}
      <Header style={{ background: 'transparent', padding: '16px 24px' }}>
        <Text
          style={{
            color: '#f0f0f0',
            fontFamily: 'Fira Code, monospace',
            fontSize: 20,
            fontWeight: 500,
            background: 'linear-gradient(90deg, #ffffff, #61dafb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          DevPlayground
        </Text>
      </Header>

      {/* Content */}
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <Card
          bordered={false}
          bodyStyle={{ padding: 0 }}
          style={{
            width: '100%',
            maxWidth: 720,
            padding: '32px 24px',
            background: 'rgba(40,40,45,0.2)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20,
            boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title
              level={2}
              style={{
                marginTop: 0,
                marginBottom: 0,
                fontFamily: 'Fira Code, monospace',
                fontSize: 'calc(1.8rem + 1vw)',
                fontWeight: 400,
                background: 'linear-gradient(180deg, #ffffff, #a0d8ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Build.Run.Ship.
            </Title>

            <Paragraph
              style={{
                color: '#c7d0da',
                fontSize: 'calc(0.9rem + 0.3vw)',
                fontFamily: 'Fira Code, monospace',
                lineHeight: 1.5,
              }}
            >
              A modern cloud playground to create, test, and ship projects
              instantly.
            </Paragraph>

            <Button
              type="default"
              size="large"
              icon={<FaReact style={{ marginRight: 8, height: '24px' }} />}
              loading={isPending}
              onClick={handleCreateProject}
              style={{
                height: '48px',
                padding: '0 24px',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'Fira Code, monospace',
                borderRadius: 12,
                color: '#61dafb',
                borderColor: '#61dafb',
                background: 'transparent',
                boxShadow: '0 6px 18px rgba(97,218,251,0.25)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(97,218,251,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Create React Playground
            </Button>

            {/* Status Messages */}
            {isPending && (
              <Text
                style={{
                  color: '#8b949e',
                  fontSize: 13,
                  fontFamily: 'Fira Code, monospace',
                }}
              >
                {loaderSteps[stepIndex]}
              </Text>
            )}

            {isSuccess && (
              <Text
                style={{
                  color: '#61dafb',
                  fontSize: 14,
                  fontFamily: 'Fira Code, monospace',
                }}
              >
                Workspace ready. Redirecting to editor…
              </Text>
            )}
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default CreateProject;
