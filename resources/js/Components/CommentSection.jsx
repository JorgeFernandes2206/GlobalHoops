import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { MessageCircle, Send, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CommentItem({ comment, depth = 0, onReply }) {
    const [showReplies, setShowReplies] = useState(true);
    const [isReplying, setIsReplying] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this comment?')) {
            router.delete(route('comments.destroy', comment.id));
        }
    };

    const { auth } = usePage().props;
    const canDelete = auth?.user && comment.user.id === auth.user.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`${depth > 0 ? 'ml-8 md:ml-12' : ''}`}
        >
            <div className="group relative">
                {/* Linha de conexão para replies */}
                {depth > 0 && (
                    <div className="absolute -left-6 md:-left-10 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/50 to-transparent" />
                )}

                <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF2D20] to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {comment.user.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(comment.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete comment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                        {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-xs">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-[#FF2D20] transition-colors font-medium"
                        >
                            <Reply className="w-3.5 h-3.5" />
                            Reply
                        </button>

                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors font-medium"
                            >
                                {showReplies ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                )}
                                {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    <AnimatePresence>
                        {isReplying && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-gray-700/50"
                            >
                                <CommentForm
                                    commentableType={comment.commentable_type}
                                    commentableId={comment.commentable_id}
                                    parentId={comment.id}
                                    onSuccess={() => setIsReplying(false)}
                                    placeholder="Write a reply..."
                                    compact
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nested Replies */}
            <AnimatePresence>
                {showReplies && comment.replies && comment.replies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 space-y-3"
                    >
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                depth={depth + 1}
                                onReply={onReply}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function CommentForm({ commentableType, commentableId, parentId = null, onSuccess, placeholder = "Share your thoughts...", compact = false }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        commentable_type: commentableType,
        commentable_id: commentableId,
        parent_id: parentId,
        content: '',
    });

    const submit = (e) => {
        e.preventDefault();
        
        post(route('comments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('content');
                if (onSuccess) onSuccess();
            },
            onError: (errors) => {
                console.error('Error posting comment:', errors);
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="relative">
                <textarea
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder={placeholder}
                    rows={compact ? 2 : 3}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF2D20]/50 focus:border-transparent resize-none"
                    disabled={processing}
                />
                {errors.content && (
                    <p className="mt-1 text-xs text-red-400">{errors.content}</p>
                )}
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={processing || !data.content.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF2D20] to-orange-600 text-white font-semibold rounded-lg hover:from-[#FF2D20]/90 hover:to-orange-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#FF2D20]/20"
                >
                    <Send className="w-4 h-4" />
                    {processing ? 'Posting...' : (compact ? 'Reply' : 'Post Comment')}
                </button>
            </div>
        </form>
    );
}

export default function CommentSection({ commentableType, commentableId, comments: initialComments = [] }) {
    const { props } = usePage();
    const comments = props.comments || initialComments;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[rgba(255,45,32,0.1)]">
                    <MessageCircle className="w-5 h-5 text-[#FF2D20]" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Discussion</h3>
                    <p className="text-sm text-gray-400">
                        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                    </p>
                </div>
            </div>

            {/* Comment Form */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                <CommentForm
                    commentableType={commentableType}
                    commentableId={commentableId}
                />
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {comments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                            <p className="text-gray-400 font-medium">No comments yet</p>
                            <p className="text-sm text-gray-500 mt-1">Be the first to share your thoughts!</p>
                        </motion.div>
                    ) : (
                        comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
