import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
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

export function AuthGate({
  error,
  isLoadingParticipants,
  isSubmitting,
  participants,
  participantsError,
  onLogin,
  onRetryParticipants,
}: AuthGateProps) {
  const [participantQuery, setParticipantQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const comboboxRef = useRef<HTMLDivElement | null>(null);
  const participantListboxId = useId();
  const sortedParticipants = [...participants].sort((left, right) =>
    left.localeCompare(right, 'es', { sensitivity: 'base' }),
  );
  const normalizedQuery = normalizeParticipantName(participantQuery);
  const filteredParticipants = normalizedQuery
    ? sortedParticipants.filter((participant) =>
        normalizeParticipantName(participant).includes(normalizedQuery),
      )
    : sortedParticipants;
  const isParticipantSelectorDisabled = isLoadingParticipants || participantsError !== null;
  const highlightedParticipant = filteredParticipants[highlightedIndex];
  const activeOptionId =
    isParticipantListOpen && highlightedParticipant
      ? `${participantListboxId}-option-${highlightedIndex}`
      : undefined;

  useEffect(() => {
    function handleDocumentPointerDown(event: PointerEvent) {
      if (!comboboxRef.current?.contains(event.target as Node)) {
        setIsParticipantListOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown);

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    };
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [participantQuery, participants]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedParticipant) {
      return;
    }

    await onLogin({ participante: selectedParticipant, password: password.trim() });
  }

  function selectParticipant(participant: string) {
    setSelectedParticipant(participant);
    setParticipantQuery(participant);
    setIsParticipantListOpen(false);
  }

  function handleParticipantKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isParticipantSelectorDisabled) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsParticipantListOpen(true);
      setHighlightedIndex((currentValue) =>
        Math.min(currentValue + 1, Math.max(filteredParticipants.length - 1, 0)),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsParticipantListOpen(true);
      setHighlightedIndex((currentValue) => Math.max(currentValue - 1, 0));
      return;
    }

    if (event.key === 'Enter' && isParticipantListOpen) {
      event.preventDefault();

      if (highlightedParticipant) {
        selectParticipant(highlightedParticipant);
      }

      return;
    }

    if (event.key === 'Escape') {
      setIsParticipantListOpen(false);
    }
  }

  return (
    <section className="login-panel" aria-label="Acceso privado">
      <div className="section-heading">
        <span className="section-kicker">Acceso privado</span>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="participante">
          Nombre de la Plantilla
        </label>
        <div className="participant-combobox" ref={comboboxRef}>
          <input
            id="participante"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={participantListboxId}
            aria-expanded={isParticipantListOpen}
            aria-activedescendant={activeOptionId}
            autoComplete="off"
            className="text-input participant-input"
            disabled={isParticipantSelectorDisabled}
            placeholder={
              participantsError
                ? 'No se pudieron cargar los participantes'
                : isLoadingParticipants
                  ? 'Cargando participantes...'
                  : 'Busca y selecciona tu plantilla'
            }
            required
            value={participantQuery}
            onChange={(event) => {
              setParticipantQuery(event.target.value);
              setSelectedParticipant(null);
              setIsParticipantListOpen(true);
            }}
            onFocus={() => {
              if (!isParticipantSelectorDisabled) {
                setIsParticipantListOpen(true);
              }
            }}
            onKeyDown={handleParticipantKeyDown}
          />

          {isParticipantListOpen ? (
            <div className="participant-options" id={participantListboxId} role="listbox">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant, index) => (
                  <button
                    id={`${participantListboxId}-option-${index}`}
                    className={
                      index === highlightedIndex
                        ? 'participant-option participant-option-highlighted'
                        : 'participant-option'
                    }
                    key={participant}
                    type="button"
                    role="option"
                    aria-selected={participant === selectedParticipant}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectParticipant(participant)}
                  >
                    {participant}
                  </button>
                ))
              ) : (
                <p className="participant-empty">No hay participantes con ese nombre.</p>
              )}
            </div>
          ) : null}
        </div>

        {participantsError ? (
          <div className="participant-load-error">
            <p>{participantsError}</p>
            <button
              className="ghost-button participant-retry"
              type="button"
              disabled={isLoadingParticipants}
              onClick={() => void onRetryParticipants()}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        <label className="field-label" htmlFor="password">
          Contraseña
        </label>
        <div className="password-field">
          <input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            className="text-input password-input"
            placeholder="Introduce la contraseña"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
          >
            {isPasswordVisible ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.28 2.22 2.22 3.28l3 3A11.84 11.84 0 0 0 1 12s3.64 7 11 7a10.7 10.7 0 0 0 4.32-.87l4.4 4.4 1.06-1.06ZM9.53 10.6A3 3 0 0 0 12 15a2.9 2.9 0 0 0 1.39-.35l-1.55-1.55a1.5 1.5 0 0 1-1.94-1.94Zm2.4-5.58a10.9 10.9 0 0 1 11.07 7s-1.2 2.32-3.73 4.17l-1.08-1.08A8.79 8.79 0 0 0 20.84 12 9 9 0 0 0 12 6a8.74 8.74 0 0 0-3.24.6L7.14 4.98A11.53 11.53 0 0 1 11.93 5.02Zm.22 3A4 4 0 0 1 16 12a3.88 3.88 0 0 1-.42 1.77l-3.2-3.2A3.86 3.86 0 0 1 12.15 8.02Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5c7.36 0 11 7 11 7s-3.64 7-11 7S1 12 1 12s3.64-7 11-7Zm0 2C7.62 7 4.73 10.06 3.48 12 4.73 13.94 7.62 17 12 17s7.27-3.06 8.52-5C19.27 10.06 16.38 7 12 7Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Zm0 2A.5.5 0 1 0 12.5 12a.5.5 0 0 0-.5-.5Z" />
              </svg>
            )}
          </button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button
          className="primary-button"
          type="submit"
          disabled={
            isSubmitting ||
            isParticipantSelectorDisabled ||
            selectedParticipant === null ||
            password.trim().length === 0
          }
        >
          {isSubmitting ? 'Validando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
