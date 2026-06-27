import { Alert, Button, Form, Input, Select, Space } from 'antd';
import { normalizeParticipantName } from '../../utils/participants';

type AuthGateProps = {
  error: string | null;
  isLoadingParticipants: boolean;
  isSubmitting: boolean;
  participants: string[];
  participantsError: string | null;
  onLogin: (credentials: { participante: string; password: string }) => Promise<void>;
  onRetryParticipants: () => Promise<void>;
};

type LoginFormValues = {
  participante: string;
  password: string;
};

export function AuthGate({
  error,
  isLoadingParticipants,
  isSubmitting,
  participants,
  participantsError,
  onLogin,
  onRetryParticipants,
}: AuthGateProps) {
  const sortedParticipants = [...participants].sort((left, right) =>
    left.localeCompare(right, 'es', { sensitivity: 'base' }),
  );

  const participantOptions = sortedParticipants.map((participant) => ({
    label: participant,
    value: participant,
  }));

  const isParticipantSelectorDisabled = isLoadingParticipants || participantsError !== null;

  async function handleSubmit(values: LoginFormValues) {
    await onLogin({
      participante: values.participante,
      password: values.password.trim(),
    });
  }

  return (
    <section className="login-panel" aria-label="Acceso privado">
      <div className="section-heading">
        <span className="section-kicker">Acceso privado</span>
      </div>

      <Form<LoginFormValues>
        className="login-card ant-login-card"
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Nombre de la Plantilla"
          name="participante"
          rules={[{ required: true, message: 'Selecciona tu plantilla.' }]}
        >
          <Select
            showSearch
            disabled={isParticipantSelectorDisabled}
            loading={isLoadingParticipants}
            notFoundContent="No hay participantes con ese nombre."
            options={participantOptions}
            placeholder={
              participantsError
                ? 'No se pudieron cargar los participantes'
                : isLoadingParticipants
                  ? 'Cargando participantes...'
                  : 'Busca y selecciona tu plantilla'
            }
            filterOption={(inputValue, option) =>
              normalizeParticipantName(option?.label?.toString() ?? '').includes(
                normalizeParticipantName(inputValue),
              )
            }
          />
        </Form.Item>

        {participantsError ? (
          <Alert
            action={
              <Button size="small" type="text" loading={isLoadingParticipants} onClick={onRetryParticipants}>
                Reintentar
              </Button>
            }
            className="auth-alert"
            message={participantsError}
            showIcon
            type="error"
          />
        ) : null}

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[{ required: true, message: 'Introduce la contraseña.' }]}
        >
          <Input.Password autoComplete="current-password" placeholder="Introduce la contraseña" />
        </Form.Item>

        {error ? <Alert className="auth-alert" message={error} showIcon type="error" /> : null}

        <Form.Item className="auth-submit-item">
          <Space direction="vertical" size="middle" className="auth-submit-space">
            <Button
              block
              htmlType="submit"
              loading={isSubmitting}
              type="primary"
              disabled={isParticipantSelectorDisabled}
            >
              Entrar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </section>
  );
}
