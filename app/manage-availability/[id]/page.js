"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function ManageAvailability() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [blockedDates, setBlockedDates] = useState(new Set());
    const [currentDate, setCurrentDate] = useState(new Date()); // For month view

    // Fetch item and availability
    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Item
            const { data: itemData, error: itemError } = await supabase
                .from('items')
                .select('*')
                .eq('id', id)
                .single();

            if (itemError) {
                console.error('Error fetching item:', itemError);
                return;
            }
            setItem(itemData);

            // 2. Fetch Availability (Assuming table exists, catch error if not)
            const { data: availData, error: availError } = await supabase
                .from('item_availability')
                .select('date')
                .eq('item_id', id);

            if (availData) {
                const dates = new Set(availData.map(r => r.date));
                setBlockedDates(dates);
            }

            setLoading(false);
        };

        fetchData();
    }, [id, supabase]);

    // Calendar Logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const toggleDate = async (dateObj) => {
        if (!dateObj) return;
        // Fix: use local date string construction
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const newBlocked = new Set(blockedDates);

        if (newBlocked.has(dateStr)) {
            // Unblock
            newBlocked.delete(dateStr);
            setBlockedDates(newBlocked);
            // Optimistic UI, verify in background
            await supabase.from('item_availability').delete().match({ item_id: id, date: dateStr });
        } else {
            // Block
            newBlocked.add(dateStr);
            setBlockedDates(newBlocked);
            await supabase.from('item_availability').insert({ item_id: id, date: dateStr, status: 'blocked' });
        }
    };

    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    if (loading) return <div className="container" style={{ padding: '8rem' }}>Loading...</div>;
    if (!item) return <div className="container" style={{ padding: '8rem' }}>Item not found.</div>;

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem', maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href={`/item/${id}`} style={{ color: '#666', textDecoration: 'none' }}>← Back to Listing</Link>
                <h1 style={{ marginTop: '1rem' }}>Manage Availability</h1>
                <p style={{ color: '#666' }}>Tap dates to block/unblock them for <strong>{item.name}</strong>.</p>
            </div>

            <div className="calendar-card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
                <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <button onClick={() => changeMonth(-1)} className="btn btn-secondary">◀</button>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{monthName} {year}</h2>
                    <button onClick={() => changeMonth(1)} className="btn btn-secondary">▶</button>
                </div>

                <div className="weekdays" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                <div className="days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                    {days.map((date, idx) => {
                        if (!date) return <div key={idx}></div>;

                        // Fix: use local date string to match DB "YYYY-MM-DD"
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const isBlocked = blockedDates.has(dateStr);
                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                        return (
                            <button
                                key={idx}
                                onClick={() => !isPast && toggleDate(date)}
                                disabled={isPast}
                                style={{
                                    aspectRatio: '1',
                                    background: isBlocked ? '#fee2e2' : 'white',
                                    border: isBlocked ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: isBlocked ? '#b91c1c' : (isPast ? '#cbd5e1' : '#1e293b'),
                                    cursor: isPast ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    fontWeight: isBlocked ? 'bold' : 'normal'
                                }}
                            >
                                {date.getDate()}
                                {isBlocked && <span style={{ position: 'absolute', bottom: '4px', fontSize: '0.7rem' }}>⛔</span>}
                            </button>
                        );
                    })}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', border: '1px solid #e2e8f0', borderRadius: '4px' }}></div>
                        Available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#fee2e2', border: '2px solid #ef4444', borderRadius: '4px' }}></div>
                        Blocked
                    </div>
                </div>
            </div>
        </div>
    );
}
