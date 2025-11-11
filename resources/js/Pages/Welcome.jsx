import { Head, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { motion } from 'framer-motion';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="GlobalHoops — Só Basquetebol" />
            <div className="relative min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-300 dark:from-zinc-950 dark:via-black dark:to-orange-950 text-neutral-900 dark:text-white overflow-hidden">

                {/* Background Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 0.3, scale: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-orange-300 dark:bg-orange-700/30 blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.25, scale: 1 }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-amber-200 dark:bg-orange-900/20 blur-3xl"
                />

                <div className="relative flex min-h-screen flex-col items-center justify-center px-6 selection:bg-orange-600 selection:text-white">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full max-w-6xl py-8">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.6 }}
                                className="rounded-full bg-[#FF2D20] p-2 shadow-md shadow-[#FF2D20]/40"
                            >
                                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2.5a7.5 7.5 0 11-0.001 15.001A7.5 7.5 0 0112 4.5z" fill="currentColor" />
                                </svg>
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">GlobalHoops</h1>
                                <div className="mt-1 text-xs text-black/60 dark:text-white/60">Pontuações ao vivo e estatísticas — só basquetebol</div>
                            </div>
                            <span className="ml-3 inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[#FF2D20] ring-1 ring-[#FF2D20]/20">
                                Só Basquetebol
                            </span>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <>
                                    <Link href={route('inicio')} className="rounded-md px-3 py-2 text-sm font-medium hover:text-[#FF2D20] transition">
                                        Home
                                    </Link>
                                    <button
                                        onClick={() => Inertia.post(route('logout'))}
                                        className="rounded-md bg-[#FF2D20] px-3 py-2 text-sm font-medium text-white hover:bg-[#e0251b] shadow-md transition"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-md px-3 py-2 text-sm font-medium hover:text-[#FF2D20] transition">
                                        Entrar
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md bg-[#FF2D20] px-3 py-2 text-sm font-medium text-white hover:bg-[#e0251b] shadow-md transition"
                                    >
                                        Registar
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero Section */}
                    <main className="mt-10 max-w-5xl w-full text-center lg:text-left">
                        <div className="grid gap-10 lg:grid-cols-2 items-center">
                            <motion.section
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-black dark:text-white">
                                    Resultados ao vivo, estatísticas e calendário —{" "}
                                    <span className="text-[#FF2D20]">só basquetebol</span>
                                </h2>
                                <p className="mt-5 text-lg text-black/70 dark:text-white/70 max-w-lg">
                                    GlobalHoops é a tua plataforma para acompanhar todos os jogos, equipas e jogadores —
                                    com dados atualizados ao segundo.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    {auth.user ? (
                                        <>
                                            <Link href={route('inicio')} className="inline-flex items-center rounded-md bg-[#111827] px-5 py-3 text-sm font-medium text-white hover:bg-black transition shadow">
                                                Go to Home
                                            </Link>
                                            <button onClick={() => Inertia.post(route('logout'))} className="inline-flex items-center rounded-md border px-5 py-3 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                                                Sair
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={route('login')} className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium ring-1 ring-black/5 hover:bg-orange-50 dark:hover:bg-zinc-800 transition">
                                                Entrar
                                            </Link>
                                            <Link href={route('register')} className="inline-flex items-center rounded-md bg-[#FF2D20] px-5 py-3 text-sm font-medium text-white hover:bg-[#e0251b] transition shadow-md">
                                                Registar
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </motion.section>

                            {/* Feature Card */}
                            <motion.aside
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.9 }}
                                className="hidden lg:block"
                            >
                                <div className="rounded-xl bg-gradient-to-br from-orange-100 via-white to-amber-200 dark:from-zinc-900 dark:via-black dark:to-orange-900 p-8 shadow-xl border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center justify-center">
                                        <div className="h-48 w-48 rounded-full bg-[#FF2D20]/10 flex items-center justify-center text-[#FF2D20] text-7xl font-bold">
                                            🏀
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <h4 className="font-bold text-lg">Design focado no basquetebol</h4>
                                        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
                                            Informação clara, moderna e dinâmica para fãs, técnicos e analistas.
                                        </p>
                                    </div>
                                </div>
                            </motion.aside>
                        </div>

                        {/* Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {[
                                { title: 'Ao Vivo', desc: 'Placar ao minuto, posses e atualizações em tempo real.' },
                                { title: 'Jogadores & Estatísticas', desc: 'Pontos, ressaltos, minutos e muito mais.' },
                                { title: 'Tabelas & Calendário', desc: 'Classificações e calendário de competições.' },
                                { title: 'Alertas Personalizados', desc: 'Siga equipas e receba notificações.' },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="rounded-xl border bg-white/70 dark:bg-zinc-900/70 p-5 shadow-sm hover:shadow-lg backdrop-blur-md"
                                >
                                    <h3 className="font-semibold text-lg text-[#FF2D20]">{item.title}</h3>
                                    <p className="mt-2 text-sm text-black/70 dark:text-white/70">{item.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-16 py-8 text-center text-sm text-black/60 dark:text-white/60">
                        © {new Date().getFullYear()} <span className="font-semibold text-[#FF2D20]">GlobalHoops</span> — Plataforma dedicada ao basquetebol.
                    </footer>
                </div>
            </div>
        </>
    );
}
