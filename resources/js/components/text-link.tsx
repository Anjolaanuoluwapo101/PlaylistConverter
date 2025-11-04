import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: LinkProps) {
    return (
        <Link
            className={cn(
                'text-blue-600 underline underline-offset-4 hover:text-blue-800',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}