import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function Following({ teams }) {
    const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

    const handleUnfollow = (teamId) => {
        if (confirm('Are you sure you want to unfollow this team?')) {
            router.post(route('teams.unfollow'), {
                team_api_id: teamId,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleToggleNotifications = (teamId) => {
        router.post(route('teams.notifications'), {
            team_api_id: teamId,
        }, {
            preserveScroll: true,
        });
    };

    const handlePushToggle = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Following Teams" />

            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Teams You Follow</h1>
                                <p className="text-gray-400">Manage your followed teams and notifications</p>
                            </div>

                            {/* Push Notifications Toggle */}
                            {isSupported && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handlePushToggle}
                                    disabled={isLoading}
                                    className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                                        isSubscribed
                                            ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                            : 'bg-white text-black hover:bg-gray-200'
                                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="text-xl">{isSubscribed ? '🔔' : '🔕'}</span>
                                    {isLoading ? 'A processar...' : (isSubscribed ? 'Notificações Push Ativas' : 'Ativar Notificações Push')}
                                </motion.button>
                            )}
                            <Link
                                href={route('teams.feed')}
                                className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                            >
                                View Feed
                            </Link>
                        </div>
                    </motion.div>

                    {teams.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-2xl border border-gray-700/50"
                        >
                            <div className="text-6xl mb-4">🏀</div>
                            <h3 className="text-xl font-bold text-white mb-2">No Teams Yet</h3>
                            <p className="text-gray-400 mb-6">Start following teams to get updates</p>
                            <Link
                                href={route('teams.index')}
                                className="inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                            >
                                Browse Teams
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map((team, index) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {team.logo_url ? (
                                                <img
                                                    src={team.logo_url}
                                                    alt={team.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                                                    🏀
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{team.name}</h3>
                                                {team.city && (
                                                    <p className="text-sm text-gray-400">{team.city}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Conference:</span>
                                            <span className="text-white font-medium">{team.conference}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Followers:</span>
                                            <span className="text-white font-medium">{team.followers_count}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Following since:</span>
                                            <span className="text-white font-medium">
                                                {new Date(team.followed_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleToggleNotifications(team.id)}
                                            className={`flex-1 rounded-lg px-4 py-2.5 font-semibold transition ${
                                                team.notifications_enabled
                                                    ? 'bg-white text-black hover:bg-gray-200'
                                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                            }`}
                                        >
                                            {team.notifications_enabled ? '🔔 On' : '🔕 Off'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleUnfollow(team.id)}
                                            className="rounded-lg px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/20 transition"
                                        >
                                            Unfollow
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
