import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function TopPlayersCard({ players: initialPlayers = null, league = 'nba', limit = 5 }) {
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
        return <div className="animate-pulse h-48 rounded-xl bg-gray-800" />;
    }

    if (!players || players.length === 0) {
        return (
            <div className="rounded-xl bg-gray-800 p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">⭐ Top Players This Week</h3>
                <p className="text-gray-400">No data</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-gray-800 p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">⭐ Top Players This Week</h3>
            <div className="space-y-4">
                {players.slice(0, limit).map((player, index) => (
                    <Link
                        key={player.id || index}
                        href={`/players/${league}/${player.id}`}
                        className="block"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                {player.image ? (
                                    <img
                                        src={player.image}
                                        alt={player.fullName}
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-700 text-gray-200 flex items-center justify-center text-sm font-semibold ring-2 ring-gray-700">
                                        {getInitials(player.fullName)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white">{player.fullName}</p>
                                <p className="text-xs text-gray-400 truncate">{player.team}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-[#FF2D20]">{player.points || 0} PTS</p>
                                <p className="text-xs text-gray-400">{player.assists || 0} AST • {player.rebounds || 0} REB</p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
