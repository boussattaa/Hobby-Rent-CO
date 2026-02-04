import { createClient } from '@/utils/supabase/server';
import ItemClient from './ItemClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from('items').select('*').eq('id', id).single();

  if (!item) {
    return {
      title: 'Item Not Found | HobbyRent'
    }
  }

  // Fallback image if item has no image
  // Note: OG images should ideally be absolute URLs, but Next.js often handles relative. 
  // For best results, we might want to ensure it's absolute, but relative usually usually works if hosted on same domain.
  const ogImage = item.image_url || '/images/dirt-hero.png';

  return {
    title: `${item.name} | HobbyRent`,
    description: item.description,
    openGraph: {
      title: item.name,
      description: item.description,
      images: [ogImage],
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
      .select('id, first_name, is_verified')
      .eq('id', item.owner_id)
      .single();

    if (ownerProfile) {
      itemWithOwner = { ...item, profiles: ownerProfile };
    }
  }

  return <ItemClient id={id} initialItem={itemWithOwner} />;
}

