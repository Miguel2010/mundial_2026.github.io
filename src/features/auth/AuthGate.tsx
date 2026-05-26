import { FormEvent, useState } from 'react';

type AuthGateProps = {
  error: string | null;
  isSubmitting: boolean;
  onLogin: (password: string) => Promise<void>;
};

export function AuthGate({ error, isSubmitting, onLogin }: AuthGateProps) {
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(password.trim());
  }

  return (
    <section className="login-panel" aria-label="Acceso privado">
      <div className="section-heading">
        <span className="section-kicker">Acceso privado</span>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="text-input"
          placeholder="Introduce la contraseña"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? <p className="form-error">{error}</p> : null}

        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting || password.trim().length === 0}
        >
          {isSubmitting ? 'Validando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
