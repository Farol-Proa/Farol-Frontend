import { useEffect, useRef, useState } from 'react';
import Logo from '../components/Logo';
import { requisicaoAPI } from '../services/api';

export default function Autenticacao({
  onLoginSuccess,
  initialVerificationToken,
  initialResetToken,
  onAuthLinkHandled,
}) {
  const [screen, setScreen] = useState(
    initialResetToken ? 'resetPassword' : initialVerificationToken ? 'verifyEmail' : 'login',
  );
  const [verificationToken] = useState(initialVerificationToken || '');
  const [resetToken] = useState(initialResetToken || '');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [codeLoading, setCodeLoading] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [resendVisible, setResendVisible] = useState(false);
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (codeCountdown <= 0) return;
    const interval = setInterval(() => {
      setCodeCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [codeCountdown]);

  useEffect(() => {
    if (!verificationToken || verificationStarted.current) return;
    verificationStarted.current = true;
    requisicaoAPI('/usuarios/verificar-email', {
      method: 'POST',
      body: JSON.stringify({ token: verificationToken }),
    })
      .then(() => {
        setActionMessage('E-mail confirmado com sucesso. Você já pode entrar no Farol.');
        setScreen('verified');
      })
      .catch((error) => {
        setActionError(error.message || 'Este link de confirmação expirou ou já foi utilizado.');
        setScreen('verificationError');
      })
      .finally(() => {
        window.history.replaceState({}, '', window.location.pathname);
        onAuthLinkHandled?.();
      });
  }, [verificationToken, onAuthLinkHandled]);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  const [login, setLogin] = useState({
    email: '',
    password: '',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);

  const [messages, setMessages] = useState({
    login: '',
    register: '',
    finish: '',
  });

  // NAVEGAÇÃO ENTRE TELAS

  function showScreen(nextScreen) {
    setScreen(nextScreen);
    if (nextScreen !== 'login') {
      setLoginSuccessNotice('');
    }

    setMessages({
      login: '',
      register: '',
      finish: '',
    });
  }

  // MÁSCARA DE TELEFONE

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length > 6) {
      if (digits.length > 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      }

      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    if (digits.length > 2) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length > 0) {
      return `(${digits}`;
    }

    return '';
  }

  // ATUALIZAR DADOS DO CADASTRO

  function updateUser(field, value) {
    setUserData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // LOGIN

  async function handleLogin(event) {
    event.preventDefault();

    try {
      const resultado = await requisicaoAPI('/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({
          email: login.email,
          senha: login.password,
        }),
      });

      sessionStorage.setItem('token', resultado.token);
      sessionStorage.setItem('usuario', JSON.stringify(resultado.usuario));

      onLoginSuccess();
    } catch (erro) {
      const msg = erro.message || '';
      if (msg.toLowerCase().includes('confirme seu e-mail')) {
        setVerificationEmail(login.email.trim().toLowerCase());
        setResendVisible(true);
      }
      setMessages((previous) => ({
        ...previous,
        login: msg || 'Erro ao conectar com o servidor.',
      }));
    }
  }

  // CONFIRMAÇÃO DE CÓDIGO DE 6 DÍGITOS

  async function handleConfirmCode(event) {
    if (event) event.preventDefault();
    const codigoFormatado = verificationCode.trim();
    if (!codigoFormatado || codigoFormatado.length !== 6) {
      setActionError('O código deve conter exatamente 6 dígitos numéricos.');
      return;
    }
    setCodeLoading(true);
    setActionError('');
    try {
      await requisicaoAPI('/usuarios/verificar-codigo', {
        method: 'POST',
        body: JSON.stringify({
          email: verificationEmail.trim().toLowerCase(),
          codigo: codigoFormatado,
        }),
      });
      setLoginSuccessNotice('E-mail confirmado com sucesso! Digite sua senha para entrar.');
      setLogin((prev) => ({ ...prev, email: verificationEmail.trim().toLowerCase() }));
      setActionError('');
      setActionMessage('');
      setResendVisible(false);
      setVerificationCode('');
      setScreen('login');
    } catch (error) {
      setActionError(error.message || 'Código de verificação inválido ou expirado.');
    } finally {
      setCodeLoading(false);
    }
  }

  async function handleResendCode() {
    if (codeCountdown > 0) return;
    setActionError('');
    try {
      await requisicaoAPI('/usuarios/reenviar-codigo', {
        method: 'POST',
        body: JSON.stringify({ email: verificationEmail.trim().toLowerCase() }),
      });
      setCodeCountdown(60);
      setActionMessage('Se a conta precisar de confirmação, enviaremos um novo código.');
    } catch (error) {
      setActionError(error.message || 'Não foi possível reenviar o código agora.');
    }
  }

  // RECUPERAÇÃO DE SENHA

  function handleForgotPassword() {
    setRecoveryEmail(login.email.trim());
    setActionError('');
    setActionMessage('');
    setScreen('forgotPassword');
  }

  async function handleResendVerification() {
    setActionError('');
    try {
      await requisicaoAPI('/usuarios/reenviar-verificacao', {
        method: 'POST',
        body: JSON.stringify({ email: verificationEmail }),
      });
      setActionMessage(
        'Se a conta precisar de confirmação, enviaremos um novo link. Verifique sua caixa de entrada e spam.',
      );
    } catch (error) {
      setActionError(error.message || 'Não foi possível solicitar um novo link agora.');
    }
  }

  async function handleRecoveryRequest(event) {
    event.preventDefault();
    setActionError('');
    try {
      await requisicaoAPI('/usuarios/solicitar-recuperacao', {
        method: 'POST',
        body: JSON.stringify({ email: recoveryEmail.trim().toLowerCase() }),
      });
      setScreen('recoverySent');
    } catch (error) {
      setActionError(error.message || 'Não foi possível processar a solicitação agora.');
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setActionError('');
    if (newPassword.length < 8 || newPassword.length > 72) {
      setActionError('A senha precisa ter entre 8 e 72 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setActionError('As senhas não coincidem.');
      return;
    }
    try {
      await requisicaoAPI('/usuarios/redefinir-senha', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, senha: newPassword }),
      });
      setActionMessage('Senha redefinida com sucesso. Entre usando sua nova senha.');
      setScreen('passwordReset');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      window.history.replaceState({}, '', window.location.pathname);
      onAuthLinkHandled?.();
    } catch (error) {
      setActionError(error.message || 'O link de recuperação expirou ou já foi utilizado.');
    }
  }

  // PRIMEIRA ETAPA DO CADASTRO

  function handleRegister(event) {
    event.preventDefault();

    const phoneDigits = userData.phone.replace(/\D/g, '');

    if (phoneDigits.length < 10) {
      setMessages((previous) => ({
        ...previous,
        register: 'Informe um telefone válido.',
      }));

      return;
    }

    showScreen('finish');
  }

  // FINALIZAÇÃO DO CADASTRO

  async function handleFinish(event) {
    event.preventDefault();

    const birth = new Date(`${userData.birthDate}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (!userData.birthDate || Number.isNaN(birth.getTime()) || birth > today) {
      setMessages((previous) => ({
        ...previous,
        finish: 'Informe uma data de nascimento válida.',
      }));

      return;
    }

    if (password.length < 8 || password.length > 72) {
      setMessages((previous) => ({
        ...previous,
        finish: 'A senha precisa ter entre 8 e 72 caracteres.',
      }));

      return;
    }

    if (password !== confirmPassword) {
      setMessages((previous) => ({
        ...previous,
        finish: 'As senhas não coincidem.',
      }));

      return;
    }

    try {
      const resultado = await requisicaoAPI('/usuarios/cadastro', {
        method: 'POST',
        body: JSON.stringify({
          nome: userData.name,
          email: userData.email,
          senha: password,
          telefone: userData.phone,
          dataNascimento: userData.birthDate,
        }),
      });

      setMessages((previous) => ({
        ...previous,
        finish: '',
      }));
      const emailCadastrado = userData.email.trim().toLowerCase();
      setVerificationEmail(emailCadastrado);
      setVerificationCode('');
      setCodeCountdown(60);
      setActionMessage(resultado.mensagem || 'Código de verificação enviado para seu e-mail.');
      setActionError('');
      setScreen('confirmCode');
    } catch (erro) {
      setMessages((previous) => ({
        ...previous,
        finish: erro.message || 'Erro ao conectar com o servidor.',
      }));
    }
  }

  // LOGIN SOCIAL DEMONSTRATIVO

  function handleSocial(provider) {
    setMessages((previous) => ({
      ...previous,
      [screen === 'login' ? 'login' : 'register']:
        `O login com ${provider} precisa de integração OAuth.`,
    }));
  }

  // ESTILOS REUTILIZÁVEIS

  const inputClass =
    'w-full h-12 rounded-lg border border-gray-300 bg-gray-100 px-3 text-sm text-gray-800 outline-none transition focus:border-2 focus:border-yellow-400 focus:bg-white';

  const labelClass = 'mb-2 block text-sm font-medium text-slate-200';

  const buttonClass =
    'mt-2 h-12 w-full rounded-lg bg-yellow-400 font-bold text-[#332A16] transition hover:-translate-y-0.5 hover:bg-yellow-300';

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-[#101626] p-4 md:p-6">
        <div className="grid min-h-[590px] w-full max-w-[1050px] grid-cols-1 overflow-hidden rounded-[22px] bg-[#18243A] shadow-2xl md:grid-cols-[1.15fr_0.85fr]">
          {/* PAINEL AZUL */}

          <section className="relative flex flex-col overflow-hidden bg-gradient-to-br from-[#087BFA] to-[#0756D5] p-6 text-white md:p-8">
            {/* TEXTURA */}

            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)
                `,
                backgroundSize: '35px 35px',
              }}
            />

            {/* LOGO OFICIAL */}
            <div className="relative z-20 flex items-center">
              <Logo className="h-12 w-auto" />
            </div>

            {/* IMAGEM PRINCIPAL */}

            <div className="absolute inset-0 z-0 flex items-center justify-center">
              <img
                src={screen === 'login' ? '/images/robriel.png' : '/images/menina.png'}
                alt={screen === 'login' ? 'Robriel' : 'Menina'}
                className={`h-full w-full object-contain ${
                  screen === 'login' ? '' : 'scale-[1.08]'
                }`}
              />
            </div>
          </section>

          {/* PAINEL DOS FORMULÁRIOS */}

          <section className="flex items-center justify-center bg-[#18243A] px-6 py-10 text-white md:px-9">
            <div className="w-full max-w-[350px]">
              {/* TELA 1 - LOGIN */}

              {screen === 'verifyEmail' && (
                <div>
                  <h2 className="mb-5 text-3xl font-bold">Confirmando seu e-mail</h2>
                  <p className="mb-5 text-sm text-slate-300">
                    Estamos validando o link de confirmação.
                  </p>
                </div>
              )}

              {(screen === 'verified' || screen === 'verificationError') && (
                <div>
                  <h2 className="mb-5 text-3xl font-bold">
                    {screen === 'verified' ? 'E-mail confirmado' : 'Link inválido'}
                  </h2>
                  <p className="mb-5 text-sm text-slate-300">
                    {screen === 'verified' ? actionMessage : actionError}
                  </p>
                  {screen === 'verificationError' && (
                    <div className="mb-4">
                      <label className={labelClass}>E-mail da conta</label>
                      <input
                        type="email"
                        value={verificationEmail}
                        onChange={(event) => setVerificationEmail(event.target.value)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className={buttonClass}
                      >
                        Solicitar novo link
                      </button>
                    </div>
                  )}
                  {actionMessage && screen === 'verificationError' && (
                    <p className="mb-4 text-xs text-green-300">{actionMessage}</p>
                  )}
                  {actionError && screen === 'verified' && (
                    <p className="mb-4 text-xs text-red-300">{actionError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => showScreen('login')}
                    className="font-bold text-yellow-300 hover:underline"
                  >
                    Voltar ao login
                  </button>
                </div>
              )}

              {screen === 'verificationNotice' && (
                <div>
                  <h2 className="mb-5 text-3xl font-bold">Confirme seu e-mail</h2>
                  <p className="mb-5 text-sm text-slate-300">
                    {actionMessage} Confira a caixa de entrada de{' '}
                    <strong>{verificationEmail}</strong> e a pasta de spam. O link é válido por 24
                    horas.
                  </p>
                  <button type="button" onClick={handleResendVerification} className={buttonClass}>
                    Reenviar e-mail de confirmação
                  </button>
                  {actionError && (
                    <p role="alert" className="mt-3 text-xs text-red-300">
                      {actionError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => showScreen('login')}
                    className="mt-5 font-bold text-yellow-300 hover:underline"
                  >
                    Voltar ao login
                  </button>
                </div>
              )}

              {screen === 'confirmCode' && (
                <div>
                  <h2 className="mb-3 text-3xl font-bold">Confirme seu e-mail</h2>
                  <p className="mb-2 text-sm text-slate-300">
                    Enviamos um código de 6 dígitos para{' '}
                    <strong className="text-white">{verificationEmail}</strong>.
                  </p>
                  <p className="mb-4 text-xs text-slate-400">
                    O código é válido por <strong>10 minutos</strong>. Não esqueça de checar a pasta de spam.
                  </p>

                  {actionMessage && (
                    <div className="mb-4 rounded-lg bg-green-500/20 p-3 text-xs text-green-300">
                      {actionMessage}
                    </div>
                  )}

                  {actionError && (
                    <div role="alert" className="mb-4 rounded-lg bg-red-500/20 p-3 text-xs text-red-300">
                      {actionError}
                    </div>
                  )}

                  <form onSubmit={handleConfirmCode}>
                    <div className="mb-4">
                      <label htmlFor="codigo-verificacao-conta" className={labelClass}>Código de 6 dígitos</label>
                      <input
                        id="codigo-verificacao-conta"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoFocus
                        autoComplete="one-time-code"
                        aria-label="Código de verificação de 6 dígitos"
                        placeholder="000000"
                        value={verificationCode}
                        onPaste={(e) => {
                          e.preventDefault();
                          const colado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                          setVerificationCode(colado);
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setVerificationCode(val);
                        }}
                        className="w-full h-14 rounded-lg border border-gray-300 bg-gray-100 text-center font-mono text-3xl font-extrabold tracking-[0.4em] text-gray-900 outline-none transition focus:border-2 focus:border-yellow-400 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verificationCode.length !== 6 || codeLoading}
                      className={`${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {codeLoading ? 'Confirmando...' : 'Confirmar código'}
                    </button>

                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={codeCountdown > 0}
                        onClick={handleResendCode}
                        className={`w-full py-2.5 text-xs font-semibold rounded-lg border transition ${
                          codeCountdown > 0
                            ? 'text-slate-400 border-slate-700 bg-slate-800/40 cursor-not-allowed'
                            : 'text-yellow-300 border-yellow-400/40 hover:bg-yellow-400/10'
                        }`}
                      >
                        {codeCountdown > 0
                          ? `Reenviar código em ${codeCountdown}s`
                          : 'Reenviar código'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActionError('');
                          setActionMessage('');
                          setLoginSuccessNotice('');
                          showScreen('login');
                        }}
                        className="mt-2 text-xs text-slate-400 hover:text-slate-200 text-center"
                      >
                        ← Voltar para o login
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {screen === 'forgotPassword' && (
                <div>
                  <button
                    type="button"
                    onClick={() => showScreen('login')}
                    className="mb-5 text-sm text-slate-300 hover:text-yellow-300"
                  >
                    ← Voltar para login
                  </button>
                  <h2 className="mb-5 text-3xl font-bold">Recuperar senha</h2>
                  <p className="mb-5 text-sm text-slate-300">
                    Informe seu e-mail. Se houver uma conta associada, enviaremos as instruções.
                  </p>
                  <form onSubmit={handleRecoveryRequest}>
                    <label className={labelClass}>E-mail</label>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(event) => setRecoveryEmail(event.target.value)}
                      className={inputClass}
                    />
                    <button type="submit" className={buttonClass}>
                      Enviar instruções
                    </button>
                  </form>
                  {actionError && (
                    <p role="alert" className="mt-3 text-xs text-red-300">
                      {actionError}
                    </p>
                  )}
                </div>
              )}

              {screen === 'recoverySent' && (
                <div>
                  <h2 className="mb-5 text-3xl font-bold">Verifique seu e-mail</h2>
                  <p className="mb-5 text-sm text-slate-300">
                    Se existir uma conta associada a esse endereço, enviaremos um link para
                    redefinir a senha.
                  </p>
                  <button
                    type="button"
                    onClick={() => showScreen('login')}
                    className="font-bold text-yellow-300 hover:underline"
                  >
                    Voltar ao login
                  </button>
                </div>
              )}

              {screen === 'resetPassword' && (
                <div>
                  <button
                    type="button"
                    onClick={() => showScreen('login')}
                    className="mb-5 text-sm text-slate-300 hover:text-yellow-300"
                  >
                    ← Voltar para login
                  </button>
                  <h2 className="mb-5 text-3xl font-bold">Criar nova senha</h2>
                  <form onSubmit={handleResetPassword}>
                    <label className={labelClass}>Nova senha</label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        maxLength={72}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className={`${inputClass} pr-16`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        {showResetPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    <label className={`${labelClass} mt-4`}>Confirmar nova senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmResetPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        maxLength={72}
                        value={confirmNewPassword}
                        onChange={(event) => setConfirmNewPassword(event.target.value)}
                        className={`${inputClass} pr-16`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmResetPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        {showConfirmResetPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    <button type="submit" className={buttonClass}>
                      Redefinir senha
                    </button>
                  </form>
                  {actionError && (
                    <p role="alert" className="mt-3 text-xs text-red-300">
                      {actionError}
                    </p>
                  )}
                </div>
              )}

              {screen === 'passwordReset' && (
                <div>
                  <h2 className="mb-5 text-3xl font-bold">Senha atualizada</h2>
                  <p className="mb-5 text-sm text-slate-300">{actionMessage}</p>
                  <button
                    type="button"
                    onClick={() => showScreen('login')}
                    className="font-bold text-yellow-300 hover:underline"
                  >
                    Ir para o login
                  </button>
                </div>
              )}

              {screen === 'login' && (
                <div>
                  <h2 className="mb-6 text-3xl font-bold">Login</h2>

                  {loginSuccessNotice && (
                    <div className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 p-3.5 text-xs font-semibold text-green-300">
                      {loginSuccessNotice}
                    </div>
                  )}

                  <form onSubmit={handleLogin}>
                    <div className="mb-5">
                      <label className={labelClass}>E-mail</label>

                      <input
                        type="email"
                        placeholder="Insira seu e-mail"
                        className={inputClass}
                        value={login.email}
                        onChange={(e) =>
                          setLogin({
                            ...login,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className={labelClass}>Senha</label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Insira a sua senha"
                          className={`${inputClass} pr-16`}
                          value={login.password}
                          onChange={(e) =>
                            setLogin({
                              ...login,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          {showLoginPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="mb-4 block w-full text-right text-xs text-yellow-300 hover:underline"
                    >
                      Esqueceu sua senha?
                    </button>

                    <button type="submit" className={buttonClass}>
                      Entrar
                    </button>

                    {messages.login && (
                      <p className="mt-3 text-xs text-red-300">{messages.login}</p>
                    )}
                    {resendVisible && (
                      <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5">
                        <p className="text-xs text-yellow-200">
                          Sua conta ainda não foi confirmada.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setVerificationEmail(login.email.trim().toLowerCase());
                            setVerificationCode('');
                            setActionError('');
                            setActionMessage('Digite o código de 6 dígitos enviado para seu e-mail.');
                            setScreen('confirmCode');
                          }}
                          className="mt-2 block text-left text-xs font-bold text-yellow-300 hover:underline"
                        >
                          Confirmar meu e-mail com código de 6 dígitos →
                        </button>
                      </div>
                    )}
                  </form>

                  <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                    <div className="h-px flex-1 bg-slate-500" />
                    ou
                    <div className="h-px flex-1 bg-slate-500" />
                  </div>

                  <SocialButtons onSocial={handleSocial} />

                  <p className="mt-6 text-center text-xs text-slate-300">
                    Não tem uma conta?{' '}
                    <button
                      onClick={() => showScreen('register')}
                      className="font-bold text-yellow-300 hover:underline"
                    >
                      Inscreva-se
                    </button>
                  </p>
                </div>
              )}

              {/* TELA 2 - CADASTRO */}

              {screen === 'register' && (
                <div>
                  <button
                    onClick={() => showScreen('login')}
                    className="mb-5 text-sm text-slate-300 hover:text-yellow-300"
                  >
                    ← Voltar para login
                  </button>

                  <h2 className="mb-7 text-3xl font-bold">Cadastre-se</h2>

                  <form onSubmit={handleRegister}>
                    <div className="mb-4">
                      <label className={labelClass}>Nome</label>

                      <input
                        type="text"
                        placeholder="Insira o seu nome"
                        className={inputClass}
                        value={userData.name}
                        onChange={(e) => updateUser('name', e.target.value)}
                        maxLength={80}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>E-mail</label>

                      <input
                        type="email"
                        placeholder="Insira seu e-mail"
                        className={inputClass}
                        value={userData.email}
                        onChange={(e) => updateUser('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>Telefone</label>

                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className={inputClass}
                        value={userData.phone}
                        onChange={(e) => updateUser('phone', formatPhone(e.target.value))}
                        maxLength={15}
                        required
                      />
                    </div>

                    <button type="submit" className={buttonClass}>
                      Continuar
                    </button>

                    {messages.register && (
                      <p className="mt-3 text-xs text-red-300">{messages.register}</p>
                    )}
                  </form>

                  <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
                    <div className="h-px flex-1 bg-slate-500" />
                    ou
                    <div className="h-px flex-1 bg-slate-500" />
                  </div>

                  <SocialButtons onSocial={handleSocial} />

                  <p className="mt-6 text-center text-xs text-slate-300">
                    Já tem uma conta?{' '}
                    <button
                      onClick={() => showScreen('login')}
                      className="font-bold text-yellow-300 hover:underline"
                    >
                      Entre
                    </button>
                  </p>
                </div>
              )}

              {/* TELA 3 - FINALIZAR CADASTRO */}

              {screen === 'finish' && (
                <div>
                  <button
                    onClick={() => showScreen('register')}
                    className="mb-5 text-sm text-slate-300 hover:text-yellow-300"
                  >
                    ← Voltar
                  </button>

                  <h2 className="mb-7 text-3xl font-bold">Quase lá!</h2>

                  <form onSubmit={handleFinish}>
                    <div className="mb-4">
                      <label className={labelClass}>Data de nascimento</label>

                      <input
                        type="date"
                        className={inputClass}
                        value={userData.birthDate}
                        onChange={(e) => updateUser('birthDate', e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>Senha</label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Insira sua senha"
                          className={`${inputClass} pr-16`}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          {showRegisterPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className={labelClass}>Confirme a senha</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirme sua senha"
                          className={`${inputClass} pr-16`}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className={buttonClass}>
                      Finalizar cadastro
                    </button>

                    {messages.finish && (
                      <p className="mt-3 text-xs text-green-300">{messages.finish}</p>
                    )}
                  </form>

                  <p className="mt-6 text-center text-xs text-slate-300">
                    Já tem uma conta?{' '}
                    <button
                      onClick={() => showScreen('login')}
                      className="font-bold text-yellow-300 hover:underline"
                    >
                      Entre
                    </button>
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

// COMPONENTE DOS BOTÕES SOCIAIS

function SocialButtons({ onSocial }) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onSocial('Google')}
        className="h-11 flex-1 rounded-lg border border-gray-300 bg-gray-100 px-3 text-xs font-bold text-gray-700 transition hover:bg-white hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <span className="text-base font-extrabold">G</span>
        <span>Google</span>
        <span className="rounded bg-amber-200/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-900">
          Em breve
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSocial('Facebook')}
        className="h-11 flex-1 rounded-lg border border-gray-300 bg-gray-100 px-3 text-xs font-bold text-gray-700 transition hover:bg-white hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <span className="text-base font-extrabold">f</span>
        <span>Facebook</span>
        <span className="rounded bg-amber-200/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-900">
          Em breve
        </span>
      </button>
    </div>
  );
}
