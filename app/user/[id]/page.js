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
        .select('id, first_name, last_name, is_verified')
        .eq('id', id)
        .single();

    console.log('Profile query result:', { profile, profileError, id });

    if (profileError || !profile) {
        console.error('Profile not found:', profileError);
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>User Not Found</h1>
                <p>This profile doesn't exist or has been removed.</p>
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1rem' }}>
                    Debug: Looking for ID: {id || 'undefined'}
                </p>
                <Link href="/">← Back to Home</Link>
            </div>
        );
    }

    // Get user's listings
    const { data: listings, error: listingsError } = await supabase
        .from('items')
        .select('id, name, price, images, category')
        .eq('owner_id', id)
        .order('created_at', { ascending: false });

    console.log('Listings query result:', {
        count: listings?.length,
        listingsError: JSON.stringify(listingsError, null, 2),
        ownerId: id
    });

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
