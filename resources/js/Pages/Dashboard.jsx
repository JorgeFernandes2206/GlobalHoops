import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import HeroGame from '@/Components/Dashboard/HeroGame';
import LiveGamesGrid from '@/Components/Dashboard/LiveGamesGrid';
import UpcomingGamesList from '@/Components/Dashboard/UpcomingGamesList';
import FinishedGamesGrid from '@/Components/Dashboard/FinishedGamesGrid';
import TopPlayersCard from '@/Components/Dashboard/TopPlayersCard';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, ChevronRight } from 'lucide-react';
import axios from 'axios';

export default function Dashboard({ liveGames: initialLiveGames, upcomingGames, finishedGames, topPlayers }) {
    const [liveGames, setLiveGames] = useState(initialLiveGames || []);

    // Auto-refresh live games every 30 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get('/api/games/live');
                setLiveGames(response.data);
            } catch (error) {
                console.error('Error refreshing live games:', error);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Escolher jogo em destaque
    const featuredGame = liveGames && liveGames.length > 0 
        ? liveGames[0] 
        : (upcomingGames && upcomingGames.length > 0 ? upcomingGames[0] : null);

    return (
        <AuthenticatedLayout
            header={
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-purple-500/10 animate-gradient"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 leading-tight">
                                GlobalHoops Dashboard
                            </h2>
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
                                Season 2025-26
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Your premium basketball hub</p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Featured Game - Premium Hero */}
                    {featuredGame && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                            <div className="relative">
                                <HeroGame game={featuredGame} />
                            </div>
                        </motion.div>
                    )}

                    {/* Live Games - Premium Section */}
                    {liveGames && liveGames.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                        <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                                        Live Now
                                    </h3>
                                </div>
                                <Link
                                    href={route('games.index')}
                                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 border border-orange-500/20 rounded-xl text-orange-400 hover:text-orange-300 font-semibold transition-all duration-300"
                                >
                                    View All
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <LiveGamesGrid games={liveGames} />
                        </motion.div>
                    )}

                    {/* Games and Players Grid - Premium Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upcoming Games */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                                            <Calendar className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">
                                            Upcoming
                                        </h3>
                                    </div>
                                    <Link
                                        href={route('games.index')}
                                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors group"
                                    >
                                        All
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                                <UpcomingGamesList games={(upcomingGames || []).slice(0, 6)} />
                            </div>
                        </motion.div>

                        {/* Recent Results */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                                            <Trophy className="w-5 h-5 text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">
                                            Recent
                                        </h3>
                                    </div>
                                    <Link
                                        href={route('games.index')}
                                        className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium transition-colors group"
                                    >
                                        All
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                                <FinishedGamesGrid games={(finishedGames || []).slice(0, 6)} />
                            </div>
                        </motion.div>

                        {/* Top Players */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                                            <Trophy className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">
                                            Top Players
                                        </h3>
                                    </div>
                                </div>
                                <TopPlayersCard players={topPlayers || []} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
