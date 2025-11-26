import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-2 py-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none rounded-md ' +
                (active
                    ? 'bg-[rgba(212,175,55,0.08)] text-gold border border-[rgba(212,175,55,0.06)]'
                    : 'text-gray-300 hover:bg-[rgba(255,255,255,0.02)] hover:text-gray-100') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
