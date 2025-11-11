import { motion } from 'framer-motion';
import { Bell, Flame, TrendingUp, Trophy, Clock, Newspaper, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function NotificationsSidebar({ notifications, liveGames, upcomingGames, topPlayers, news }) {
    // Generate smart notifications from real data
    const smartNotifications = useMemo(() => {
        const notifs = [];
        
        // 1. GAME HIGHLIGHTS & UPDATES
        if (liveGames && liveGames.length > 0) {
            liveGames.slice(0, 2).forEach(game => {
                const homeTeam = game.teams?.home?.name || 'Team';
                const awayTeam = game.teams?.away?.name || 'Team';
                notifs.push({
                    id: `live-${game.id}`,
                    type: 'live',
                    icon: Flame,
                    iconColor: 'text-red-500',
                    bgColor: 'from-red-500/10 to-orange-500/10',
                    borderColor: 'border-red-500/30',
                    title: '🔥 LIVE NOW',
                    message: `${homeTeam} vs ${awayTeam} - Watch now!`,
                    time: 'Live',
                    urgent: true
                });
            });
        }

        // Upcoming games starting soon
        if (upcomingGames && upcomingGames.length > 0) {
            const nextGame = upcomingGames[0];
            if (nextGame?.date) {
                const gameDate = new Date(nextGame.date);
                const now = new Date();
                const hoursUntil = Math.floor((gameDate - now) / (1000 * 60 * 60));
                
                if (hoursUntil >= 0 && hoursUntil <= 3) {
                    const homeTeam = nextGame.teams?.home?.name || 'Team';
                    const awayTeam = nextGame.teams?.away?.name || 'Team';
                    notifs.push({
                        id: `upcoming-${nextGame.id}`,
                        type: 'upcoming',
                        icon: Clock,
                        iconColor: 'text-blue-400',
                        bgColor: 'from-blue-500/10 to-cyan-500/10',
                        borderColor: 'border-blue-500/30',
                        title: '⏰ Starting Soon',
                        message: `${homeTeam} vs ${awayTeam} starts in ${hoursUntil}h`,
                        time: `${hoursUntil}h`,
                        urgent: false
                    });
                }
            }
        }

        // 2. PLAYER PERFORMANCE ALERTS
        if (topPlayers && topPlayers.length > 0) {
            const topPlayer = topPlayers[0];
            if (topPlayer) {
                const points = topPlayer.points || 0;
                const assists = topPlayer.assists || 0;
                const rebounds = topPlayer.rebounds || 0;
                
                // Check for outstanding performance
                if (points >= 30 || (points >= 20 && assists >= 10 && rebounds >= 10)) {
                    const isTripleDouble = points >= 10 && assists >= 10 && rebounds >= 10;
                    notifs.push({
                        id: `player-${topPlayer.id}`,
                        type: 'player',
                        icon: Trophy,
                        iconColor: 'text-yellow-400',
                        bgColor: 'from-yellow-500/10 to-amber-500/10',
                        borderColor: 'border-yellow-500/30',
                        title: isTripleDouble ? '🌟 Triple-Double!' : '⭐ Hot Performance',
                        message: `${topPlayer.fullName}: ${points} PTS, ${assists} AST, ${rebounds} REB`,
                        time: 'This week',
                        urgent: false
                    });
                }
            }

            // Player of the week announcement
            if (topPlayers.length >= 3) {
                notifs.push({
                    id: 'player-week',
                    type: 'announcement',
                    icon: Sparkles,
                    iconColor: 'text-purple-400',
                    bgColor: 'from-purple-500/10 to-pink-500/10',
                    borderColor: 'border-purple-500/30',
                    title: '🏆 Top Player This Week',
                    message: `${topPlayers[0].fullName} leads with ${topPlayers[0].points} points`,
                    time: 'Today',
                    urgent: false
                });
            }
        }

        // 3. NEWS & STANDINGS
        if (news && news.length > 0) {
            // Breaking news (most recent)
            const latestNews = news[0];
            if (latestNews) {
                const publishedDate = new Date(latestNews.published);
                const hoursAgo = Math.floor((new Date() - publishedDate) / (1000 * 60 * 60));
                
                if (hoursAgo <= 6) {
                    notifs.push({
                        id: `news-${latestNews.id}`,
                        type: 'news',
                        icon: Newspaper,
                        iconColor: 'text-green-400',
                        bgColor: 'from-green-500/10 to-emerald-500/10',
                        borderColor: 'border-green-500/30',
                        title: '📰 Breaking News',
                        message: latestNews.headline.slice(0, 60) + '...',
                        time: hoursAgo === 0 ? 'Just now' : `${hoursAgo}h ago`,
                        urgent: hoursAgo === 0
                    });
                }
            }
        }

        // Generic trending notification
        notifs.push({
            id: 'trending',
            type: 'trending',
            icon: TrendingUp,
            iconColor: 'text-orange-400',
            bgColor: 'from-orange-500/10 to-red-500/10',
            borderColor: 'border-orange-500/30',
            title: '📈 Trending Now',
            message: 'NBA Playoffs race heating up - Check standings',
            time: '2h ago',
            urgent: false
        });

        // Combine with manual notifications if any
        if (notifications && notifications.length > 0) {
            notifications.forEach((notif, idx) => {
                notifs.push({
                    id: `manual-${idx}`,
                    type: 'custom',
                    icon: Bell,
                    iconColor: 'text-gray-400',
                    bgColor: 'from-gray-500/10 to-gray-600/10',
                    borderColor: 'border-gray-500/30',
                    title: notif.title || 'Notification',
                    message: notif.message || '',
                    time: notif.created_at ? new Date(notif.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Now',
                    urgent: false
                });
            });
        }

        return notifs.slice(0, 8); // Limit to 8 notifications
    }, [notifications, liveGames, upcomingGames, topPlayers, news]);

    if (!smartNotifications || smartNotifications.length === 0) {
        return (
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Updates</h3>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Stay Informed</p>
                        </div>
                    </div>
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-700 opacity-20" />
                        <p className="text-sm font-semibold text-gray-400">All caught up!</p>
                    </div>
                </div>
            </div>
        );
    }

    const urgentCount = smartNotifications.filter(n => n.urgent).length;

    return (
        <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl p-8 border border-gray-700/50 shadow-2xl">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 shadow-inner shadow-indigo-500/10" />
            
            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                            {urgentCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-gray-900" />
                            )}
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Updates</h3>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Stay Informed</p>
                        </div>
                    </div>
                    {smartNotifications.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400">{smartNotifications.length}</span>
                        </div>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {smartNotifications.map((notification, index) => {
                        const IconComponent = notification.icon;
                        
                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group/notif relative"
                            >
                                {/* Hover Glow */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 rounded-2xl opacity-0 group-hover/notif:opacity-100 blur transition-all duration-300" />
                                
                                <div className={`relative p-4 bg-gradient-to-br ${notification.bgColor} backdrop-blur-xl rounded-2xl border ${notification.borderColor} group-hover/notif:border-opacity-60 transition-all duration-300 shadow-lg cursor-pointer`}>
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="relative">
                                                {notification.urgent && (
                                                    <div className="absolute inset-0 animate-ping opacity-30">
                                                        <IconComponent className={`w-5 h-5 ${notification.iconColor}`} />
                                                    </div>
                                                )}
                                                <IconComponent className={`relative w-5 h-5 ${notification.iconColor}`} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-black text-white">
                                                    {notification.title}
                                                </p>
                                                {notification.urgent && (
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 font-semibold mt-2">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
