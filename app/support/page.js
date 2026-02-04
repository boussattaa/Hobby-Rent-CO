import { createClient } from '@/utils/supabase/server';
import SupportClient from './SupportClient';

export default async function SupportPage() {
    const supabase = await createClient();

    // Fetch the first admin user
    const { data: admin } = await supabase
        .from('profiles')
        .select('id, first_name, email')
        .eq('is_admin', true)
        .limit(1)
        .single();

    return <SupportClient supportAgent={admin} />;
}
