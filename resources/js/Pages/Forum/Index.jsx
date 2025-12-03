import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { MessageSquare, Eye, Pin, Lock, Plus } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export default function ForumIndex({ topics, category }) {
    const categories = [
        { value: 'general', label: 'General' },
        { value: 'nba', label: 'NBA' },
        { value: 'euroleague', label: 'EuroLeague' },
        { value: 'transfer', label: 'Transfers' },
        { value: 'other', label: 'Other' },
    ];

    const filterByCategory = (cat) => {
        router.get(route('forum.index'), cat ? { category: cat } : {});
    };

    return (
        <AuthenticatedLayout>
            <Head title="Forum" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Forum</h1>
                            <p className="text-gray-400">Discuss basketball with the community</p>
                        </div>
                        <Link
                            href={route('forum.create')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                        >
                            <Plus size={20} />
                            New Topic
                        </Link>
                    </motion.div>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 flex flex-wrap gap-2"
                    >
                        <button
                            onClick={() => filterByCategory(null)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                !category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => filterByCategory(cat.value)}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    category === cat.value
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </motion.div>

                    {/* Topics List */}
                    <div className="space-y-4">
                        {topics.data.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 bg-gray-800/50 rounded-lg"
                            >
                                <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400 text-lg">No topics yet</p>
                                <p className="text-gray-500 mt-2">Be the first to start a discussion!</p>
                            </motion.div>
                        ) : (
                            topics.data.map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={route('forum.show', topic.id)}
                                        className="block bg-gray-800/50 hover:bg-gray-800 rounded-lg p-6 transition-all border border-gray-700 hover:border-gray-600"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {topic.is_pinned && (
                                                        <Pin size={16} className="text-yellow-500" />
                                                    )}
                                                    {topic.is_locked && (
                                                        <Lock size={16} className="text-red-500" />
                                                    )}
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                                        {topic.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-semibold text-white mb-2 truncate">
                                                    {topic.title}
                                                </h3>
                                                <p className="text-gray-400 line-clamp-2 mb-3">
                                                    {topic.content}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>by {topic.user.name}</span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(topic.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3 text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare size={16} />
                                                    <span className="text-sm">{topic.comments_count || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Eye size={16} />
                                                    <span className="text-sm">{topic.views}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {topic.latest_comment && (
                                            <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-500">
                                                Latest reply by {topic.latest_comment.user.name} •{' '}
                                                {new Date(topic.latest_comment.created_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {topics.last_page > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 flex justify-center gap-2"
                        >
                            {topics.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        link.active
                                            ? 'bg-blue-500 text-white'
                                            : link.url
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
