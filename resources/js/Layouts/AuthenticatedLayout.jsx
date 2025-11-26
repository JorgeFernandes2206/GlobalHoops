import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
            {/* Modern Navbar - Single, Sleek Design */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800/50 shadow-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        {/* Left: Logo + Nav Links */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                <ApplicationLogo className="h-8 w-auto fill-current text-gold transition-transform group-hover:scale-105" />
                                <span className="hidden sm:block text-lg font-bold text-white">GlobalHoops</span>
                            </Link>

                            <div className="hidden md:flex items-center gap-1">
                                <NavLink
                                    href={route('inicio')}
                                    active={route().current('inicio')}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    Home
                                </NavLink>
                                <NavLink
                                    href={route('teams.index')}
                                    active={route().current('teams.index')}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    Teams
                                </NavLink>
                                <NavLink
                                    href={route('teams.feed')}
                                    active={route().current('teams.feed')}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    My Feed
                                </NavLink>
                            </div>
                        </div>

                        {/* Right: User Menu */}
                        <div className="flex items-center gap-3">
                            {/* User Info - Desktop */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                    <div className="text-xs text-gray-400">{user.email}</div>
                                </div>
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gold/10 border border-gold/30 text-gold font-bold text-sm hover:bg-gold/20 transition-colors">
                                            {user.name.charAt(0).toUpperCase()}
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setShowingNavigationDropdown((p) => !p)}
                                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-800 transition-colors"
                            >
                                <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'block' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'block' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {showingNavigationDropdown && (
                    <div className="md:hidden border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-xl">
                        <div className="px-4 py-3 space-y-1">
                            <div className="px-3 py-2 mb-2 border-b border-gray-800/50">
                                <div className="text-sm font-medium text-white">{user.name}</div>
                                <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                            <ResponsiveNavLink href={route('inicio')} active={route().current('inicio')}>
                                Home
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('teams.index')} active={route().current('teams.index')}>
                                Teams
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('teams.feed')} active={route().current('teams.feed')}>
                                My Feed
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('profile.edit')} active={route().current('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('logout')} method="post" as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}
