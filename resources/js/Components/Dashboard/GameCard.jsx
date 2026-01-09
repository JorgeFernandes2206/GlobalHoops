import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function GameCard({ game, isLive = false }) {
    const { teams, scores, status, league } = game;

    return (
        <Link href={`/games/${game.league?.id || 'nba'}/${game.id}`}>
            <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm p-5 shadow-xl border border-white/5 hover:border-orange-500/30 hover:shadow-orange-500/10 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
                {/* Premium Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-orange-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />

                {/* Content */}
                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {league?.name || 'NBA'}
                        </span>
                        {isLive && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500/90 to-red-600/90 px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                LIVE
                            </span>
                        )}
                    </div>

                    {/* Teams */}
                    <div className="space-y-3">
                        {/* Home Team */}
                        <div className="flex items-center justify-between group/team">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {teams?.home?.logo && (
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-orange-500/10 rounded-xl blur-lg opacity-0 group-hover/team:opacity-100 transition-opacity duration-300" />
                                        <div className="relative p-1.5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/5">
                                            <img
                                                src={teams.home.logo}
                                                alt={teams.home.name}
                                                loading="lazy"
                                                className="h-9 w-9 object-contain group-hover/team:scale-110 transition-transform duration-300"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    </div>
                                )}
                                <span className="font-bold text-white truncate group-hover/team:text-orange-400 transition-colors">
                                    {teams?.home?.name || 'Home'}
                                </span>
                            </div>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300 ml-2">
                                {scores?.home?.total ?? '-'}
                            </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between group/team">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {teams?.away?.logo && (
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-lg opacity-0 group-hover/team:opacity-100 transition-opacity duration-300" />
                                        <div className="relative p-1.5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/5">
                                            <img
                                                src={teams.away.logo}
                                                alt={teams.away.name}
                                                loading="lazy"
                                                className="h-9 w-9 object-contain group-hover/team:scale-110 transition-transform duration-300"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    </div>
                                )}
                                <span className="font-bold text-white truncate group-hover/team:text-blue-400 transition-colors">
                                    {teams?.away?.name || 'Away'}
                                </span>
                            </div>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300 ml-2">
                                {scores?.away?.total ?? '-'}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-300 transition-colors">
                            {status?.long || 'Scheduled'}
                        </p>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
