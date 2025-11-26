import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Feed({ followedTeams, followedTeamsCount, updates: initialUpdates = [] }) {
    const [filter, setFilter] = useState('all');

    const updateTypeConfig = {
        news: { icon: '📰', label: 'News' },
        upcoming_game: { icon: '📅', label: 'Upcoming Game' },
        game_result: { icon: '🏆', label: 'Game Result' },
        stats: { icon: '📊', label: 'Stats' },
        transfer: { icon: '🔄', label: 'Transfer' },
        injury: { icon: '🏥', label: 'Injury' },
    };

    const filteredUpdates = filter === 'all'
        ? initialUpdates
        : initialUpdates.filter(u => u.type === filter);
    return (
        <AuthenticatedLayout>
            <Head title="Team Updates Feed" />

            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Team Updates</h1>
                                <p className="text-gray-400">Latest news from teams you follow</p>
                            </div>
                            <Link
                                href={route('teams.following')}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                            >
                                Manage Teams ({followedTeamsCount})
                            </Link>
                        </div>

                        {/* Filter Buttons */}
                        {followedTeamsCount > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {['all', 'news', 'upcoming_game', 'game_result'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            filter === type
                                                ? 'bg-white text-black'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {type === 'all' ? 'All' : updateTypeConfig[type]?.label || type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {followedTeamsCount === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-2xl border border-gray-700/50"
                        >
                            <div className="text-6xl mb-4">🏀</div>
                            <h3 className="text-xl font-bold text-white mb-2">No Teams Followed</h3>
                            <p className="text-gray-400 mb-6">Follow teams to see their updates here</p>
                            <Link
                                href={route('teams.index')}
                                className="inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                            >
                                Browse Teams
                            </Link>
                        </motion.div>
                    ) : filteredUpdates.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-2xl border border-gray-700/50"
                        >
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-white mb-2">No Updates</h3>
                            <p className="text-gray-400">No updates found for this filter</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {filteredUpdates.map((update, index) => {
                                const config = updateTypeConfig[update.type] || { icon: '📢', label: 'Update' };
                                const isNewsUpdate = update.type === 'news';
                                const isGameUpdate = update.type === 'game_result' || update.type === 'upcoming_game';

                                return (
                                    <motion.article
                                        key={update.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl overflow-hidden"
                                    >
                                        {update.image && (
                                            <img
                                                src={update.image}
                                                alt={update.headline || 'Update image'}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}

                                        <div className="p-6">
                                            {/* Header with type badge */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{config.icon}</span>
                                                    <span className="text-sm font-semibold text-white bg-white/10 px-3 py-1 rounded-full">
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-400">
                                                    {new Date(update.published || update.date).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Teams involved (for news) */}
                                            {isNewsUpdate && update.teams && update.teams.length > 0 && (
                                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                                    {update.teams.map((team) => (
                                                        <div key={team.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                                                            {team.logo && (
                                                                <img
                                                                    src={team.logo}
                                                                    alt={team.name}
                                                                    className="w-6 h-6 rounded object-cover"
                                                                />
                                                            )}
                                                            <span className="text-sm font-medium text-white">{team.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Game matchup (for games) */}
                                            {isGameUpdate && update.teams && (
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                                                        {/* Home Team */}
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {update.teams.home.logo && (
                                                                <img
                                                                    src={update.teams.home.logo}
                                                                    alt={update.teams.home.name}
                                                                    className="w-10 h-10 rounded object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="font-bold text-white">{update.teams.home.name}</div>
                                                                {update.scores && (
                                                                    <div className="text-2xl font-bold text-white">
                                                                        {update.scores.home.total}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* VS or Status */}
                                                        <div className="px-4 text-center">
                                                            <div className="text-gray-400 font-bold">
                                                                {update.type === 'upcoming_game' ? 'VS' : (update.status?.short || 'FINAL')}
                                                            </div>
                                                        </div>

                                                        {/* Away Team */}
                                                        <div className="flex items-center gap-3 flex-1 justify-end">
                                                            <div className="text-right">
                                                                <div className="font-bold text-white">{update.teams.away.name}</div>
                                                                {update.scores && (
                                                                    <div className="text-2xl font-bold text-white">
                                                                        {update.scores.away.total}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {update.teams.away.logo && (
                                                                <img
                                                                    src={update.teams.away.logo}
                                                                    alt={update.teams.away.name}
                                                                    className="w-10 h-10 rounded object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Content */}
                                            {isNewsUpdate && (
                                                <>
                                                    <h2 className="text-xl font-bold text-white mb-2">{update.headline}</h2>
                                                    <p className="text-gray-300 mb-4">{update.description}</p>

                                                    {update.link && update.link !== '#' && (
                                                        <a
                                                            href={update.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-sm text-white hover:text-gray-300 transition font-semibold"
                                                        >
                                                            Read full article →
                                                        </a>
                                                    )}
                                                </>
                                            )}

                                            {isGameUpdate && update.status && (
                                                <div className="text-center">
                                                    <p className="text-gray-400 text-sm">{update.status.long}</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
