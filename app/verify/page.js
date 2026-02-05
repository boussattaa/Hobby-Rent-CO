import { createClient } from '@/utils/supabase/server';
import VerifyClient from './VerifyClient';

export default async function VerifyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch verification status
    let isVerified = false;
    let status = 'unverified';

    if (user) {
        const { data } = await supabase.from('profiles').select('is_verified, id_verified_status').eq('id', user.id).single();
        if (data) {
            isVerified = data.is_verified;
            status = data.id_verified_status || 'unverified';
        }
    }

    return <VerifyClient isVerified={isVerified} status={status} />;
}
