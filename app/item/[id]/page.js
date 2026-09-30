import { createClient } from '@/utils/supabase/server';
import ItemClient from './ItemClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from('items').select('*').eq('id', id).single();

  if (!item) {
    return {
      title: 'Item Not Found | HobbyRent',
    };
  }

  const formattedPrice = `$${item.price}/day`;
  const metaDescription = item.description
    ? (item.description.length > 160 ? item.description.slice(0, 157) + '...' : item.description)
    : `Rent ${item.name} on HobbyRent for ${formattedPrice}. Verified owners, easy booking, secure payment.`;

  const ogImage = item.image_url?.startsWith('http')
    ? item.image_url
    : `https://www.hobbyrent.com${item.image_url || '/images/og-main.jpg'}`;

  const canonicalUrl = `https://www.hobbyrent.com/item/${id}`;
  const pageTitle = `${item.name} - ${formattedPrice} | HobbyRent`;

  return {
    title: pageTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'HobbyRent',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: item.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription,
      images: [ogImage],
    },
    other: {
      'product:price:amount': item.price.toString(),
      'product:price:currency': 'USD',
    },
  };
}

export default async function ItemPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch item first
  const { data: item, error } = await supabase.from('items').select('*').eq('id', id).single();

  // If item exists, fetch owner profile separately
  let itemWithOwner = item;
  if (item && item.owner_id) {
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('id, first_name, is_verified, email')
      .eq('id', item.owner_id)
      .single();

    if (ownerProfile) {
      itemWithOwner = { ...item, profiles: ownerProfile };
    }
  }

  // Fetch similar items (same category, different ID)
  let similarItems = [];
  if (item) {
    const { data: similar } = await supabase
      .from('items')
      .select('id, name, price, image_url, location')
      .eq('category', item.category)
      .neq('id', item.id)
      .limit(4);

    similarItems = similar || [];
  }

  return <ItemClient id={id} initialItem={itemWithOwner} similarItems={similarItems} />;
}

