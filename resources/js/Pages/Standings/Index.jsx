import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { TableSkeleton } from '@/Components/SkeletonLoader';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StandingsIndex({ auth }) {
    const [standings, setStandings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState('nba');
    const [conference, setConference] = useState('eastern');

    useEffect(() => {
        loadStandings();
    }, [league, conference]);

    const loadStandings = async () => {
        try {
            setLoading(true);
            const response = await window.axios.get(`/api/standings/${league}`, {
                params: { conference: league === 'nba' ? conference : null }
            });
            setStandings(response.data);
        } catch (error) {
            console.error('Error loading standings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPositionColor = (position) => {
        if (position <= 8) return 'text-green-500';
        if (position <= 10) return 'text-yellow-500';
        return 'text-gray-500';
    };

    const getStreakIcon = (streak) => {
        if (streak?.startsWith('W')) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (streak?.startsWith('L')) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-500" />;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-white leading-tight flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-orange-500" />
                        Standings
                    </h2>
                </div>
            }
        >
            <Head title="Standings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* League Selector */}
                    <div className="mb-8">
                        <div className="flex space-x-2 bg-gray-800/50 rounded-xl p-2 backdrop-blur-sm">
                            <button
                                onClick={() => setLeague('nba')}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    league === 'nba'
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                NBA
                            </button>
                            <button
                                onClick={() => setLeague('wnba')}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    league === 'wnba'
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                WNBA
                            </button>
                        </div>
                        <div className="mt-2 text-center text-sm text-gray-500">
                            Euroleague standings temporarily unavailable
                        </div>
                    </div>

                    {/* Conference Selector (NBA only) */}
                    {league === 'nba' && (
                        <div className="mb-6">
                            <div className="flex space-x-2 bg-gray-800/30 rounded-xl p-2">
                                <button
                                    onClick={() => setConference('eastern')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                        conference === 'eastern'
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Eastern Conference
                                </button>
                                <button
                                    onClick={() => setConference('western')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                        conference === 'western'
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Western Conference
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Standings Table */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700/50 shadow-lg">
                        {loading ? (
                            <div className="p-8">
                                <TableSkeleton rows={15} cols={7} />
                            </div>
                        ) : standings && standings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-900/50 border-b border-gray-700">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Team
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                V
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                D
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                PCT
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                GB
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Streak
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {standings.map((team, index) => (
                                            <motion.tr
                                                key={team.id || index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="hover:bg-gray-800/50 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className={`font-bold ${getPositionColor(team.position || index + 1)}`}>
                                                        {team.position || index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {(team.team?.logo || team.logo) && (
                                                            <img
                                                                src={team.team?.logo || team.logo}
                                                                alt={team.team?.name || team.name}
                                                                loading="lazy"
                                                                className="w-8 h-8 object-contain"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-white">{team.team?.name || team.name}</div>
                                                            {team.team?.abbreviation && (
                                                                <div className="text-xs text-gray-500">{team.team.abbreviation}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-green-500">
                                                    {team.wins || 0}
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-red-500">
                                                    {team.losses || 0}
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-white">
                                                    {team.winPercentage ? team.winPercentage.toFixed(3) : (team.winPercent ? team.winPercent.toFixed(3) : '0.000')}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-gray-400">
                                                    {team.gamesBehind || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getStreakIcon(team.streak)}
                                                        <span className="font-semibold text-white">
                                                            {team.streak || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 px-4">
                                <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    Standings not available
                                </h3>
                                <p className="text-gray-500">
                                    Standings for this league are not available at the moment.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Legend for playoff positions */}
                    <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-gray-400">Playoff Position (1-8)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-gray-400">Play-In (9-10)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                            <span className="text-gray-400">Out of Playoffs</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
