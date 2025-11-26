import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center px-4 py-12">
            <Head title="Registar — GlobalHoops" />

            {/* Background animated blob */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.1 }}
                transition={{ duration: 1.2 }}
                className="absolute top-20 left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"
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
                    <h2 className="mt-6 text-3xl font-bold text-black dark:text-white">Criar conta</h2>
                    <p className="mt-2 text-sm text-black/60 dark:text-white/60">Junte-se à comunidade de basquetebol</p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-orange-100 dark:border-zinc-800"
                >
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Name" className="text-gray-300 font-semibold" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-2 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white transition-all duration-200"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="Your name"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-gray-300 font-semibold" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white transition-all duration-200"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
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
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                placeholder="Minimum 8 characters"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                                className="text-gray-300 font-semibold"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-2 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white transition-all duration-200"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                required
                                placeholder="Repeat password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {processing ? 'Creating account...' : 'Create Account →'}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold text-white hover:text-gray-300 transition-colors"
                            >
                                Sign in now
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
