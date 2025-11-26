import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center px-4 py-12">
            <Head title="Entrar — GlobalHoops" />

            {/* Background animated blob */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.1 }}
                transition={{ duration: 1.2 }}
                className="absolute top-20 right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"
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
                            <h1 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">GlobalHoops</h1>
                            <p className="text-xs text-black/60 dark:text-white/60">Só Basquetebol 🏀</p>
                        </div>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-black dark:text-white">Bem-vindo de volta!</h2>
                    <p className="mt-2 text-sm text-black/60 dark:text-white/60">Entre na sua conta para continuar</p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-orange-100 dark:border-zinc-800"
                >
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                        >
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">{status}</p>
                        </motion.div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-gray-300 font-semibold" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white transition-all duration-200"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="seu@email.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-gray-300 font-semibold" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white transition-all duration-200"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center group cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 text-white focus:ring-white"
                                />
                                <span className="ms-2 text-sm text-gray-300 group-hover:text-white transition-colors">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Signing in...' : 'Sign In →'}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                className="font-semibold text-white hover:text-gray-300 transition-colors"
                            >
                                Sign up now
                            </Link>
                        </p>
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
