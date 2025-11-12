import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import HeroGame from '@/Components/Dashboard/HeroGame';

export default function Show({ auth, game, league, injuriesHome = [], injuriesAway = [], recentHome = [], recentAway = [], headToHead = [], standings = null, odds = null }) {
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
                        <span>Home</span>
                    </Link>
                    <h2 className="font-semibold text-xl text-white">
                        {homeTeam.team?.displayName} vs {awayTeam.team?.displayName}
                    </h2>
                </div>
            }
        >
            <Head title={`${homeTeam.team?.displayName || 'Team'} vs ${awayTeam.team?.displayName || 'Team'}`} />

            <div className="py-6">
                <div className="relative mx-auto max-w-[1920px] px-6 sm:px-8 lg:px-12 pt-6 pb-12 space-y-6">

                    {/* Use the same HeroGame component from Dashboard for pixel-identical style */}
                    <div className="mx-auto max-w-[1920px] px-6 sm:px-8 lg:px-12">
                        <HeroGame game={{
                            teams: {
                                home: homeTeam.team || {},
                                away: awayTeam.team || {},
                            },
                            scores: {
                                home: { total: homeTeam.score || 0 },
                                away: { total: awayTeam.score || 0 },
                            },
                            status: {
                                long: status.type?.detail || status.type?.name,
                                type: {
                                    state: status.type?.state || (status.state || null),
                                    completed: status.type?.completed || false,
                                }
                            },
                            league: { id: league || 'nba', name: (game?.header?.league?.name ?? (league || 'NBA')).toUpperCase() },
                            id: game?.header?.id || game?.id || null,
                        }} />
                    </div>

                    {/* Odds display for upcoming games (if provided) */}
                    {odds ? (
                        <div className="mx-auto max-w-[1920px] px-6 sm:px-8 lg:px-12">
                            <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700/40 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-gray-400">Odds (providers)</div>
                                        <div className="flex items-center gap-2">
                                            {(odds.providers || []).slice(0,3).map((p, idx) => (
                                                <div key={idx} className="px-3 py-1 bg-gray-700/20 rounded-md">
                                                    <div className="text-xs font-semibold text-white">{p.title || p.key || 'Book'}</div>
                                                    <div className="text-xs text-gray-300">{p.homeMoneyline !== undefined && p.awayMoneyline !== undefined ? `${p.homeMoneyline>0?`+${p.homeMoneyline}`:p.homeMoneyline}/${p.awayMoneyline}` : (p.overUnder ?? '-')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-300">{odds.providers && odds.providers[0] && (odds.providers[0].last_update ? new Date(odds.providers[0].last_update).toLocaleString() : '')}</div>
                                </div>

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                                    {(odds.providers || []).slice(0,6).map((p, i) => (
                                        <div key={i} className="bg-gray-900/30 p-3 rounded-md">
                                            <div className="text-xs text-gray-400">{p.title || p.key}</div>
                                            <div className="font-semibold text-white mt-1">
                                                {p.homeMoneyline !== undefined && p.awayMoneyline !== undefined ? `${p.homeMoneyline>0?`+${p.homeMoneyline}`:p.homeMoneyline} / ${p.awayMoneyline}` : '-'}
                                            </div>
                                            <div className="text-xs text-gray-300 mt-1">Spread: {p.homeSpread !== undefined ? (p.homeSpread>0?`+${p.homeSpread}`:p.homeSpread) : '-'}</div>
                                            <div className="text-xs text-gray-300">Total: {p.overUnder ?? '-'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Tabs de Navegação */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
                        <div className="flex border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('boxscore')}
                                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                                    activeTab === 'boxscore'
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                📊 Player Statistics
                            </button>
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                                    activeTab === 'stats'
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                📈 Game Statistics
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Tab: Boxscore (Estatísticas dos Jogadores) */}
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
                                                                        <div className="flex items-center gap-2">
                                                                            <div>
                                                                                <div className="text-sm font-medium text-white">{player.athlete?.displayName}</div>
                                                                                <div className="text-xs text-gray-400">{player.athlete?.position?.abbreviation}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('minutes')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm font-bold text-orange-500">{getStatValue('points')}</td>
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
                                                                    <div className="text-lg font-bold text-orange-500">{p.points}</div>
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
                                                                    <div className="text-lg font-bold text-orange-500">{p.points}</div>
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
                                                        {homeBoxscore.statistics[0].athletes.map((player, idx) => {
                                                            const stats = player.stats || [];
                                                            const getStatValue = (name) => stats.find(s => s.name === name)?.displayValue || '-';

                                                            return (
                                                                <tr key={idx} className="hover:bg-gray-700/20 transition-colors">
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div>
                                                                                <div className="text-sm font-medium text-white">{player.athlete?.displayName}</div>
                                                                                <div className="text-xs text-gray-400">{player.athlete?.position?.abbreviation}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center text-sm text-gray-300">{getStatValue('minutes')}</td>
                                                                    <td className="px-3 py-3 text-center text-sm font-bold text-orange-500">{getStatValue('points')}</td>
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

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Game Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-white mb-3">Players Out / Injuries</h4>
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

                            <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-white mb-3">Recent Results</h4>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4 md:col-span-2">
                                <h4 className="text-sm font-semibold text-white mb-3">Head-to-Head</h4>
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

                            <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-white mb-3">Standings</h4>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {gameInfo.venue?.fullName && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Venue</p>
                                        <p className="text-sm text-white">{gameInfo.venue.fullName}</p>
                                    </div>
                                </div>
                            )}
                            {gameInfo.attendance && (
                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-orange-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Attendance</p>
                                        <p className="text-sm text-white">{gameInfo.attendance.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                            {header.season && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Season</p>
                                        <p className="text-sm text-white">{header.season.year} - {header.season.type}</p>
                                    </div>
                                </div>
                            )}
                            {header.week && (
                                <div className="flex items-start gap-3">
                                    <Trophy className="w-5 h-5 text-orange-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Week</p>
                                        <p className="text-sm text-white">Week {header.week}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {!awayBoxscore?.statistics && !homeBoxscore?.statistics && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
                            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">Game statistics not yet available</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
