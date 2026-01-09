import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Index({ teams, selectedLeague, selectedCountry, availableLeagues, availableCountries }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [league, setLeague] = useState(selectedLeague || 'nba');
    const [country, setCountry] = useState(selectedCountry || null);

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) ||
                            team.city?.toLowerCase().includes(search.toLowerCase()) ||
                            team.country?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' ||
                            (filter === 'following' && team.is_following) ||
                            (filter === 'east' && team.conference === 'East') ||
                            (filter === 'west' && team.conference === 'West');
        return matchesSearch && matchesFilter;
    });

    const handleLeagueChange = (newLeague) => {
        setLeague(newLeague);
        setCountry(null);
        router.get(route('teams.index'), { league: newLeague }, {
            preserveScroll: false,
            preserveState: false,
        });
    };
    
    const handleCountryChange = (newCountry) => {
        setCountry(newCountry);
        router.get(route('teams.index'), { league, country: newCountry }, {
            preserveScroll: false,
            preserveState: false,
        });
    };

    const handleFollow = (teamId) => {
        router.post(route('teams.follow'), {
            team_api_id: teamId,
        }, {
            preserveScroll: true,
        });
    };

    const handleUnfollow = (teamId) => {
        console.log('Unfollowing team:', teamId);
        router.post(route('teams.unfollow'), {
            team_api_id: teamId,
        }, {
            preserveScroll: true,
            onError: (errors) => {
                console.error('Unfollow errors:', errors);
            },
            onSuccess: () => {
                console.log('Unfollow success');
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Teams" />

            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Basketball Teams</h1>
                        <p className="text-gray-400">Follow your favorite teams and get instant updates</p>
                    </motion.div>

                    {/* League Selector */}
                    <div className="mb-6 flex gap-3">
                        {availableLeagues?.map((l) => (
                            <button
                                key={l.id}
                                onClick={() => handleLeagueChange(l.id)}
                                className={`px-6 py-3 rounded-xl font-bold text-lg transition ${
                                    league === l.id
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {l.name}
                            </button>
                        ))}
                    </div>

                    {/* Country Filter (only for Europe) */}
                    {league === 'euroleague' && availableCountries?.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Country:</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleCountryChange(null)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        !country
                                            ? 'bg-white text-black'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    All Countries
                                </button>
                                {availableCountries.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => handleCountryChange(c)}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            country === c
                                                ? 'bg-white text-black'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 rounded-lg bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-white focus:ring-white"
                        />
                        <div className="flex gap-2">
                            {['all', 'following', 'east', 'west'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        filter === f
                                            ? 'bg-white text-black'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Teams Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team, index) => (
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
                                                className="w-12 h-12 rounded-lg object-contain bg-white/5 p-1"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                                            style={{ 
                                                display: team.logo_url ? 'none' : 'flex',
                                                backgroundColor: team.color ? `#${team.color}20` : 'rgba(255,255,255,0.1)',
                                                color: team.color ? `#${team.color}` : 'white'
                                            }}
                                        >
                                            {team.abbreviation || '🏀'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{team.name}</h3>
                                            {team.city && (
                                                <p className="text-sm text-gray-400">{team.city}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {team.league && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">League:</span>
                                            <span className={`text-white font-bold px-2 py-0.5 rounded ${
                                                team.league === 'NBA' ? 'bg-blue-500/20' : 'bg-orange-500/20'
                                            }`}>
                                                {team.league}
                                            </span>
                                        </div>
                                    )}
                                    {team.country && league === 'euroleague' && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Country:</span>
                                            <span className="text-white font-medium">{team.country}</span>
                                        </div>
                                    )}
                                    {team.conference && league === 'nba' && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Conference:</span>
                                            <span className="text-white font-medium">{team.conference}</span>
                                        </div>
                                    )}
                                    {team.division && league === 'nba' && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Division:</span>
                                            <span className="text-white font-medium">{team.division}</span>
                                        </div>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => team.is_following ? handleUnfollow(team.id) : handleFollow(team.id)}
                                    className={`w-full rounded-lg px-4 py-2.5 font-semibold transition ${
                                        team.is_following
                                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                                            : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                                >
                                    {team.is_following ? '✓ Following' : '+ Follow'}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>

                    {filteredTeams.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No teams found</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
