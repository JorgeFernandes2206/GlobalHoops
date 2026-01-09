import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

export default function UpcomingGamesList({ games }) {
    // Small format helpers for odds display
    const fmtMl = (v) => {
        if (v === null || v === undefined) return null;
        return (v > 0 ? `+${v}` : String(v));
    };

    const fmtSpread = (v) => {
        if (v === null || v === undefined) return null;
        return (v > 0 ? `+${v}` : String(v));
    };

    if (!games || games.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-8 border border-white/5 h-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.08),transparent)]" />
                <div className="relative">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-500/20" />
                            <p className="text-sm font-semibold text-gray-400">No upcoming games</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-white/5 shadow-xl h-full">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.08),transparent)]" />

            <div className="relative p-6">

                {/* Games List */}
                <div className="space-y-4">
                    {games.slice(0, 6).map((game, index) => {
                        const gameDate = game.date ? new Date(game.date) : null;

                        return (
                            <Link
                                key={game.id}
                                href={`/games/${game.league?.id || 'nba'}/${game.id}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group/item relative"
                                >
                                    <div className="relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-800/80 hover:to-gray-900/80 rounded-lg border border-white/5 hover:border-blue-500/30 transition-all duration-300 shadow-md">
                                        <div className="flex items-center justify-between">
                                            {/* Teams */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {/* Home Team */}
                                                <div className="flex items-center gap-2.5 flex-1">
                                                    {game.teams?.home?.logo && (
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md opacity-0 group-hover/item:opacity-100 transition-all" />
                                                            <div className="relative p-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/5">
                                                                <img
                                                                    src={game.teams.home.logo}
                                                                    alt=""
                                                                    className="h-6 w-6 object-contain"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-bold text-white group-hover/item:text-blue-400 truncate transition-colors">
                                                        {game.teams?.home?.name || 'Home'}
                                                    </span>
                                                </div>

                                                {/* VS */}
                                                <span className="text-[10px] font-black text-gray-500 px-2 flex-shrink-0">VS</span>

                                                {/* Away Team */}
                                                <div className="flex items-center gap-2.5 flex-1 justify-end">
                                                    <span className="text-sm font-bold text-white group-hover/item:text-blue-400 truncate transition-colors">
                                                        {game.teams?.away?.name || 'Away'}
                                                    </span>
                                                    {game.teams?.away?.logo && (
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md opacity-0 group-hover/item:opacity-100 transition-all" />
                                                            <div className="relative p-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/5">
                                                                <img
                                                                    src={game.teams.away.logo}
                                                                    alt=""
                                                                    className="h-6 w-6 object-contain"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover/item:text-blue-400 group-hover/item:translate-x-1 transition-all flex-shrink-0 ml-3" />
                                        </div>

                                        {/* Date and Time */}
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                                            {gameDate ? (
                                                <>
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                                        <span className="text-xs font-semibold">
                                                            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                        <span className="text-xs font-semibold">
                                                            {gameDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-semibold">TBD</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
