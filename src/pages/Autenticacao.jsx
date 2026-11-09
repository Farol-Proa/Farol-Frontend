
import { useState } from "react";

export default function App() {
    const [screen, setScreen] = useState("login");

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
    });

    const [login, setLogin] = useState({
        email: "",
        password: "",
    });

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [messages, setMessages] = useState({
        login: "",
        register: "",
        finish: "",
    });

    // NAVEGAÇÃO ENTRE TELAS

    function showScreen(nextScreen) {
        setScreen(nextScreen);

        setMessages({
            login: "",
            register: "",
            finish: "",
        });
    }

    // MÁSCARA DE TELEFONE

    function formatPhone(value) {
        const digits = value.replace(/\D/g, "").slice(0, 11);

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

        return "";
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
            const resposta = await fetch(
                "http://localhost:8080/api/usuarios/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: login.email,
                        senha: login.password,
                    }),
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail ||
                    resultado.message ||
                    resultado.mensagem ||
                    "E-mail ou senha inválidos."
                );
            }

            setMessages((previous) => ({
                ...previous,
                login: `Bem-vindo(a), ${resultado.nome}!`,
            }));

        } catch (erro) {
            setMessages((previous) => ({
                ...previous,
                login: erro.message || "Erro ao conectar com o servidor.",
            }));
        }
    }

    // RECUPERAÇÃO DE SENHA

    function handleForgotPassword() {
        if (!login.email.trim()) {
            setMessages((previous) => ({
                ...previous,
                login: "Informe seu e-mail.",
            }));

            return;
        }

        setMessages((previous) => ({
            ...previous,
            login: "A recuperação de senha precisa ser conectada ao backend.",
        }));
    }

    // PRIMEIRA ETAPA DO CADASTRO

    function handleRegister(event) {
        event.preventDefault();

        const phoneDigits = userData.phone.replace(/\D/g, "");

        if (phoneDigits.length < 10) {
            setMessages((previous) => ({
                ...previous,
                register: "Informe um telefone válido.",
            }));

            return;
        }

        showScreen("finish");
    }

    // FINALIZAÇÃO DO CADASTRO

    async function handleFinish(event) {
        event.preventDefault();

        const birth = new Date(`${userData.birthDate}T00:00:00`);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (
            !userData.birthDate ||
            Number.isNaN(birth.getTime()) ||
            birth > today
        ) {
            setMessages((previous) => ({
                ...previous,
                finish: "Informe uma data de nascimento válida.",
            }));

            return;
        }

        if (password.length < 8 || password.length > 72) {
            setMessages((previous) => ({
                ...previous,
                finish: "A senha precisa ter entre 8 e 72 caracteres.",
            }));

            return;
        }

        if (password !== confirmPassword) {
            setMessages((previous) => ({
                ...previous,
                finish: "As senhas não coincidem.",
            }));

            return;
        }

        try {
            const resposta = await fetch(
                "http://localhost:8080/api/usuarios/cadastro",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome: userData.name,
                        email: userData.email,
                        senha: password,
                        telefone: userData.phone,
                        dataNascimento: userData.birthDate,
                    }),
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail ||
                    resultado.message ||
                    resultado.mensagem ||
                    "Não foi possível realizar o cadastro."
                );
            }

            setMessages((previous) => ({
                ...previous,
                finish: "Cadastro realizado com sucesso!",
            }));

        } catch (erro) {
            setMessages((previous) => ({
                ...previous,
                finish: erro.message || "Erro ao conectar com o servidor.",
            }));
        }
    }

    // LOGIN SOCIAL DEMONSTRATIVO

    function handleSocial(provider) {
        setMessages((previous) => ({
            ...previous,
            [screen === "login" ? "login" : "register"]:
                `O login com ${provider} precisa de integração OAuth.`,
        }));
    }

    // ESTILOS REUTILIZÁVEIS

    const inputClass =
        "w-full h-12 rounded-lg border border-gray-300 bg-gray-100 px-3 text-sm text-gray-800 outline-none transition focus:border-2 focus:border-yellow-400 focus:bg-white";

    const labelClass =
        "mb-2 block text-sm font-medium text-slate-200";

    const buttonClass =
        "mt-2 h-12 w-full rounded-lg bg-yellow-400 font-bold text-[#332A16] transition hover:-translate-y-0.5 hover:bg-yellow-300";

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
                                backgroundSize: "35px 35px",
                            }}
                        />

                        {/* LOGO */}

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-extrabold text-blue-600">
                                ✦
                            </div>

                            <h2 className="text-xl font-bold">Farol</h2>
                        </div>

                        {/* TEXTO PRINCIPAL */}

                        <div className="relative z-10 mt-9">

                            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
                                Se junte ao <span className="text-yellow-300">Farol!</span>
                            </h1>

                            <p className="mt-5 max-w-sm text-base font-semibold leading-relaxed text-blue-100 md:text-lg">
                                E organize os seus estudos como milhares de brasileiros.
                            </p>

                        </div>

                        {/* ESPAÇO RESERVADO PARA O PERSONAGEM */}

                        <div className="relative z-10 mt-5 flex min-h-[220px] flex-1 items-center justify-center md:min-h-[260px]">


                            <img
                                src={screen === "login" ? "/images/Robriel.png" : "/images/menina.png"}
                                alt={screen === "login" ? "Robriel" : "Menina"}
                                className="max-h-[320px] w-full object-contain"
                            />

                        </div>

                        <p className="relative z-10 mt-5 text-xs text-blue-100">
                            Seu futuro começa com uma direção.
                        </p>

                    </section>

                    {/* PAINEL DOS FORMULÁRIOS */}

                    <section className="flex items-center justify-center bg-[#18243A] px-6 py-10 text-white md:px-9">

                        <div className="w-full max-w-[350px]">

                            {/* TELA 1 - LOGIN */}

                            {screen === "login" && (

                                <div>

                                    <h2 className="mb-8 text-3xl font-bold">
                                        Login
                                    </h2>

                                    <form onSubmit={handleLogin}>

                                        <div className="mb-5">
                                            <label className={labelClass}>
                                                E-mail
                                            </label>

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
                                            <label className={labelClass}>
                                                Senha
                                            </label>

                                            <input
                                                type="password"
                                                placeholder="Insira a sua senha"
                                                className={inputClass}
                                                value={login.password}
                                                onChange={(e) =>
                                                    setLogin({
                                                        ...login,
                                                        password: e.target.value,
                                                    })
                                                }
                                                required
                                            />
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
                                            <p className="mt-3 text-xs text-red-300">
                                                {messages.login}
                                            </p>
                                        )}

                                    </form>

                                    <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                                        <div className="h-px flex-1 bg-slate-500" />
                                        ou
                                        <div className="h-px flex-1 bg-slate-500" />
                                    </div>

                                    <SocialButtons onSocial={handleSocial} />

                                    <p className="mt-6 text-center text-xs text-slate-300">
                                        Não tem uma conta?{" "}

                                        <button
                                            onClick={() => showScreen("register")}
                                            className="font-bold text-yellow-300 hover:underline"
                                        >
                                            Inscreva-se
                                        </button>
                                    </p>

                                </div>

                            )}

                            {/* TELA 2 - CADASTRO */}

                            {screen === "register" && (

                                <div>

                                    <button
                                        onClick={() => showScreen("login")}
                                        className="mb-5 text-sm text-slate-300 hover:text-yellow-300"
                                    >
                                        ← Voltar para login
                                    </button>

                                    <h2 className="mb-7 text-3xl font-bold">
                                        Cadastre-se
                                    </h2>

                                    <form onSubmit={handleRegister}>

                                        <div className="mb-4">
                                            <label className={labelClass}>
                                                Nome
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Insira o seu nome"
                                                className={inputClass}
                                                value={userData.name}
                                                onChange={(e) =>
                                                    updateUser("name", e.target.value)
                                                }
                                                maxLength={80}
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className={labelClass}>
                                                E-mail
                                            </label>

                                            <input
                                                type="email"
                                                placeholder="Insira seu e-mail"
                                                className={inputClass}
                                                value={userData.email}
                                                onChange={(e) =>
                                                    updateUser("email", e.target.value)
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className={labelClass}>
                                                Telefone
                                            </label>

                                            <input
                                                type="tel"
                                                placeholder="(00) 00000-0000"
                                                className={inputClass}
                                                value={userData.phone}
                                                onChange={(e) =>
                                                    updateUser("phone", formatPhone(e.target.value))
                                                }
                                                maxLength={15}
                                                required
                                            />
                                        </div>

                                        <button type="submit" className={buttonClass}>
                                            Continuar
                                        </button>

                                        {messages.register && (
                                            <p className="mt-3 text-xs text-red-300">
                                                {messages.register}
                                            </p>
                                        )}

                                    </form>

                                    <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
                                        <div className="h-px flex-1 bg-slate-500" />
                                        ou
                                        <div className="h-px flex-1 bg-slate-500" />
                                    </div>

                                    <SocialButtons onSocial={handleSocial} />

                                    <p className="mt-6 text-center text-xs text-slate-300">
                                        Já tem uma conta?{" "}

                                        <button
                                            onClick={() => showScreen("login")}
                                            className="font-bold text-yellow-300 hover:underline"
                                        >
                                            Entre
                                        </button>
                                    </p>

                                </div>

                            )}

                            {/* TELA 3 - FINALIZAR CADASTRO */}

                            {screen === "finish" && (

                                <div>

                                    <button
                                        onClick={() => showScreen("register")}
                                        className="mb-5 text-sm text-slate-300 hover:text-yellow-300"
                                    >
                                        ← Voltar
                                    </button>

                                    <h2 className="mb-7 text-3xl font-bold">
                                        Quase lá!
                                    </h2>

                                    <form onSubmit={handleFinish}>

                                        <div className="mb-4">
                                            <label className={labelClass}>
                                                Data de nascimento
                                            </label>

                                            <input
                                                type="date"
                                                className={inputClass}
                                                value={userData.birthDate}
                                                onChange={(e) =>
                                                    updateUser("birthDate", e.target.value)
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className={labelClass}>
                                                Senha
                                            </label>

                                            <input
                                                type="password"
                                                placeholder="Insira sua senha"
                                                className={inputClass}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                minLength={8}
                                                required
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <label className={labelClass}>
                                                Confirme a senha
                                            </label>

                                            <input
                                                type="password"
                                                placeholder="Confirme sua senha"
                                                className={inputClass}
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(e.target.value)
                                                }
                                                minLength={8}
                                                required
                                            />
                                        </div>

                                        <button type="submit" className={buttonClass}>
                                            Finalizar cadastro
                                        </button>

                                        {messages.finish && (
                                            <p className="mt-3 text-xs text-green-300">
                                                {messages.finish}
                                            </p>
                                        )}

                                    </form>

                                    <p className="mt-6 text-center text-xs text-slate-300">
                                        Já tem uma conta?{" "}

                                        <button
                                            onClick={() => showScreen("login")}
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
                onClick={() => onSocial("Google")}
                className="h-11 flex-1 rounded-lg border border-gray-300 bg-gray-100 text-xl font-bold text-gray-700 transition hover:bg-white hover:-translate-y-0.5"
            >
                G
            </button>

            <button
                type="button"
                onClick={() => onSocial("facebook")}
                className="h-11 flex-1 rounded-lg border border-gray-300 bg-gray-100 text-xl font-bold text-gray-700 transition hover:bg-white hover:-translate-y-0.5"
            >
                f
            </button>

        </div>
    );
}
