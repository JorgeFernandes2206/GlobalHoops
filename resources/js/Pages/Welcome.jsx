import { Head, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="GlobalHoops — Só Basquetebol" />
            <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">

                {/* Background Animation - CSS only */}
                <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative flex min-h-screen flex-col items-center justify-center px-6 selection:bg-orange-600 selection:text-white">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full max-w-6xl py-8">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl hover:rotate-180 transition-transform duration-600">
                                🏀
                            </div>
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
                                    <Link href={route('inicio')} className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-orange-500 transition">
                                        Home
                                    </Link>
                                    <button
                                        onClick={() => Inertia.post(route('logout'))}
                                        className="rounded-md bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-orange-500/50 transition"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-orange-500 transition">
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-orange-500/50 transition"
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
                            <section className="animate-fade-in">
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
                                            <Link href={route('inicio')} className="inline-flex items-center rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-orange-500/50 transition">
                                                Go to Home
                                            </Link>
                                            <button onClick={() => Inertia.post(route('logout'))} className="inline-flex items-center rounded-lg border border-gray-700 px-6 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={route('register')} className="inline-flex items-center rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-orange-500/50 transition">
                                                Sign Up Free
                                            </Link>
                                            <Link href={route('login')} className="inline-flex items-center rounded-lg border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition">
                                                Login
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Feature Card */}
                            <aside className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
                            </aside>
                        </div>

                        {/* Cards */}
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            {[
                                { title: 'Live Games', desc: 'Minute-by-minute scores, possessions and real-time updates.' },
                                { title: 'Players & Stats', desc: 'Points, rebounds, minutes and much more.' },
                                { title: 'Standings & Schedule', desc: 'League standings and competition schedule.' },
                                { title: 'Custom Alerts', desc: 'Follow teams and receive notifications.' },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/90 p-5 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-md"
                                >
                                    <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                                    <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
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
