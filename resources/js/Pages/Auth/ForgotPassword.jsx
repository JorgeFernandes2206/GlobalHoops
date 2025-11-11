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
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-300 dark:from-black dark:via-zinc-900 dark:to-orange-900 flex items-center justify-center px-4 py-12">
            <Head title="Recuperar Password — GlobalHoops" />
            
            {/* Background animated blob */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 0.4 }} 
                transition={{ duration: 1.2 }}
                className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-orange-300 opacity-30 blur-3xl dark:bg-orange-700/20"
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
                            className="rounded-full bg-gradient-to-br from-[#FF2D20] to-[#ff5722] p-3 shadow-xl"
                        >
                            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="currentColor" />
                                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2.5a7.5 7.5 0 11-0.001 15.001A7.5 7.5 0 0112 4.5z" fill="#FFEDD5" opacity="0.4" />
                                <path d="M7 7c3 3 7 3 10 0M7 17c3-3 7-3 10 0" stroke="#FF2D20" strokeWidth="2" />
                            </svg>
                        </motion.div>
                        <div className="text-left">
                            <h1 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">GlobalHoops</h1>
                            <p className="text-xs text-black/60 dark:text-white/60">Só Basquetebol 🏀</p>
                        </div>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-black dark:text-white">Esqueceu a password?</h2>
                    <p className="mt-2 text-sm text-black/60 dark:text-white/60">Sem problema! Vamos enviar um link de recuperação</p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-orange-100 dark:border-zinc-800"
                >
                    <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Introduza o seu email e enviaremos um link para redefinir a sua password.
                        </p>
                    </div>

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
                            <label htmlFor="email" className="block text-sm font-semibold text-black dark:text-white mb-2">
                                Email
                            </label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition-all duration-200"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="seu@email.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-gradient-to-r from-[#FF2D20] to-[#ff5722] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'A enviar...' : 'Enviar Link de Recuperação →'}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-2 text-sm text-[#FF2D20] hover:text-[#e0251b] font-medium transition-colors"
                        >
                            ← Voltar ao login
                        </Link>
                    </div>
                </motion.div>

                {/* Back to home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                    >
                        ← Voltar à página inicial
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
