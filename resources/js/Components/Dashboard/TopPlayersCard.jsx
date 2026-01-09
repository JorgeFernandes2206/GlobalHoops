import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function TopPlayersCard({ players: initialPlayers = null, league = 'nba', limit = 10 }) {
    const hasInitial = Array.isArray(initialPlayers) && initialPlayers.length > 0;
    const [players, setPlayers] = useState(hasInitial ? initialPlayers : []);
    const [loading, setLoading] = useState(!hasInitial);

    useEffect(() => {
        let mounted = true;
        if (!hasInitial) {
            (async () => {
                try {
                    setLoading(true);
                    const res = await axios.get(`/api/players/top?league=${league}&days=7&limit=${limit}`);
                    if (!mounted) return;
                    const data = Array.isArray(res.data?.response) ? res.data.response : res.data;
                    setPlayers(Array.isArray(data) ? data : []);
                } catch (e) {
                    if (import.meta.env.DEV) {
                        console.error('Failed to load top players', e);
                    }
                    setPlayers([]);
                } finally {
                    if (mounted) setLoading(false);
                }
            })();
        }
        return () => { mounted = false; };
    }, [hasInitial, league, limit]);

    const getInitials = useMemo(() => (name) => {
        if (!name) return '?';
        const parts = name.split(' ').filter(Boolean);
        const first = parts[0]?.[0] || '';
        const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
        return (first + last).toUpperCase();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-6 border border-white/5">
                <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-14 bg-gray-800 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!players || players.length === 0) {
        return (
            <div className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-6 border border-white/5">
                <p className="text-gray-400 text-center">No player data available</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm p-6 border border-white/5 shadow-xl">
            <div className="space-y-3">
                {players.slice(0, limit).map((player, index) => (
                    <Link
                        key={player.id || index}
                        href={`/players/${league}/${player.id}`}
                        className="block group"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-800/80 hover:to-gray-900/80 border border-white/5 hover:border-orange-500/30 transition-all duration-300 cursor-pointer"
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg text-xs font-black text-orange-400">
                                {index + 1}
                            </div>

                            <div className="flex items-center gap-3 ml-6">
                                {player.image ? (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img
                                            src={player.image}
                                            alt={player.fullName}
                                            className="relative w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-orange-500/30 transition-all"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-orange-400 flex items-center justify-center text-sm font-bold ring-2 ring-white/10 group-hover:ring-orange-500/30 transition-all">${getInitials(player.fullName)}</div>`;
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-orange-400 flex items-center justify-center text-sm font-bold ring-2 ring-white/10 group-hover:ring-orange-500/30 transition-all">
                                        {getInitials(player.fullName)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{player.fullName}</p>
                                <p className="text-xs text-gray-400 truncate">{player.team}</p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">{player.points || 0}</p>
                                <p className="text-[10px] text-gray-500 font-semibold">PTS</p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
