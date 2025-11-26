import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Calendar, Award } from 'lucide-react';

export default function PlayerShow({ auth, player, league }) {
    if (!player || !player.info) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex items-center gap-4">
                        <Link href="/inicio" className="text-gray-400 hover:text-white transition">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-2xl font-bold leading-tight text-gray-100">Player Not Found</h2>
                    </div>
                }
            >
                <Head title="Player Not Found" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-gray-400">Could not find player information.</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const { info, averages, totals, recentGames, gamesPlayed } = player;

    const mainStats = [
        { label: 'PTS', value: averages.PTS || 0, total: totals.PTS || 0, color: 'from-orange-500 to-red-500' },
        { label: 'REB', value: averages.REB || 0, total: totals.REB || 0, color: 'from-blue-500 to-cyan-500' },
        { label: 'AST', value: averages.AST || 0, total: totals.AST || 0, color: 'from-green-500 to-emerald-500' },
        { label: 'STL', value: averages.STL || 0, total: totals.STL || 0, color: 'from-purple-500 to-pink-500' },
        { label: 'BLK', value: averages.BLK || 0, total: totals.BLK || 0, color: 'from-yellow-500 to-orange-500' },
    ];

    const additionalStats = Object.entries(averages)
        .filter(([stat]) => !['PTS', 'REB', 'AST', 'STL', 'BLK'].includes(stat))
        .slice(0, 8);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href="/inicio" className="text-gray-400 hover:text-[#FF2D20] transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-2xl font-bold leading-tight text-gray-100">Player Profile</h2>
                </div>
            }
        >
            <Head title={`${info.name} - Stats`} />

            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    {/* Hero Card com Info do Jogador */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent" />
                        <div className="relative p-8">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                {/* Avatar/Imagem */}
                                <div className="relative">
                                    {info.image ? (
                                        <div className="relative">
                                            <div className="w-32 h-32 rounded-2xl bg-gray-900/50 border border-gray-700/30 p-3 backdrop-blur-sm">
                                                <img
                                                    src={info.image}
                                                    alt={info.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-2xl bg-gray-900/50 border border-gray-700/30 flex items-center justify-center text-4xl font-bold text-white">
                                            {info.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    {info.jersey && (
                                        <div className="absolute -bottom-2 -right-2 bg-gold text-black font-bold text-lg px-3 py-1.5 rounded-xl shadow-lg">
                                            #{info.jersey}
                                        </div>
                                    )}
                                </div>

                                {/* Info Principal */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                        <span className="px-4 py-1.5 bg-gold/10 text-gold font-bold text-sm rounded-full border border-gold/30">
                                            {info.position}
                                        </span>
                                        <span className="px-4 py-1.5 bg-gray-700/30 text-gray-300 font-medium text-sm rounded-full border border-gray-600/30">
                                            {league.toUpperCase()}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">{info.name}</h1>
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                        {info.teamLogo && (
                                            <img src={info.teamLogo} alt={info.team} className="w-10 h-10 drop-shadow-lg" />
                                        )}
                                        <p className="text-2xl text-gray-300 font-medium">{info.team}</p>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                                        <Award className="w-5 h-5" />
                                        <p className="text-lg">{gamesPlayed} games in last 7 days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Estatísticas Principais em Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {mainStats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="group"
                            >
                                <div className="relative rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-6 text-center hover:border-gold/30 transition-all duration-300">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">{stat.label}</p>
                                    <p className="text-4xl font-black text-gold mb-1">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-500">Total: {stat.total}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Duas Colunas: Stats Adicionais & Jogos Recentes */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Estatísticas Adicionais */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-1"
                        >
                            <div className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-6 h-full">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gold" />
                                    Additional Stats
                                </h2>
                                <div className="space-y-2">
                                    {additionalStats.map(([stat, value]) => (
                                        <div key={stat} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-700/30 hover:border-gold/30 transition">
                                            <span className="text-gray-400 text-sm font-medium">{stat}</span>
                                            <span className="text-white text-lg font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Jogos Recentes */}
                        {recentGames && recentGames.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-2"
                            >
                                <div className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gold" />
                                        Recent Performances
                                    </h2>
                                    <div className="space-y-3">
                                        {recentGames.map((game, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + index * 0.05 }}
                                                className="bg-gray-900/50 rounded-2xl p-4 hover:bg-gray-900/70 transition border border-gray-700/30 hover:border-gold/30"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-white font-semibold text-lg">vs {game.opponent}</p>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {game.date ? new Date(game.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            }) : 'Date N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-gold">
                                                            {game.stats.PTS || 0}
                                                        </p>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Points</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                    {Object.entries(game.stats).slice(1, 7).map(([stat, value]) => (
                                                        <div key={stat} className="bg-gray-800/50 rounded-lg px-2 py-2 text-center">
                                                            <p className="text-xs text-gray-500 mb-1">{stat}</p>
                                                            <p className="text-sm font-bold text-white">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
