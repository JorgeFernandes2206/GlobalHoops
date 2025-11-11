import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Play, ChevronRight, Activity } from 'lucide-react';

export default function HeroGame({ game }) {
    if (!game) {
        return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-black p-12 text-center border border-gray-700/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,45,32,0.1),transparent)]" />
                <div className="relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 mb-4">
                        <Activity className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-xl text-gray-400 font-medium">No live games right now</p>
                    <p className="text-sm text-gray-500 mt-2">Check back soon for live action!</p>
                </div>
            </div>
        );
    }

    const { teams, scores, status, league } = game;

    // Determine live state robustly: status may be an object or string
    let isLive = false;
    try {
        if (status) {
            if (typeof status === 'string') {
                // some payloads send status as string like 'In Progress'
                isLive = /in progress|in/i.test(status);
            } else {
                isLive = (status.type && status.type.state === 'in') || (status.state === 'in') || (status.status === 'in');
            }
        }
    } catch (e) {
        isLive = false;
    }

    const resolveLogo = (teamObj) => {
        if (!teamObj) return null;
        return (
            teamObj.logo ||
            teamObj.logoUrl ||
            teamObj.logo?.href ||
            (teamObj.logos && teamObj.logos[0] && teamObj.logos[0].href) ||
            (teamObj.images && teamObj.images[0] && teamObj.images[0].href) ||
            null
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,45,32,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,45,32,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Border Gradient */}
            <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-[#FF2D20]/50 via-orange-500/30 to-transparent" />

            <div className="relative p-8 md:p-12">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {isLive && (
                            <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-[#FF2D20] rounded-full blur-lg opacity-50" />
                                <div className="relative inline-flex items-center gap-2 rounded-full bg-[#FF2D20] px-5 py-2.5 shadow-lg">
                                    <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse"></span>
                                    <span className="text-sm font-black text-white tracking-wider">LIVE NOW</span>
                                </div>
                            </motion.div>
                        )}
                        <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur text-sm font-semibold text-gray-300 border border-white/20">
                            {league?.name || 'NBA'}
                        </span>
                    </div>
                </div>

                {/* Matchup */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-8">
                    {/* Home Team */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center md:text-right"
                    >
                        <div className="flex flex-col items-center md:items-end gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#FF2D20]/20 rounded-2xl blur-xl group-hover:bg-[#FF2D20]/30 transition" />
                                {resolveLogo(teams?.home) ? (
                                    <img
                                        src={resolveLogo(teams.home)}
                                        alt={teams.home.name}
                                        className="relative h-28 w-28 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">
                                            {teams?.home?.name?.substring(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
                                    {teams?.home?.name || 'Home'}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium">HOME</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Score */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D20] to-orange-600 rounded-2xl blur-xl opacity-30" />
                            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50">
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-6xl md:text-7xl font-black bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                                        {scores?.home?.total || 0}
                                    </span>
                                    <span className="text-4xl font-bold text-gray-600">-</span>
                                    <span className="text-6xl md:text-7xl font-black bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                                        {scores?.away?.total || 0}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-[#FF2D20] animate-pulse" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                        {status?.long || 'In Progress'}
                                    </p>
                                    <div className="h-1 w-1 rounded-full bg-[#FF2D20] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Away Team */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center md:text-left"
                    >
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#FF2D20]/20 rounded-2xl blur-xl group-hover:bg-[#FF2D20]/30 transition" />
                                {resolveLogo(teams?.away) ? (
                                    <img
                                        src={resolveLogo(teams.away)}
                                        alt={teams.away.name}
                                        className="relative h-28 w-28 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">
                                            {teams?.away?.name?.substring(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
                                    {teams?.away?.name || 'Away'}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium">AWAY</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Action Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <Link
                        href={`/games/${game.league?.id || 'nba'}/${game.id}`}
                        className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#FF2D20] to-orange-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:shadow-[#FF2D20]/50 hover:shadow-2xl hover:scale-105"
                    >
                        <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="white" />
                        <span>Watch Game Live</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
