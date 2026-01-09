import { motion } from 'framer-motion';

export const GameCardSkeleton = () => (
    <div className="p-4 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-700/40">
        <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-8"></div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-8"></div>
                </div>
            </div>
        </div>
    </div>
);

export const NewsCardSkeleton = () => (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/70 to-gray-900/70">
        <div className="animate-pulse">
            <div className="h-52 bg-gray-700"></div>
            <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

export const PlayerCardSkeleton = () => (
    <div className="p-4 bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-2xl border border-gray-700/40">
        <div className="animate-pulse flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-8 bg-gray-700 rounded w-12"></div>
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
    <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
                {[...Array(cols)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-700 rounded flex-1"></div>
                ))}
            </div>
        ))}
    </div>
);
