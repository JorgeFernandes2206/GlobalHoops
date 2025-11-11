import GameCard from './GameCard';
import { Activity } from 'lucide-react';

export default function LiveGamesGrid({ games }) {
    if (!games || games.length === 0) {
        return (
            <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 text-center border border-gray-700/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 mb-4">
                    <Activity className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Live Games</h3>
                <p className="text-gray-400">No games are currently in progress</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FF2D20]/10 rounded-full border border-[#FF2D20]/30">
                    <span className="h-2 w-2 rounded-full bg-[#FF2D20] animate-pulse"></span>
                    <h2 className="text-lg font-black text-[#FF2D20] uppercase tracking-wider">Live Games</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {games.slice(0, 6).map((game) => (
                    <GameCard key={game.id} game={game} isLive={true} />
                ))}
            </div>
        </div>
    );
}
