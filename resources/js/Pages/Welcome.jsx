import { Head, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { motion } from 'framer-motion';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="GlobalHoops — Só Basquetebol" />
            <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">

                {/* Background Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 0.1, scale: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.08, scale: 1 }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-white/5 blur-3xl"
                />

                <div className="relative flex min-h-screen flex-col items-center justify-center px-6 selection:bg-orange-600 selection:text-white">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full max-w-6xl py-8">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl"
                            >
                                🏀
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-white">GlobalHoops</h1>
                                <div className="mt-1 text-xs text-gray-400">Live scores and statistics — basketball only</div>
                            </div>
                            <span className="ml-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                                Basketball Only
                            </span>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <>
                                    <Link href={route('inicio')} className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
                                        Home
                                    </Link>
                                    <button
                                        onClick={() => Inertia.post(route('logout'))}
                                        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 shadow-md transition"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 shadow-md transition"
                                    >
                                        Sign Up
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
                                <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
                                    Live scores, statistics and schedule —{" "}
                                    <span className="text-white">basketball only</span>
                                </h2>
                                <p className="mt-5 text-lg text-gray-400 max-w-lg">
                                    GlobalHoops is your platform to follow all games, teams and players —
                                    with data updated every second.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    {auth.user ? (
                                        <>
                                            <Link href={route('inicio')} className="inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-200 transition shadow">
                                                Go to Home
                                            </Link>
                                            <button onClick={() => Inertia.post(route('logout'))} className="inline-flex items-center rounded-md border border-white/20 px-5 py-3 text-sm text-gray-300 hover:bg-white/10 transition">
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={route('login')} className="inline-flex items-center rounded-md px-5 py-3 text-sm font-medium ring-1 ring-white/20 text-gray-300 hover:bg-white/10 transition">
                                                Login
                                            </Link>
                                            <Link href={route('register')} className="inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-200 transition shadow-md">
                                                Sign Up
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
                                <div className="rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 p-8 shadow-xl border border-gray-700/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center">
                                        <div className="h-48 w-48 rounded-full bg-white/10 flex items-center justify-center text-white text-7xl font-bold">
                                            🏀
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <h4 className="font-bold text-lg text-white">Basketball-focused design</h4>
                                        <p className="mt-2 text-sm text-gray-400">
                                            Clear, modern and dynamic information for fans, coaches and analysts.
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
                                { title: 'Live Games', desc: 'Minute-by-minute scores, possessions and real-time updates.' },
                                { title: 'Players & Stats', desc: 'Points, rebounds, minutes and much more.' },
                                { title: 'Standings & Schedule', desc: 'League standings and competition schedule.' },
                                { title: 'Custom Alerts', desc: 'Follow teams and receive notifications.' },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/90 p-5 shadow-sm hover:shadow-lg backdrop-blur-md"
                                >
                                    <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                                    <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-16 py-8 text-center text-sm text-gray-400">
                        © {new Date().getFullYear()} <span className="font-semibold text-white">GlobalHoops</span> — Platform dedicated to basketball.
                    </footer>
                </div>
            </div>
        </>
    );
}
