import { createClient } from '@/utils/supabase/server';
import AdminPaymentsClient from './AdminPaymentsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
    const supabase = await createClient();

    // Fetch completed rentals that haven't been paid out yet
    const { data: pendingPayouts, error } = await supabase
        .from('rentals')
        .select(`
            *,
            items (name, owner_id, price)
        `)
        .eq('status', 'completed')
        .eq('paid_out', false)
        .order('end_date', { ascending: false });

    // Fetch paid out rentals for history
    const { data: paidPayouts } = await supabase
        .from('rentals')
        .select(`
            *,
            items (name, owner_id, price)
        `)
        .eq('paid_out', true)
        .order('end_date', { ascending: false })
        .limit(20);

    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error loading payments: {error.message}</div>;
    }

    return (
        <AdminPaymentsClient
            pendingPayouts={pendingPayouts || []}
            paidPayouts={paidPayouts || []}
        />
    );
}
