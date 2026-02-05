import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import PublicProfileClient from './PublicProfileClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', id)
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
        .select('id, first_name, last_name, is_verified, bio, social_links, created_at, id_verified_status')
        .eq('id', id)
        .single();

    if (profileError || !profile) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>User Not Found</h1>
                <p>This profile doesn't exist or has been removed.</p>
                <Link href="/">← Back to Home</Link>
            </div>
        );
    }

    // Get user's listings
    const { data: listingsData, error: listingsError } = await supabase
        .from('items')
        .select('id, name, price, image_url, category')
        .eq('owner_id', id)
        .order('created_at', { ascending: false });

    // Map image_url to images array for compatibility
    const listings = listingsData?.map(item => ({
        ...item,
        images: item.image_url ? [item.image_url] : []
    })) || [];

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
