import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function ForumCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        category: 'general',
    });

    const categories = [
        { value: 'general', label: 'General Discussion' },
        { value: 'nba', label: 'NBA' },
        { value: 'euroleague', label: 'EuroLeague' },
        { value: 'transfer', label: 'Transfer News' },
        { value: 'other', label: 'Other' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('forum.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Topic" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 rounded-lg p-8 border border-gray-700"
                    >
                        <h1 className="text-3xl font-bold text-white mb-6">Create New Topic</h1>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="mt-2 text-sm text-red-400">{errors.category}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="What's your topic about?"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    maxLength={255}
                                />
                                {errors.title && (
                                    <p className="mt-2 text-sm text-red-400">{errors.title}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Content
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={10}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                />
                                {errors.content && (
                                    <p className="mt-2 text-sm text-red-400">{errors.content}</p>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    Minimum 10 characters
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                >
                                    {processing ? 'Creating...' : 'Create Topic'}
                                </button>
                                <Link
                                    href={route('forum.index')}
                                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
