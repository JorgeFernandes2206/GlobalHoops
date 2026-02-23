import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function LiveGames({ auth }) {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let interval = null;
        const fetchGames = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/games/live');
                if (!res.ok) throw new Error('Failed to fetch live games');
                const data = await res.json();
                setGames(data);
            } catch (err) {
                setError('Could not load live games.');
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
        interval = setInterval(fetchGames, 15000); // Atualiza a cada 15s
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6">Live Games</h1>
                {loading && <div className="text-gray-500">Loading...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {!loading && games.length === 0 && !error && (
                    <div className="text-gray-500">No live games at the moment.</div>
                )}
                <div className="grid gap-4">
                    {games.map((game, idx) => (
                        <div key={idx} className="bg-white rounded shadow p-4 flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="font-semibold">{game.homeTeam?.name}</span>
                                    <span className="text-2xl font-bold">{game.homeScore}</span>
                                </div>
                                <span className="mx-2 text-gray-500">vs</span>
                                <div className="flex flex-col items-center">
                                    <span className="font-semibold">{game.awayTeam?.name}</span>
                                    <span className="text-2xl font-bold">{game.awayScore}</span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 text-sm text-gray-600">
                                {game.status || 'Live'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
