import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import PublicProfileClient from './PublicProfileClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', params.id)
        .single();

    return {
        title: profile ? `${profile.first_name}'s Profile | HobbyRent` : 'User Profile | HobbyRent',
        description: profile ? `View ${profile.first_name}'s listings and profile on HobbyRent` : 'User profile on HobbyRent'
    };
}

export default async function PublicProfilePage({ params }) {
    const { id } = await params;
    const supabase = await createClient();

    console.log('Looking for profile with ID:', id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, is_verified, avatar_url')
        .eq('id', id)
        .single();

    console.log('Profile query result:', { profile, profileError, id });

    if (profileError || !profile) {
        console.error('Profile not found:', profileError);
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>User Not Found</h1>
                <p>This profile doesn't exist or has been removed.</p>
                <Link href="/">← Back to Home</Link>
            </div>
        );
    }

    // Get user's listings
    const { data: listings } = await supabase
        .from('items')
        .select('id, name, daily_rate, images, category')
        .eq('owner_id', id)
        .order('created_at', { ascending: false });

    const displayName = profile.first_name
        ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name.charAt(0) + '.' : ''}`
        : 'HobbyRent User';

    return (
        <PublicProfileClient
            profile={profile}
            listings={listings || []}
            displayName={displayName}
        />
    );
}
