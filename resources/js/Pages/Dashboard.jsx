import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import HeroGame from '@/Components/Dashboard/HeroGame';
import LiveGamesGrid from '@/Components/Dashboard/LiveGamesGrid';
import UpcomingGamesList from '@/Components/Dashboard/UpcomingGamesList';
import FinishedGamesGrid from '@/Components/Dashboard/FinishedGamesGrid';
import TopPlayersCard from '@/Components/Dashboard/TopPlayersCard';
import NotificationsSidebar from '@/Components/Dashboard/NotificationsSidebar';
import NewsSection from '@/Components/Dashboard/NewsSection';
import { motion } from 'framer-motion';
import { Flame, RefreshCw, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function Dashboard({ liveGames: initialLiveGames, upcomingGames, finishedGames, topPlayers, notifications, news }) {
    const [liveGames, setLiveGames] = useState(initialLiveGames || []);
    const [loading, setLoading] = useState(false);

    // Auto-refresh jogos ao vivo a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/games/live');
                setLiveGames(response.data);
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error('Error refreshing live games:', error);
                }
            } finally {
                setLoading(false);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Escolher jogo em destaque (o primeiro ao vivo)
    const featuredGame = liveGames && liveGames.length > 0 ? liveGames[0] : null;

    return (
        <AuthenticatedLayout
            header={
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="relative p-3 bg-gradient-to-br from-[#FF2D20] via-orange-600 to-[#FF2D20] rounded-2xl shadow-2xl shadow-[#FF2D20]/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D20] to-orange-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                            <Flame className="relative w-7 h-7 text-white drop-shadow-lg" />
                        </motion.div>
                        <div>
                            <h2 className="text-4xl font-black leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-sm">
                                GlobalHoops
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Sparkles className="w-3 h-3 text-[#FF2D20]" />
                                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Premium Experience</p>
                            </div>
                        </div>
                    </div>
                    {loading && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative overflow-hidden text-sm text-white flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-2xl border border-[#FF2D20]/40 shadow-xl shadow-[#FF2D20]/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF2D20]/10 to-transparent animate-shimmer" />
                            <RefreshCw className="relative w-4 h-4 animate-spin text-[#FF2D20]" />
                            <span className="relative font-bold">Updating Live</span>
                        </motion.span>
                    )}
                </motion.div>
            }
        >
            <Head title="GlobalHoops" />

            {/* Compact Dashboard Layout */}
            <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    {/* Featured Game - Compact */}
                    {featuredGame && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl overflow-hidden"
                        >
                            <HeroGame game={featuredGame} />
                        </motion.div>
                    )}

                    {/* Main Grid - Tudo em uma linha */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left Column - Games */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Live Games - Horizontal compact */}
                            {liveGames && liveGames.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl"
                                >
                                    <LiveGamesGrid games={liveGames} />
                                </motion.div>
                            )}

                            {/* Upcoming & Finished - Side by side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl"
                                >
                                    <UpcomingGamesList games={upcomingGames || []} />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl"
                                >
                                    <FinishedGamesGrid games={finishedGames || []} />
                                </motion.div>
                            </div>

                            {/* News - Compact */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl"
                            >
                                <NewsSection news={news || []} />
                            </motion.div>
                        </div>

                        {/* Right Sidebar - Sticky */}
                        <div className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start space-y-4">
                            {/* Top Players */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl"
                            >
                                <TopPlayersCard players={topPlayers || []} />
                            </motion.div>

                            {/* Notifications */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl"
                            >
                                <NotificationsSidebar
                                    notifications={notifications || []}
                                    liveGames={liveGames}
                                    upcomingGames={upcomingGames}
                                    topPlayers={topPlayers}
                                    news={news}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
