'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ReviewList({ itemId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [average, setAverage] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    id, rating, comment, created_at,
                    reviewer:profiles(first_name, is_verified)
                `)
                .eq('item_id', itemId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setReviews(data);
                if (data.length > 0) {
                    const total = data.reduce((sum, r) => sum + r.rating, 0);
                    setAverage((total / data.length).toFixed(1));
                }
            }
            setLoading(false);
        };

        fetchReviews();
    }, [itemId, supabase]);

    if (loading) return <div className="loading-state">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="no-reviews">
                <p>No reviews yet. Be the first to rent and review!</p>
            </div>
        );
    }

    return (
        <div className="review-section">
            <div className="review-header">
                <h3>Reviews</h3>
                <div className="rating-badge">
                    <span className="star">★</span>
                    <span className="score">{average}</span>
                    <span className="count">({reviews.length} reviews)</span>
                </div>
            </div>

            <div className="reviews-grid">
                {reviews.map(review => (
                    <div key={review.id} className="review-card">
                        <div className="reviewer-info">
                            <div className="avatar">
                                {review.reviewer?.first_name?.[0] || 'U'}
                            </div>
                            <div className="meta">
                                <span className="name">{review.reviewer?.first_name || 'User'}</span>
                                <span className="date">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="stars">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                        <p className="comment">{review.comment}</p>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .review-section { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; }
                .review-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
                .review-header h3 { font-size: 1.5rem; margin: 0; }
                .rating-badge { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; }
                .star { color: #f59e0b; }
                .score { font-weight: 700; color: #0f172a; }
                .count { color: #64748b; font-size: 0.9rem; }
                
                .no-reviews { padding: 2rem; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 12px; }
                
                .reviews-grid { display: grid; gap: 1.5rem; }
                .review-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #f1f5f9; }
                
                .reviewer-info { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem; }
                .avatar { width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #475569; }
                .meta { display: flex; flex-direction: column; }
                .name { font-weight: 600; font-size: 0.9rem; }
                .date { color: #94a3b8; font-size: 0.8rem; }
                
                .stars { color: #f59e0b; font-size: 1rem; margin-bottom: 0.75rem; letter-spacing: 2px; }
                .comment { color: #334155; line-height: 1.5; margin: 0; }
            `}</style>
        </div>
    );
}
