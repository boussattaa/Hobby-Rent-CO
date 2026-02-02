'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ children, formAction, className, pendingText = 'Loading...' }) {
    const { pending } = useFormStatus()

    return (
        <button
            formAction={formAction}
            className={className}
            disabled={pending}
            type="submit"
        >
            {pending ? pendingText : children}
        </button>
    )
}
