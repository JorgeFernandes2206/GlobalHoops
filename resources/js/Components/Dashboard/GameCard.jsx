import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function GameCard({ game, isLive = false }) {
    const { teams, scores, status, league } = game;

    return (
        <Link href={`/games/${game.league?.id || 'nba'}/${game.id}`}>
            <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#081014_0%,#0f1820_100%)] p-5 shadow-lg border border-[rgba(255,255,255,0.04)] hover:border-[rgba(212,175,55,0.12)] transition-all duration-300 cursor-pointer"
            >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(212,175,55,0),rgba(43,55,72,0))] group-hover:from-[rgba(212,175,55,0.05)] group-hover:to-[rgba(43,55,72,0.04)] transition-all duration-300" />

                {/* Content */}
                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {league?.name || 'NBA'}
                        </span>
                        {isLive && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gold bg-[rgba(212,175,55,0.08)] px-3 py-1 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-[rgba(212,175,55,0.9)] animate-pulse"></span>
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
                                        <div className="absolute inset-0 bg-[rgba(212,175,55,0.06)] rounded-lg blur-md opacity-0 group-hover/team:opacity-100 transition" />
                                        <img
                                            src={teams.home.logo}
                                            alt={teams.home.name}
                                            className="relative h-10 w-10 object-contain group-hover/team:scale-110 transition-transform"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}
                                <span className="font-bold text-white truncate group-hover:text-gold transition-colors">
                                    {teams?.home?.name || 'Home'}
                                </span>
                            </div>
                            <span className="text-2xl font-black text-white ml-2">
                                {scores?.home?.total ?? '-'}
                            </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between group/team">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {teams?.away?.logo && (
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-[rgba(212,175,55,0.06)] rounded-lg blur-md opacity-0 group-hover/team:opacity-100 transition" />
                                        <img
                                            src={teams.away.logo}
                                            alt={teams.away.name}
                                            className="relative h-10 w-10 object-contain group-hover/team:scale-110 transition-transform"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}
                                <span className="font-bold text-white truncate group-hover:text-gold transition-colors">
                                    {teams?.away?.name || 'Away'}
                                </span>
                            </div>
                            <span className="text-2xl font-black text-white ml-2">
                                {scores?.away?.total ?? '-'}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-400">
                            {status?.long || 'Scheduled'}
                        </p>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
