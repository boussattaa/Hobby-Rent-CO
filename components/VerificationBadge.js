"use client";

export default function VerificationBadge({ status = 'unverified', size = 'md' }) {
    if (status === 'unverified' || !status) return null;

    const config = {
        verified: {
            icon: '✓',
            label: 'Identity Verified',
            color: 'text-green-700',
            bg: 'bg-green-100',
            border: 'border-green-200'
        },
        pending: {
            icon: '⏳',
            label: 'Verification Pending',
            color: 'text-yellow-700',
            bg: 'bg-yellow-100',
            border: 'border-yellow-200'
        },
        rejected: {
            icon: '✕',
            label: 'Verification Failed',
            color: 'text-red-700',
            bg: 'bg-red-100',
            border: 'border-red-200'
        }
    };

    const style = config[status] || config.unverified;
    const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.border} ${style.color} ${sizeClasses} font-medium`}
            title={style.label}
        >
            <span>{style.icon}</span>
            <span>{style.label}</span>
        </span>
    );
}
