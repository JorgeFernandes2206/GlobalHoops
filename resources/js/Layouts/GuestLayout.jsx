import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[linear-gradient(180deg,#07121a_0%,#07131a_100%)] pt-6 sm:justify-center sm:pt-0 text-gray-100">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gold" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-[rgba(255,255,255,0.03)] px-6 py-6 shadow-glass sm:max-w-md sm:rounded-xl">
                {children}
            </div>
        </div>
    );
}
