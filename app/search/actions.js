'use server';

import { geocodeLocation } from '@/utils/geocoding';

export async function geocode(query) {
    return await geocodeLocation(query);
}
