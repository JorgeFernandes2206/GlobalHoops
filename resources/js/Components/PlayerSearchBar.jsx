import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Search, X, Loader2 } from 'lucide-react';

export default function PlayerSearchBar({ className = '' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const timeoutRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (searchQuery) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        setLoading(true);
        
        try {
            const response = await window.axios.get(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
            setResults(response.data.results || []);
            setShowDropdown(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            handleSearch(value);
        }, 300);
    };

    const handlePlayerClick = (player) => {
        router.visit(`/players/${player.league}/${player.id}`);
        setQuery('');
        setShowDropdown(false);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.length >= 2 && setShowDropdown(true)}
                    placeholder="Search players..."
                    className="w-full pl-10 pr-10 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <X className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {showDropdown && query.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {results.length === 0 && !loading && (
                        <div className="p-4 text-center text-gray-400">
                            No players found for "{query}"
                        </div>
                    )}

                    {results.map((player) => (
                        <button
                            key={`${player.league}-${player.id}`}
                            onClick={() => handlePlayerClick(player)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 transition-colors text-left border-b border-gray-700/30 last:border-0"
                        >
                            {player.image ? (
                                <img
                                    src={player.image}
                                    alt={player.fullName}
                                    className="w-10 h-10 rounded-full object-cover bg-gray-700"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                                    {player.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate">{player.fullName}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{player.team}</span>
                                    {player.position && (
                                        <>
                                            <span>•</span>
                                            <span>{player.position}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {player.number && (
                                    <span className="text-xs text-gray-500">#{player.number}</span>
                                )}
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    player.league === 'nba' 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                    {player.league.toUpperCase()}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
