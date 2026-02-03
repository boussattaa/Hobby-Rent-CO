'use client';

import { useState } from 'react';
import { deleteItem } from '@/app/my-listings/actions';

export default function DeleteButton({ itemId }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e) => {
        // e.preventDefault() is not strictly needed if not in a Link, but good practice
        e.preventDefault();
        if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
            return;
        }

        setLoading(true);
        const result = await deleteItem(itemId);

        if (result?.error) {
            alert('Failed to delete: ' + result.error);
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="btn-delete"
            title="Delete Listing"
        >
            {loading ? '...' : 'Delete'}
            <style jsx>{`
                .btn-delete {
                    background: transparent;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    flex: 1;
                }
                .btn-delete:hover {
                    background: #ef4444;
                    color: white;
                }
                .btn-delete:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </button>
    );
}
