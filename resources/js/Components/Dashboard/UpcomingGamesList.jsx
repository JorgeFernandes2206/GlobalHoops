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
            <div className="relative group overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.03)] p-8 border border-[rgba(255,255,255,0.04)] shadow-glass h-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(212,175,55,0.04),transparent)]" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-[rgba(212,175,55,0.08)] shadow-sm">
                            <Calendar className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Upcoming Games</h3>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Scheduled Matches</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-700 opacity-20" />
                            <p className="text-sm font-semibold text-gray-400">No games scheduled</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl p-8 border border-gray-700/50 shadow-2xl h-full">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_0%_0%,rgba(212,175,55,0.03),transparent)]" />
            <div className="absolute inset-0 shadow-inner" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Upcoming Games</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Scheduled Matches</p>
                    </div>
                </div>

                {/* Games List */}
                <div className="space-y-4">
                    {games.slice(0, 8).map((game, index) => {
                        const gameDate = game.date ? new Date(game.date) : null;

                        return (
                            <Link
                                key={game.id}
                                href={`/games/${game.league?.id || 'nba'}/${game.id}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group/item relative"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 rounded-2xl opacity-0 group-hover/item:opacity-100 blur transition-all duration-300" />

                                    <div className="relative p-4 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-700/40 group-hover/item:border-blue-500/40 transition-all duration-300 shadow-lg">
                                        <div className="flex items-center justify-between">
                                            {/* Teams */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {/* Home Team */}
                                                <div className="flex items-center gap-2.5 flex-1">
                                                    {game.teams?.home?.logo && (
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover/item:bg-white/30 transition-all" />
                                                            <img
                                                                src={game.teams.home.logo}
                                                                alt=""
                                                                className="relative h-7 w-7 flex-shrink-0 object-contain"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-bold text-white truncate">
                                                        {game.teams?.home?.name || 'Home'}
                                                    </span>
                                                </div>

                                                {/* VS */}
                                                <span className="text-xs font-black text-gray-600 px-2 flex-shrink-0">VS</span>

                                                {/* Away Team */}
                                                <div className="flex items-center gap-2.5 flex-1 justify-end">
                                                    <span className="text-sm font-bold text-white truncate">
                                                        {game.teams?.away?.name || 'Away'}
                                                    </span>
                                                    {game.teams?.away?.logo && (
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover/item:bg-white/30 transition-all" />
                                                            <img
                                                                src={game.teams.away.logo}
                                                                alt=""
                                                                className="relative h-7 w-7 flex-shrink-0 object-contain"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:item:text-gold group-hover:item:translate-x-1 transition-all flex-shrink-0 ml-3" />
                                        </div>

                                        {/* Date and Time */}
                                        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-700/40">
                                            {gameDate ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                            <Calendar className="w-4 h-4 text-gold" />
                                                        <span className="text-xs font-semibold">
                                                            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                            <Clock className="w-4 h-4 text-gold" />
                                                        <span className="text-xs font-semibold">
                                                            {gameDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock className="w-4 h-4" />
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
