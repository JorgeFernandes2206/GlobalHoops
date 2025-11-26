export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl-lg border border-transparent bg-gradient-to-r from-[rgba(212,175,55,0.15)] to-[rgba(212,175,55,0.06)] px-4 py-2 text-sm font-semibold tracking-wide text-gold shadow-sm transition duration-150 ease-in-out hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.12)] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
