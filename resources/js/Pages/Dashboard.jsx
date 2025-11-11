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

            {/* Premium Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,45,32,0.15)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,140,0,0.1)_0%,_transparent_50%)]" />

                {/* Floating Orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-96 h-96 bg-[#FF2D20]/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 80, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
                />

                <div className="relative mx-auto max-w-[1920px] px-6 sm:px-8 lg:px-12 pt-12 pb-20">
                    {/* Hero Game with Premium Frame */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Glow Effect Behind Hero */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#FF2D20]/20 via-orange-600/20 to-[#FF2D20]/20 rounded-[3rem] blur-3xl opacity-30" />
                        <div className="relative">
                            <HeroGame game={featuredGame} />
                        </div>
                    </motion.div>

                    {/* Live Games Section - Below Hero */}
                    {liveGames && liveGames.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="mt-16"
                        >
                            <LiveGamesGrid games={liveGames} />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Premium Content Grid */}
            <div className="relative bg-black">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent" />

                <div className="relative mx-auto max-w-[1920px] px-6 sm:px-8 lg:px-12 py-16">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* Main Content Column - 8/12 */}
                        <div className="xl:col-span-8 space-y-12">
                            {/* Upcoming & Finished Games - Premium Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <motion.div
                                    initial={{ opacity: 0, x: -40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative">
                                        <UpcomingGamesList games={upcomingGames || []} />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative">
                                        <FinishedGamesGrid games={finishedGames || []} />
                                    </div>
                                </motion.div>
                            </div>

                            {/* News Section - Premium Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative">
                                    <NewsSection news={news || []} />
                                </div>
                            </motion.div>
                        </div>

                        {/* Premium Sidebar - 4/12 */}
                        <div className="xl:col-span-4 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="xl:sticky xl:top-8 space-y-8"
                            >
                                {/* Top Players with Glow */}
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FF2D20]/20 to-orange-600/20 rounded-3xl blur-xl opacity-50" />
                                    <div className="relative">
                                        <TopPlayersCard players={topPlayers || []} />
                                    </div>
                                </div>

                                {/* Notifications with Glow */}
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50" />
                                    <div className="relative">
                                        <NotificationsSidebar
                                            notifications={notifications || []}
                                            liveGames={liveGames}
                                            upcomingGames={upcomingGames}
                                            topPlayers={topPlayers}
                                            news={news}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
