'use client';

import { useState } from 'react';

export default function ReviewModal({ isOpen, onClose, rentalId, itemId, onSubmitted }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rentalId, itemId, rating, comment })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            if (onSubmitted) onSubmitted();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Rate your Experience</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= rating ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <p className="rating-text">
                        {rating === 5 ? 'Excellent!' :
                            rating === 4 ? 'Good' :
                                rating === 3 ? 'Okay' :
                                    rating === 2 ? 'Poor' : 'Terrible'}
                    </p>

                    <div className="form-group">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share details about your trip and the item..."
                            rows={4}
                            required
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .modal-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 1.5rem;
                }
                .modal-header h2 { margin: 0; font-size: 1.5rem; }
                .close-btn { background: none; border: none; font-size: 2rem; color: #64748b; cursor: pointer; }
                
                .star-rating {
                    display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;
                }
                .star-btn {
                    background: none; border: none; cursor: pointer;
                    font-size: 2.5rem; color: #e2e8f0; transition: color 0.2s;
                }
                .star-btn.active { color: #f59e0b; }
                .star-btn:hover { transform: scale(1.1); }
                
                .rating-text { text-align: center; font-weight: 600; color: #64748b; margin-bottom: 1.5rem; }
                
                .form-group textarea {
                    width: 100%; padding: 1rem; border: 1px solid #cbd5e1; border-radius: 8px;
                    font-family: inherit; font-size: 1rem; resize: vertical;
                }
                
                .error { color: #ef4444; text-align: center; margin-bottom: 1rem; }
                
                .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
                .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
                .btn-secondary { background: #f1f5f9; color: #475569; }
                .btn-primary { background: #3b82f6; color: white; }
                .btn:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
}
