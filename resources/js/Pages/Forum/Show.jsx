import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CommentSection from '@/Components/CommentSection';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, MessageSquare, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ForumShow({ topic, comments }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this topic?')) {
            router.delete(route('forum.destroy', topic.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={topic.title} />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <Link
                            href={route('forum.index')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back to Forum
                        </Link>
                    </motion.div>

                    {/* Topic */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 mb-8"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">
                                        {topic.category}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-4">{topic.title}</h1>
                            </div>
                            {topic.user_id === window.auth?.user?.id && (
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete topic"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none mb-6">
                            <p className="text-gray-300 text-lg whitespace-pre-wrap">{topic.content}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                        {topic.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{topic.user.name}</span>
                                </div>
                                <span>•</span>
                                <span>
                                    {new Date(topic.created_at).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Eye size={18} />
                                    <span className="text-sm">{topic.views} views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={18} />
                                    <span className="text-sm">{comments.length} replies</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Comments Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <CommentSection
                            comments={comments}
                            commentableType="Topic"
                            commentableId={topic.id}
                        />
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
