import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { motion } from 'framer-motion';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="Profile Settings" />

            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                        <p className="text-gray-400">Manage your profile, security, and preferences</p>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Information Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 border border-gold/30">
                                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Profile Information</h3>
                                    <p className="text-sm text-gray-400">Update your name and email address</p>
                                </div>
                            </div>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </motion.div>

                        {/* Update Password Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/30">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Security</h3>
                                    <p className="text-sm text-gray-400">Change your password</p>
                                </div>
                            </div>
                            <UpdatePasswordForm />
                        </motion.div>

                        {/* Delete Account Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/30">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Danger Zone</h3>
                                    <p className="text-sm text-gray-400">Delete your account</p>
                                </div>
                            </div>
                            <DeleteUserForm />
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
