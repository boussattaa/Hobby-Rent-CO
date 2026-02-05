import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap() {
    const supabase = await createClient()

    // Fetch high priority listings
    const { data: listings } = await supabase
        .from('items')
        .select('id, created_at')
        .limit(1000)

    const listingUrls = listings?.map((listing) => ({
        url: `https://www.hobbyrent.com/item/${listing.id}`,
        lastModified: new Date(listing.created_at), // Using created_at since updated_at might not exist or be commonly updated
        changeFrequency: 'weekly',
        priority: 0.8,
    })) || []

    return [
        {
            url: 'https://www.hobbyrent.com',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://www.hobbyrent.com/search',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: 'https://www.hobbyrent.com/list-your-gear',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        ...listingUrls,
    ]
}
