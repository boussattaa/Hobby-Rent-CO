/**
 * Backfill Script: Apply Privacy Jitter to Existing Listings
 * 
 * This script:
 * 1. Fetches all items from the database
 * 2. For items WITH coordinates: applies a random 3-5 mile jitter
 * 3. For items WITHOUT coordinates: geocodes their location, then applies jitter
 * 
 * Run with: node --env-file=.env.local scripts/backfill-jitter.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Make sure .env.local is loaded.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Nominatim Geocoding (same as utils/geocoding.js)
async function geocodeLocation(location) {
    if (!location) return null;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'HobbyRent-Backfill/1.0'
                }
            }
        );
        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (e) {
        console.error(`Geocoding failed for "${location}":`, e.message);
    }
    return null;
}

// Apply 3-5 mile jitter
function applyJitter(lat, lng) {
    // 1 degree lat ~ 69 miles. 4 miles ~ 0.058 deg.
    // Random offset between -0.06 and +0.06 (roughly 4 miles)
    const jitter = () => (Math.random() - 0.5) * 0.12;
    return {
        lat: lat + jitter(),
        lng: lng + jitter()
    };
}

async function backfillJitter() {
    console.log('🚀 Starting backfill of privacy jitter...\n');

    // Fetch all items
    const { data: items, error } = await supabase
        .from('items')
        .select('id, name, location, lat, lng');

    if (error) {
        console.error('Failed to fetch items:', error.message);
        process.exit(1);
    }

    console.log(`Found ${items.length} items to process.\n`);

    let updated = 0;
    let geocoded = 0;
    let skipped = 0;

    for (const item of items) {
        let baseLat = item.lat;
        let baseLng = item.lng;

        // If no coords, try to geocode
        if (!baseLat || !baseLng) {
            if (item.location) {
                console.log(`  📍 Geocoding "${item.name}" (${item.location})...`);
                const coords = await geocodeLocation(item.location);
                if (coords) {
                    baseLat = coords.lat;
                    baseLng = coords.lng;
                    geocoded++;
                    // Rate limit Nominatim (1 req/sec)
                    await new Promise(r => setTimeout(r, 1100));
                } else {
                    console.log(`  ⚠️  Could not geocode "${item.name}". Skipping.`);
                    skipped++;
                    continue;
                }
            } else {
                console.log(`  ⚠️  No location for "${item.name}". Skipping.`);
                skipped++;
                continue;
            }
        }

        // Apply jitter
        const jittered = applyJitter(baseLat, baseLng);

        // Update database
        const { error: updateError } = await supabase
            .from('items')
            .update({ lat: jittered.lat, lng: jittered.lng })
            .eq('id', item.id);

        if (updateError) {
            console.error(`  ❌ Failed to update "${item.name}":`, updateError.message);
        } else {
            console.log(`  ✅ Updated "${item.name}" with jittered coords`);
            updated++;
        }
    }

    console.log('\n--- Summary ---');
    console.log(`✅ Updated: ${updated}`);
    console.log(`📍 Geocoded: ${geocoded}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log('\nDone! 🎉');
}

backfillJitter();
