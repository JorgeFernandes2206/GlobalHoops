import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import HeroGame from '@/Components/Dashboard/HeroGame';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CommentSection from '@/Components/CommentSection';

export default function Show({ auth, game, league, injuriesHome = [], injuriesAway = [], recentHome = [], recentAway = [], headToHead = [], standings = null, odds = null, comments = [] }) {
    const [activeTab, setActiveTab] = useState('boxscore'); // boxscore, stats, leaders

    const header = game?.header || {};
    const competitions = header.competitions?.[0] || {};
    const competitors = competitions.competitors || [];
    const boxscore = game?.boxscore || {};
    const gameInfo = game?.gameInfo || {};

    const homeTeam = competitors.find(c => c.homeAway === 'home') || {};
    const awayTeam = competitors.find(c => c.homeAway === 'away') || {};

    const status = competitions.status || {};
    const isLive = status.type?.state === 'in';
    const isFinal = status.type?.completed;

    const homeBoxscore = boxscore.teams?.find(t => t.team?.id === homeTeam.team?.id);
    const awayBoxscore = boxscore.teams?.find(t => t.team?.id === awayTeam.team?.id);

    // Pontos por período (quartos)
    const homeLinescores = homeTeam.linescores || [];
    const awayLinescores = awayTeam.linescores || [];

    // Helpers to extract and format player/team assets & stats
    const resolveTeamLogo = (team) => {
        if (!team) return null;
        return (
            team.logo ||
            team.logoUrl ||
            team.logo?.href ||
            (team.logos && team.logos[0] && team.logos[0].href) ||
            (team.images && team.images[0] && team.images[0].href) ||
            null
        );
    };

    const getAthletes = (teamBox) => {
        return teamBox?.statistics?.[0]?.athletes || [];
    };

    const getStarters = (teamBox) => {
        const athletes = getAthletes(teamBox);
        // Heuristic: look for explicit starter flags
        const starters = athletes.filter(p => {
            if (!p) return false;
            if (p.starter || p.isStarter || p.starting) return true;
            if (p.athlete && (p.athlete.starter || p.athlete.isStarter)) return true;
            // ESPN sometimes includes 'order' or 'displayOrder' indicating lineup position
            if (p.displayOrder !== undefined || p.order !== undefined) return true;
            return false;
        });

        if (starters.length > 0) {
            // If we have more than 5, sort by displayOrder if available then take first 5
            const sorted = starters.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            return sorted.slice(0, 5);
        }

        // Fallback to first 5 athletes if no starter flags found
        return athletes.slice(0, 5);
    };

    const resolvePlayerImage = (playerRow) => {
        const ath = playerRow?.athlete || {};
        return (
            ath.headshot?.href ||
            (ath.images && ath.images[0] && ath.images[0].href) ||
            ath.photo?.href ||
            null
        );
    };

    const getStatValueFor = (playerRow, name) => {
        const stats = playerRow.stats || [];
        const found = stats.find(s => s.name === name);
        if (found && found.displayValue !== undefined) return found.displayValue;
        // fallback to numeric fields if present
        if (playerRow[name] !== undefined) return playerRow[name];
        return '-';
    };

    const topPerformers = (teamBox) => {
        const athletes = getAthletes(teamBox);
        return athletes
            .map(p => ({
                name: p.athlete?.displayName || p.athlete?.fullName || 'Unknown',
                id: p.athlete?.id || null,
                image: resolvePlayerImage(p),
                points: Number(getStatValueFor(p, 'points')) || 0,
                assists: Number(getStatValueFor(p, 'assists')) || 0,
                rebounds: Number(getStatValueFor(p, 'rebounds')) || 0,
                minutes: getStatValueFor(p, 'minutes') || '-',
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 5);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href="/inicio"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar</span>
                    </Link>
                    <h2 className="font-semibold text-xl text-white">
                        {homeTeam.team?.displayName} vs {awayTeam.team?.displayName}
                    </h2>
                </div>
            }
        >
            <Head title={`${homeTeam.team?.displayName || 'Team'} vs ${awayTeam.team?.displayName || 'Team'}`} />

            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                    {/* Hero Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/90 via-gray-800/70 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent" />

                        <div className="relative p-8">
                            {/* League Badge */}
                            <div className="flex justify-center mb-6">
                                <div className="px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 backdrop-blur-sm">
                                    <span className="text-xs font-bold text-gold tracking-wider">{(game?.header?.league?.name ?? league ?? 'NBA').toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Teams & Score */}
                            <div className="grid grid-cols-3 gap-8 items-center">
                                {/* Away Team */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        {awayTeam.team?.logo && (
                                            <div className="w-28 h-28 rounded-2xl bg-gray-900/50 border border-gray-700/30 p-4 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                                                <img src={awayTeam.team.logo} alt={awayTeam.team.displayName} className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h3 className="text-2xl font-bold text-white">{awayTeam.team?.displayName}</h3>
                                        <p className="text-sm text-gray-400">{awayTeam.team?.location}</p>
                                    </div>
                                    <div className="text-5xl font-black text-white">{awayTeam.score || 0}</div>
                                </div>

                                {/* VS / Status */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="text-center">
                                        <div className={`px-6 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${
                                            isLive
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                                : isFinal
                                                ? 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                            {isLive ? '● LIVE' : isFinal ? 'FINAL' : status.type?.detail || 'SCHEDULED'}
                                        </div>
                                    </div>
                                    <div className="text-6xl font-black text-gray-600">VS</div>
                                    {header.season && (
                                        <div className="text-center text-xs text-gray-500">
                                            <div>{header.season.year} Season</div>
                                            {header.week && <div>Week {header.week}</div>}
                                        </div>
                                    )}
                                </div>

                                {/* Home Team */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        {homeTeam.team?.logo && (
                                            <div className="w-28 h-28 rounded-2xl bg-gray-900/50 border border-gray-700/30 p-4 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                                                <img src={homeTeam.team.logo} alt={homeTeam.team.displayName} className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h3 className="text-2xl font-bold text-white">{homeTeam.team?.displayName}</h3>
                                        <p className="text-sm text-gray-400">{homeTeam.team?.location}</p>
                                    </div>
                                    <div className="text-5xl font-black text-white">{homeTeam.score || 0}</div>
                                </div>
                            </div>

                            {/* Quarter Scores */}
                            {(homeLinescores.length > 0 || awayLinescores.length > 0) && (
                                <div className="mt-8 pt-6 border-t border-gray-700/30">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-center">
                                            <thead>
                                                <tr className="text-xs text-gray-500 uppercase">
                                                    <th className="pb-3 text-left pl-4">Team</th>
                                                    {Array.from({ length: Math.max(homeLinescores.length, awayLinescores.length) }).map((_, i) => (
                                                        <th key={i} className="pb-3 px-3">Q{i + 1}</th>
                                                    ))}
                                                    <th className="pb-3 pr-4 font-bold text-gold">T</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                <tr className="border-t border-gray-700/20">
                                                    <td className="py-3 text-left pl-4">
                                                        <div className="flex items-center gap-2">
                                                            {awayTeam.team?.logo && (
                                                                <img src={awayTeam.team.logo} alt="" className="w-5 h-5" />
                                                            )}
                                                            <span className="font-medium text-white">{awayTeam.team?.abbreviation}</span>
                                                        </div>
                                                    </td>
                                                    {awayLinescores.map((score, i) => (
                                                        <td key={i} className="py-3 px-3 text-gray-300">{score.value || 0}</td>
                                                    ))}
                                                    <td className="py-3 pr-4 font-bold text-gold">{awayTeam.score || 0}</td>
                                                </tr>
                                                <tr className="border-t border-gray-700/20">
                                                    <td className="py-3 text-left pl-4">
                                                        <div className="flex items-center gap-2">
                                                            {homeTeam.team?.logo && (
                                                                <img src={homeTeam.team.logo} alt="" className="w-5 h-5" />
                                                            )}
                                                            <span className="font-medium text-white">{homeTeam.team?.abbreviation}</span>
                                                        </div>
                                                    </td>
                                                    {homeLinescores.map((score, i) => (
                                                        <td key={i} className="py-3 px-3 text-gray-300">{score.value || 0}</td>
                                                    ))}
                                                    <td className="py-3 pr-4 font-bold text-gold">{homeTeam.score || 0}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Betting Odds Card */}
                    {odds && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-gold/10 to-transparent px-6 py-4 border-b border-gray-700/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-gold" />
                                        <h3 className="text-lg font-bold text-white">Betting Odds</h3>
                                    </div>
                                    {odds.providers?.[0]?.last_update && (
                                        <span className="text-xs text-gray-400">
                                            Updated: {new Date(odds.providers[0].last_update).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(odds.providers || []).slice(0, 6).map((provider, idx) => (
                                        <div key={idx} className="group relative p-4 rounded-xl bg-gray-900/50 border border-gray-700/30 hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5">
                                            <div className="text-xs font-bold text-gold mb-3 uppercase tracking-wide">
                                                {provider.title || provider.key || 'Sportsbook'}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">Moneyline</span>
                                                    <span className="text-sm font-bold text-white">
                                                        {provider.homeMoneyline !== undefined && provider.awayMoneyline !== undefined
                                                            ? `${provider.homeMoneyline > 0 ? '+' : ''}${provider.homeMoneyline} / ${provider.awayMoneyline > 0 ? '+' : ''}${provider.awayMoneyline}`
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">Spread</span>
                                                    <span className="text-sm font-medium text-gray-300">
                                                        {provider.homeSpread !== undefined
                                                            ? `${provider.homeSpread > 0 ? '+' : ''}${provider.homeSpread}`
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">Total (O/U)</span>
                                                    <span className="text-sm font-medium text-gray-300">
                                                        {provider.overUnder ?? '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Navigation Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl overflow-hidden"
                    >
                        <div className="flex border-b border-gray-700/30 bg-gray-900/30">
                            <button
                                onClick={() => setActiveTab('boxscore')}
                                className={`relative flex-1 px-8 py-5 text-sm font-bold transition-all duration-300 ${
                                    activeTab === 'boxscore'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Player Statistics</span>
                                </div>
                                {activeTab === 'boxscore' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-yellow-600"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`relative flex-1 px-8 py-5 text-sm font-bold transition-all duration-300 ${
                                    activeTab === 'stats'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Game Statistics</span>
                                </div>
                                {activeTab === 'stats' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-yellow-600"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Tab: Boxscore (Player Statistics) */}
                            {activeTab === 'boxscore' && (
                                <div className="space-y-8">
                                    {awayBoxscore?.statistics?.[0]?.athletes && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                {awayTeam.team?.logo && (
                                                    <img src={awayTeam.team.logo} alt="" className="w-8 h-8" />
                                                )}
                                                <h3 className="text-xl font-bold text-white">{awayTeam.team?.displayName}</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-700/30">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Jogador</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">MIN</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">PTS</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">REB</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">AST</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">FG</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">3PT</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">FT</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">+/-</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-700/50">
                                                        {awayBoxscore.statistics[0].athletes.map((player, idx) => {
                                                            const stats = player.stats || [];
                                                            const getStatValue = (name) => stats.find(s => s.name === name)?.displayValue || '-';

                                                            return (
                                                                <tr key={idx} className="hover:bg-gray-700/20 transition-colors">
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-3">
                                                                            {awayTeam.team?.logo && (
                                                                                <img src={awayTeam.team.logo} alt="" className="w-6 h-6 opacity-30" />
                                                                            )}
                                                                            <div>
                                                                                <div className="text-sm font-medium text-white">{player.athlete?.displayName}</div>
                                                                                <div className="text-xs text-gray-400">{player.athlete?.position?.abbreviation}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('minutes')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm font-bold text-gold">{getStatValue('points')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('rebounds')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('assists')}</td>
                                                                    <td className="px-3 py-3 text-center text-xs text-gray-300">{getStatValue('fieldGoalsMade-fieldGoalsAttempted')}</td>
                                                                    <td className="px-3 py-3 text-center text-xs text-gray-300">{getStatValue('threePointFieldGoalsMade-threePointFieldGoalsAttempted')}</td>
                                                                    <td className="px-3 py-3 text-center text-xs text-gray-300">{getStatValue('freeThrowsMade-freeThrowsAttempted')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('plusMinus')}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Starters & Top Performers for Home */}
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-white mb-3">Starting Five</h4>
                                                    <div className="flex items-center gap-3 overflow-x-auto">
                                                            {getStarters(homeBoxscore).map((p, i) => (
                                                            <div key={i} className="flex-shrink-0 w-36 p-2 bg-gray-900/40 rounded-md">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                                                        {resolvePlayerImage(p) ? (
                                                                            <img src={resolvePlayerImage(p)} alt={p.athlete?.displayName} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-200">{(p.athlete?.displayName||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-medium text-white truncate">{p.athlete?.displayName}</div>
                                                                        <div className="text-xs text-gray-400">{getStatValueFor(p, 'minutes')} • {getStatValueFor(p, 'points')} PTS</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-white mb-3">Top Performers</h4>
                                                    <div className="space-y-2">
                                                        {topPerformers(homeBoxscore).map((p, idx) => (
                                                            <div key={idx} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                                                                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-200">{(p.name||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm text-white">{p.name}</div>
                                                                        <div className="text-xs text-gray-400">{p.minutes} • {p.assists} AST • {p.rebounds} REB</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-lg font-bold text-gold">{p.points}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Starters & Top Performers */}
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-white mb-3">Starting Five</h4>
                                                    <div className="flex items-center gap-3 overflow-x-auto">
                                                            {getStarters(awayBoxscore).map((p, i) => (
                                                            <div key={i} className="flex-shrink-0 w-36 p-2 bg-gray-900/40 rounded-md">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                                                        {resolvePlayerImage(p) ? (
                                                                            <img src={resolvePlayerImage(p)} alt={p.athlete?.displayName} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-200">{(p.athlete?.displayName||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-medium text-white truncate">{p.athlete?.displayName}</div>
                                                                        <div className="text-xs text-gray-400">{getStatValueFor(p, 'minutes')} • {getStatValueFor(p, 'points')} PTS</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-white mb-3">Top Performers</h4>
                                                    <div className="space-y-2">
                                                        {topPerformers(awayBoxscore).map((p, idx) => (
                                                            <div key={idx} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                                                                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-200">{(p.name||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm text-white">{p.name}</div>
                                                                        <div className="text-xs text-gray-400">{p.minutes} • {p.assists} AST • {p.rebounds} REB</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-lg font-bold text-gold">{p.points}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {homeBoxscore?.statistics?.[0]?.athletes && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                {homeTeam.team?.logo && (
                                                    <img src={homeTeam.team.logo} alt="" className="w-8 h-8" />
                                                )}
                                                <h3 className="text-xl font-bold text-white">{homeTeam.team?.displayName}</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-700/30">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Player</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">MIN</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">PTS</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">REB</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">AST</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">FG</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">3PT</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">FT</th>
                                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">+/-</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-700/50">
                                                        {homeBoxscore.statistics[0].athletes.map((player, idx) => {
                                                            const stats = player.stats || [];
                                                            const getStatValue = (name) => stats.find(s => s.name === name)?.displayValue || '-';

                                                            return (
                                                                <tr key={idx} className="hover:bg-gray-700/20 transition-colors">
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-3">
                                                                            {homeTeam.team?.logo && (
                                                                                <img src={homeTeam.team.logo} alt="" className="w-6 h-6 opacity-30" />
                                                                            )}
                                                                            <div>
                                                                                <div className="text-sm font-medium text-white">{player.athlete?.displayName}</div>
                                                                                <div className="text-xs text-gray-400">{player.athlete?.position?.abbreviation}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('minutes')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm font-bold text-gold">{getStatValue('points')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('rebounds')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('assists')}</td>
                                                                    <td className="px-3 py-3 text-center text-xs text-gray-300">{getStatValue('fieldGoalsMade-fieldGoalsAttempted')}</td>
                                                                    <td className="px-3 py-3 text-center text-xs text-gray-300">{getStatValue('threePointFieldGoalsMade-threePointFieldGoalsAttempted')}</td>
                                                                    <td className="px-3 py-3 text-center text-xs text-gray-300">{getStatValue('freeThrowsMade-freeThrowsAttempted')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('plusMinus')}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {!awayBoxscore?.statistics && !homeBoxscore?.statistics && (
                                        <div className="text-center py-12">
                                            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400">Player statistics not yet available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Team Stats */}
                            {activeTab === 'stats' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white mb-6">Overall Game Statistics</h3>

                                    {homeBoxscore?.statistics || awayBoxscore?.statistics ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Away Team Stats */}
                                            {awayBoxscore?.statistics && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                                                        {awayTeam.team?.logo && <img src={awayTeam.team.logo} alt="" className="w-6 h-6" />}
                                                        <h4 className="font-bold text-white">{awayTeam.team?.displayName}</h4>
                                                    </div>
                                                    {awayBoxscore.statistics[0]?.totals?.map((stat, idx) => (
                                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700/30">
                                                            <span className="text-sm text-gray-400">{stat.label || stat.name}</span>
                                                            <span className="text-sm font-semibold text-white">{stat.displayValue}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Home Team Stats */}
                                            {homeBoxscore?.statistics && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                                                        {homeTeam.team?.logo && <img src={homeTeam.team.logo} alt="" className="w-6 h-6" />}
                                                        <h4 className="font-bold text-white">{homeTeam.team?.displayName}</h4>
                                                    </div>
                                                    {homeBoxscore.statistics[0]?.totals?.map((stat, idx) => (
                                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700/30">
                                                            <span className="text-sm text-gray-400">{stat.label || stat.name}</span>
                                                            <span className="text-sm font-semibold text-white">{stat.displayValue}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400">Overall statistics not yet available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-8"
                    >
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-gold" />
                            Game Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="rounded-2xl bg-gray-900/50 border border-gray-700/30 p-6">
                                <h4 className="text-sm font-bold text-gold mb-4 uppercase tracking-wide">Injuries & Absences</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-400 mb-2">Home</div>
                                        {(!Array.isArray(injuriesHome) || injuriesHome.length === 0) ? (
                                            <div className="text-sm text-gray-400">No reported injuries</div>
                                        ) : (
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                {injuriesHome.map((p) => (
                                                    <li key={p.id} className="flex justify-between">
                                                        <span>{p.name}</span>
                                                        <span className="text-xs text-gray-400">{p.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-2">Away</div>
                                        {(!Array.isArray(injuriesAway) || injuriesAway.length === 0) ? (
                                            <div className="text-sm text-gray-400">No reported injuries</div>
                                        ) : (
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                {injuriesAway.map((p) => (
                                                    <li key={p.id} className="flex justify-between">
                                                        <span>{p.name}</span>
                                                        <span className="text-xs text-gray-400">{p.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gray-900/50 border border-gray-700/30 p-6">
                                <h4 className="text-sm font-bold text-gold mb-4 uppercase tracking-wide">Recent Form</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-400 mb-2">Home</div>
                                        {recentHome.length === 0 ? (
                                            <div className="text-sm text-gray-400">No recent games</div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {recentHome.map((r, i) => (
                                                    <div key={i} className={`px-3 py-1 rounded-full text-sm font-semibold ${r.result === 'W' ? 'bg-green-600 text-white' : (r.result === 'L' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white')}`} title={`${r.opponent} ${r.teamScore}-${r.oppScore}`}>
                                                        {r.result}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-2">Away</div>
                                        {recentAway.length === 0 ? (
                                            <div className="text-sm text-gray-400">No recent games</div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {recentAway.map((r, i) => (
                                                    <div key={i} className={`px-3 py-1 rounded-full text-sm font-semibold ${r.result === 'W' ? 'bg-green-600 text-white' : (r.result === 'L' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white')}`} title={`${r.opponent} ${r.teamScore}-${r.oppScore}`}>
                                                        {r.result}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Head-to-head and standings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="rounded-2xl bg-gray-900/50 border border-gray-700/30 p-6 md:col-span-2">
                                <h4 className="text-sm font-bold text-gold mb-4 uppercase tracking-wide">Head-to-Head</h4>
                                {headToHead.length === 0 ? (
                                    <div className="text-sm text-gray-400">No recent head-to-head matches found</div>
                                ) : (
                                    <ul className="space-y-2 text-sm text-gray-300">
                                        {headToHead.map((m, idx) => (
                                            <li key={idx} className="flex justify-between">
                                                <div>{(new Date(m.date)).toLocaleDateString()} — {m.teamA} {m.teamAScore} x {m.teamBScore} {m.teamB}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-2xl bg-gray-900/50 border border-gray-700/30 p-6">
                                <h4 className="text-sm font-bold text-gold mb-4 uppercase tracking-wide">Standings</h4>
                                {standings === null ? (
                                    <div className="text-sm text-gray-400">Standings not available</div>
                                ) : (
                                    <div className="text-sm text-gray-300">
                                        {/* Try to show records for home and away if present */}
                                        {(() => {
                                            const homeId = game?.header?.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.id;
                                            const awayId = game?.header?.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.id;
                                            const rows = [];
                                            if (Array.isArray(standings)) {
                                                const findRecord = (tid) => {
                                                    const rec = standings.find(s => {
                                                        const t = s['team'] ?? s['team'] ?? null;
                                                        if (!t) return false;
                                                        return (String(t['id'] ?? t['teamId'] ?? '') === String(tid)) || (String(t['id'] ?? '') === String(tid));
                                                    });
                                                    return rec ?? null;
                                                };

                                                const h = findRecord(homeId);
                                                const a = findRecord(awayId);
                                                if (h) rows.push(<div key="h" className="mb-2"><div className="text-xs text-gray-400">Home</div><div className="font-semibold">{h['team']['displayName'] ?? (h['team']['name'] ?? 'Team')} {h['record'] ? (`– ${h['record']['summary'] ?? JSON.stringify(h['record'])}`) : ''}</div></div>);
                                                if (a) rows.push(<div key="a"><div className="text-xs text-gray-400">Away</div><div className="font-semibold">{a['team']['displayName'] ?? (a['team']['name'] ?? 'Team')} {a['record'] ? (`– ${a['record']['summary'] ?? JSON.stringify(a['record'])}`) : ''}</div></div>);
                                            }
                                            if (rows.length === 0) return <div className="text-sm text-gray-400">Standings data found but no matching team records.</div>;
                                            return rows;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {gameInfo.venue?.fullName && (
                                <div className="group p-4 rounded-xl bg-gray-900/30 border border-gray-700/20 hover:border-gold/30 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gold/10">
                                            <MapPin className="w-5 h-5 text-gold" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 mb-0.5">Venue</p>
                                            <p className="text-sm font-medium text-white truncate">{gameInfo.venue.fullName}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {gameInfo.attendance && (
                                <div className="group p-4 rounded-xl bg-gray-900/30 border border-gray-700/20 hover:border-gold/30 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gold/10">
                                            <Users className="w-5 h-5 text-gold" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400 mb-0.5">Attendance</p>
                                            <p className="text-sm font-medium text-white">{gameInfo.attendance.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {header.season && (
                                <div className="group p-4 rounded-xl bg-gray-900/30 border border-gray-700/20 hover:border-gold/30 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gold/10">
                                            <Calendar className="w-5 h-5 text-gold" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400 mb-0.5">Season</p>
                                            <p className="text-sm font-medium text-white">{header.season.year} - {header.season.type}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {header.week && (
                                <div className="group p-4 rounded-xl bg-gray-900/30 border border-gray-700/20 hover:border-gold/30 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gold/10">
                                            <Trophy className="w-5 h-5 text-gold" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400 mb-0.5">Week</p>
                                            <p className="text-sm font-medium text-white">Week {header.week}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {!awayBoxscore?.statistics && !homeBoxscore?.statistics && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-16 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                                <Trophy className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-lg text-gray-400 font-medium">Game statistics not yet available</p>
                            <p className="text-sm text-gray-500 mt-2">Check back once the game has started</p>
                        </motion.div>
                    )}

                    {/* Comments Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-8"
                    >
                        <CommentSection 
                            commentableType="Game"
                            commentableId={`${league}_${game?.header?.id || ''}`}
                            initialComments={comments || []}
                        />
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
