import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { NewsCardSkeleton } from '@/Components/SkeletonLoader';

export default function NewsIndex({ auth }) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, nba, euroleague

    useEffect(() => {
        loadNews();
    }, [filter]);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/news-data`, {
                params: {
                    league: filter === 'all' ? null : filter,
                    limit: 20
                }
            });
            
            console.log('API Response:', response.data);
            console.log('Is Array?', Array.isArray(response.data));
            
            setNews(response.data || []);
        } catch (error) {
            console.error('Error loading news:', error);
            console.error('Error details:', error.response);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    const changeFilter = (newFilter) => {
        setFilter(newFilter);
        setNews([]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-white leading-tight">
                        News
                    </h2>
                </div>
            }
        >
            <Head title="News" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filter Tabs */}
                    <div className="mb-8">
                        <div className="flex space-x-2 bg-gray-800/50 rounded-xl p-2 backdrop-blur-sm">
                            <button
                                onClick={() => changeFilter('all')}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    filter === 'all'
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => changeFilter('nba')}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    filter === 'nba'
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                NBA
                            </button>
                            <button
                                onClick={() => changeFilter('euroleague')}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    filter === 'euroleague'
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                Euroleague
                            </button>
                        </div>
                    </div>

                    {/* News Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            // Show skeleton loaders on initial load
                            [...Array(9)].map((_, i) => (
                                <NewsCardSkeleton key={i} />
                            ))
                        ) : (
                            Array.isArray(news) && news.map((article, index) => (
                                <motion.div
                                    key={article.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 group"
                                >
                                    {/* Image */}
                                    {article.images && article.images.length > 0 && (
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={article.images[0].url}
                                                alt={article.images[0].alt || article.headline}
                                                loading="lazy"
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-60"></div>
                                            
                                            {/* Category Badge */}
                                            {article.type && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-orange-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                                        {article.type.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Date */}
                                        <div className="text-gray-400 text-sm mb-3">
                                            {formatDate(article.published)}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-500 transition-colors duration-200 line-clamp-2">
                                            {article.headline}
                                        </h3>

                                        {/* Description */}
                                        {article.description && (
                                            <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                                                {article.description}
                                            </p>
                                        )}

                                        {/* Read More Link */}
                                        <a
                                            href={article.links?.web?.href || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-orange-500 hover:text-orange-400 font-medium text-sm transition-colors duration-200"
                                        >
                                            Read more
                                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Empty State */}
                    {!loading && (!Array.isArray(news) || news.length === 0) && (
                        <div className="text-center py-16">
                            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No news found</h3>
                            <p className="text-gray-500">Try changing the filter or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
