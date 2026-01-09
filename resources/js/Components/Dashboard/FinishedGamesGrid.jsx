import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Trophy, CheckCircle2, ChevronRight } from 'lucide-react';

export default function FinishedGamesGrid({ games }) {
    if (!games || games.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-8 border border-white/5 h-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.08),transparent)]" />
                <div className="relative">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-green-500/20" />
                            <p className="text-sm font-semibold text-gray-400">No recent results</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-white/5 shadow-xl h-full">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(34,197,94,0.08),transparent)]" />

            <div className="relative p-6">

                {/* Games List */}
                <div className="space-y-3">
                    {games.slice(0, 6).map((game, index) => {
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
                                    transition={{ delay: index * 0.05 }}
                                    className="group/item relative"
                                >
                                    <div className="relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-800/80 hover:to-gray-900/80 rounded-lg border border-white/5 hover:border-green-500/30 transition-all duration-300 shadow-md">
                                        {/* Final Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-white bg-gradient-to-r from-green-500/90 to-emerald-500/90 px-3 py-1 rounded-lg shadow-lg shadow-green-500/20">
                                                FINAL
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover/item:text-green-400 group-hover/item:translate-x-1 transition-all" />
                                        </div>

                                        <div className="space-y-2">
                                            {/* Home Team */}
                                            <div className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${homeWon ? 'bg-green-500/10 border border-green-500/30' : 'border border-white/5'}`}>
                                                <div className="flex items-center gap-2.5 flex-1">
                                                    {game.teams?.home?.logo && (
                                                        <div className="relative">
                                                            <div className={`absolute inset-0 rounded-lg blur-md transition-all ${homeWon ? 'bg-green-500/20' : 'bg-gray-500/10'}`} />
                                                            <div className="relative p-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/5">
                                                                <img
                                                                    src={game.teams.home.logo}
                                                                    alt=""
                                                                    className="h-5 w-5 object-contain"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <span className={`text-sm font-bold ${homeWon ? 'text-white' : 'text-gray-400'}`}>
                                                        {game.teams?.home?.name || 'Home'}
                                                    </span>
                                                    {homeWon && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                                                </div>
                                                <span className={`text-lg font-black ml-3 ${homeWon ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400' : 'text-gray-500'}`}>
                                                    {game.scores?.home?.total || 0}
                                                </span>
                                            </div>

                                            {/* Away Team */}
                                            <div className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${awayWon ? 'bg-green-500/10 border border-green-500/30' : 'border border-white/5'}`}>
                                                <div className="flex items-center gap-2.5 flex-1">
                                                    {game.teams?.away?.logo && (
                                                        <div className="relative">
                                                            <div className={`absolute inset-0 rounded-lg blur-md transition-all ${awayWon ? 'bg-green-500/20' : 'bg-gray-500/10'}`} />
                                                            <div className="relative p-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/5">
                                                                <img
                                                                    src={game.teams.away.logo}
                                                                    alt=""
                                                                    className="h-5 w-5 object-contain"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <span className={`text-sm font-bold ${awayWon ? 'text-white' : 'text-gray-400'}`}>
                                                        {game.teams?.away?.name || 'Away'}
                                                    </span>
                                                    {awayWon && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                                                </div>
                                                <span className={`text-lg font-black ml-3 ${awayWon ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400' : 'text-gray-500'}`}>
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

