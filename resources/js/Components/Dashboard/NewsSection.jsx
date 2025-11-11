import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Newspaper, ExternalLink, TrendingUp, Sparkles } from 'lucide-react';

export default function NewsSection({ news = [] }) {
    if (!news || news.length === 0) {
        return (
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                            <Newspaper className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Latest News</h2>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Breaking Stories</p>
                        </div>
                    </div>
                    <div className="text-center py-12">
                        <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-700 opacity-20" />
                        <p className="text-sm font-semibold text-gray-400">No news available at the moment.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl p-8 border border-gray-700/50 shadow-2xl">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 shadow-inner shadow-purple-500/10" />
            
            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                            <Newspaper className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Latest News</h2>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Breaking Stories</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400">Trending</span>
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map((article, index) => (
                        <motion.a
                            key={article.id || index}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group/article relative"
                        >
                            {/* Hover Glow */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 rounded-2xl opacity-0 group-hover/article:opacity-100 blur transition-all duration-300" />
                            
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border border-gray-700/40 group-hover/article:border-purple-500/40 transition-all duration-300 shadow-lg h-full">
                                {/* Image */}
                                {article.image && (
                                    <div className="relative h-52 overflow-hidden">
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10" />
                                        
                                        {/* Image with Zoom Effect */}
                                        <img
                                            src={article.image}
                                            alt={article.headline}
                                            className="w-full h-full object-cover group-hover/article:scale-110 transition-transform duration-700"
                                        />

                                        {/* League Badge */}
                                        <div className="absolute top-4 left-4 z-20">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-[#FF2D20] blur-lg opacity-50" />
                                                <span className="relative px-4 py-1.5 bg-gradient-to-r from-[#FF2D20] to-orange-600 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3" />
                                                    {article.league}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-5">
                                    {/* Meta Info */}
                                    <div className="flex items-center gap-3 mb-3">
                                        {!article.image && (
                                            <span className="px-3 py-1 bg-[#FF2D20]/20 border border-[#FF2D20]/30 text-[#FF2D20] text-xs font-bold rounded-lg flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3" />
                                                {article.league}
                                            </span>
                                        )}
                                        <span className="text-xs font-semibold text-gray-500">
                                            {new Date(article.published).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    {/* Headline */}
                                    <h3 className="text-lg font-black text-white group-hover/article:text-transparent group-hover/article:bg-gradient-to-r group-hover/article:from-purple-400 group-hover/article:to-pink-400 group-hover/article:bg-clip-text transition-all duration-300 line-clamp-2 mb-3">
                                        {article.headline}
                                    </h3>

                                    {/* Description */}
                                    {article.description && (
                                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                                            {article.description}
                                        </p>
                                    )}

                                    {/* Read More Link */}
                                    <div className="flex items-center gap-2 text-xs font-black text-purple-400 group-hover/article:text-purple-300 group-hover/article:gap-3 transition-all">
                                        <span>READ MORE</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
}
