import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Calendar, Trophy, Flame } from 'lucide-react';
import LiveGamesGrid from '@/Components/Dashboard/LiveGamesGrid';
import UpcomingGamesList from '@/Components/Dashboard/UpcomingGamesList';
import FinishedGamesGrid from '@/Components/Dashboard/FinishedGamesGrid';
import { GameCardSkeleton } from '@/Components/SkeletonLoader';
import axios from 'axios';

console.log('GamesPage loaded');
export default function GamesPage() {
    const [liveGames, setLiveGames] = useState([]);
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [finishedGames, setFinishedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('live'); // live, upcoming, finished


    useEffect(() => {
        loadGames();

        // Auto-refresh a cada 30 segundos
        const interval = setInterval(loadGames, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadGames = async () => {
        try {
            const [live, upcoming, finished] = await Promise.all([
                axios.get('/api/games/live'),
                axios.get('/api/games/upcoming'),
                axios.get('/api/games/finished'),
            ]);

            setLiveGames(live.data || []);
            setUpcomingGames(upcoming.data || []);
            setFinishedGames(finished.data?.response || []);

            // DEBUG: logar os jogos finalizados recebidos diretamente após fetch
            if (typeof window !== 'undefined') {
                console.log('GamesPage API finishedGames:', finished.data?.response);
                // Mostrar total de jogos brutos vindos da Euroleague API
                if (typeof finished.data?.debug_total_games !== 'undefined') {
                    console.log('Euroleague debug_total_games:', finished.data.debug_total_games);
                }
                // Listar todos os jogos finalizados, incluindo Euroleague
                if (Array.isArray(finished.data?.response)) {
                    finished.data.response.forEach(game => {
                        console.log('[FINISHED GAME]', {
                            date: game.date,
                            league: game.league?.name || '',
                            home: game.teams?.home?.name || '',
                            away: game.teams?.away?.name || '',
                            score_home: game.teams?.home?.score,
                            score_away: game.teams?.away?.score,
                            status: game.status,
                            identifier: game.id || '',
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Error loading games:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Games</h2>
                            <p className="text-sm text-gray-400 font-medium">Live, Upcoming & Recent Results</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Games" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 bg-gray-800/50 backdrop-blur-xl p-2 rounded-2xl border border-gray-700/50">
                        <button
                            onClick={() => setActiveTab('live')}
                            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                                activeTab === 'live'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Flame className="w-5 h-5" />
                                <span>Live</span>
                                {liveGames.length > 0 && (
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                        {liveGames.length}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                                activeTab === 'upcoming'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>Upcoming</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('finished')}
                            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                                activeTab === 'finished'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5" />
                                <span>Results</span>
                            </div>
                        </button>
                    </div>

                    {/* Content */}
                    <div key={activeTab} className="animate-fade-in">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <GameCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                {activeTab === 'live' && (
                                    <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl">
                                        <LiveGamesGrid games={liveGames} />
                                    </div>
                                )}

                                {activeTab === 'upcoming' && (
                                    <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl">
                                        <UpcomingGamesList games={upcomingGames} />
                                    </div>
                                )}

                                {activeTab === 'finished' && (
                                    <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl">
                                        <FinishedGamesGrid games={finishedGames} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
