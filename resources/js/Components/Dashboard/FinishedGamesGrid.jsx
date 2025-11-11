import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Trophy, CheckCircle2, ChevronRight } from 'lucide-react';

export default function FinishedGamesGrid({ games }) {
    if (!games || games.length === 0) {
        return (
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl p-8 border border-gray-700/50 shadow-2xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Recent Results</h3>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Completed Games</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-700 opacity-20" />
                            <p className="text-sm font-semibold text-gray-400">No recent finished games</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl p-8 border border-gray-700/50 shadow-2xl h-full">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 shadow-inner shadow-green-500/10" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Recent Results</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Completed Games</p>
                    </div>
                </div>

                {/* Games List */}
                <div className="space-y-4">
                    {games.slice(0, 8).map((game, index) => {
                        const homeWon = (game.scores?.home?.total || 0) > (game.scores?.away?.total || 0);
                        const awayWon = (game.scores?.away?.total || 0) > (game.scores?.home?.total || 0);

                        return (
                            <Link
                                key={game.id}
                                href={`/games/${game.league?.id || 'nba'}/${game.id}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group/item relative"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/0 via-green-500/30 to-green-500/0 rounded-2xl opacity-0 group-hover/item:opacity-100 blur transition-all duration-300" />

                                    <div className="relative p-4 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-700/40 group-hover/item:border-green-500/40 transition-all duration-300 shadow-lg">
                                        {/* Final Badge */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-black text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                                FINAL
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover/item:text-green-400 group-hover/item:translate-x-1 transition-all" />
                                        </div>

                                        <div className="space-y-3">
                                            {/* Home Team */}
                                            <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${homeWon ? 'bg-green-500/10 border border-green-500/30' : 'border border-gray-700/20'}`}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    {game.teams?.home?.logo && (
                                                        <div className="relative">
                                                            <div className={`absolute inset-0 rounded-full blur-md transition-all ${homeWon ? 'bg-white/30' : 'bg-white/10'}`} />
                                                            <img
                                                                src={game.teams.home.logo}
                                                                alt=""
                                                                className="relative h-6 w-6 object-contain"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className={`text-sm font-bold ${homeWon ? 'text-white' : 'text-gray-400'}`}>
                                                        {game.teams?.home?.name || 'Home'}
                                                    </span>
                                                    {homeWon && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                                                </div>
                                                <span className={`text-xl font-black ml-3 ${homeWon ? 'text-white' : 'text-gray-500'}`}>
                                                    {game.scores?.home?.total || 0}
                                                </span>
                                            </div>

                                            {/* Away Team */}
                                            <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${awayWon ? 'bg-green-500/10 border border-green-500/30' : 'border border-gray-700/20'}`}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    {game.teams?.away?.logo && (
                                                        <div className="relative">
                                                            <div className={`absolute inset-0 rounded-full blur-md transition-all ${awayWon ? 'bg-white/30' : 'bg-white/10'}`} />
                                                            <img
                                                                src={game.teams.away.logo}
                                                                alt=""
                                                                className="relative h-6 w-6 object-contain"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className={`text-sm font-bold ${awayWon ? 'text-white' : 'text-gray-400'}`}>
                                                        {game.teams?.away?.name || 'Away'}
                                                    </span>
                                                    {awayWon && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                                                </div>
                                                <span className={`text-xl font-black ml-3 ${awayWon ? 'text-white' : 'text-gray-500'}`}>
                                                    {game.scores?.away?.total || 0}
                                                </span>
                                            </div>
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

