
export interface SSLBadgeProps {
    status: 'valid' | 'invalid' | 'expired' | 'expiring' | 'pending';
    daysUntilExpiry?: number;
    className?: string;
}

/**
 * SSL status badge component with color coding based on certificate status
 */
export default function SSLBadge({
    status,
    daysUntilExpiry = 0,
    className = ''
}: SSLBadgeProps) {
    const getBadgeConfig = () => {
        const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

        switch (status) {
            case 'valid':
                if (daysUntilExpiry <= 7) {
                    return {
                        classes: `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`,
                        text: 'Expiring Soon',
                        icon: '⚠️',
                    };
                }
                return {
                    classes: `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`,
                    text: 'Valid',
                    icon: '✅',
                };
            case 'expired':
                return {
                    classes: `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`,
                    text: 'Expired',
                    icon: '❌',
                };
            case 'expiring':
                return {
                    classes: `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300`,
                    text: 'Expiring',
                    icon: '⏰',
                };
            case 'pending':
                return {
                    classes: `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`,
                    text: 'Pending',
                    icon: '⏳',
                };
            case 'invalid':
            default:
                return {
                    classes: `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`,
                    text: 'Invalid',
                    icon: '❌',
                };
        }
    };

    const config = getBadgeConfig();

    return (
        <span className={`${config.classes} ${className}`}>
            <span className="mr-1" role="img" aria-label={status}>
                {config.icon}
            </span>
            {config.text}
            {status === 'valid' && daysUntilExpiry <= 30 && daysUntilExpiry > 7 && (
                <span className="ml-1 text-xs opacity-75">
                    ({daysUntilExpiry}d)
                </span>
            )}
        </span>
    );
} 