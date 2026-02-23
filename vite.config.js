import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom'],
                    'inertia': ['@inertiajs/react', '@inertiajs/inertia'],
                    'motion': ['framer-motion'],
                    'icons': ['lucide-react'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        minify: 'esbuild', // esbuild é mais rápido que terser
        target: 'es2015', // Suporte a browsers modernos
        cssMinify: true,
        reportCompressedSize: false, // Mais rápido build
    },
});
