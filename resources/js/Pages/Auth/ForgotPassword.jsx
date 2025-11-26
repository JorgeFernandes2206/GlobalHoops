import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center px-4 py-12">
            <Head title="Forgot Password — GlobalHoops" />

            {/* Background animated blob */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.1 }}
                transition={{ duration: 1.2 }}
                className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="text-5xl"
                        >
                            🏀
                        </motion.div>
                        <div className="text-left">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">GlobalHoops</h1>
                            <p className="text-xs text-gray-400">Basketball Only 🏀</p>
                        </div>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-white">Forgot your password?</h2>
                    <p className="mt-2 text-sm text-gray-400">No problem! We'll send you a recovery link</p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-2xl shadow-2xl p-8 border border-gray-700/50 backdrop-blur-xl"
                >
                    <div className="mb-6 p-4 rounded-lg bg-white/10 border border-white/30">
                        <p className="text-sm text-gray-300">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-lg bg-white/10 border border-white/30"
                        >
                            <p className="text-sm font-medium text-gray-300">{status}</p>
                        </motion.div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                                Email
                            </label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white transition-all duration-200"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="your@email.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Sending...' : 'Send Recovery Link →'}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-2 text-sm text-white hover:text-gray-300 font-medium transition-colors"
                        >
                            ← Back to login
                        </Link>
                    </div>
                </motion.div>

                {/* Back to home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
