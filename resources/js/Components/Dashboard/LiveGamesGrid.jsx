import GameCard from './GameCard';
import { Activity } from 'lucide-react';

export default function LiveGamesGrid({ games }) {
    if (!games || games.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm p-12 text-center border border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(239,68,68,0.1),transparent)]"></div>
                <div className="relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 mb-4">
                        <Activity className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Live Games</h3>
                    <p className="text-gray-400">Check back soon for live action</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.slice(0, 6).map((game) => (
                <GameCard key={game.id} game={game} isLive={true} />
            ))}
        </div>
    );
}
