const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

// Image Map for different subcategories
const IMAGE_RESOURCES = {
    'Dirt Bikes': [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469037490074-453b68dd655b?auto=format&fit=crop&w=1200&q=80'
    ],
    '2-Seaters': [
        'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
    ],
    '4-Seaters': [
        'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80'
    ],
    'ATVs': [
        'https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80'
    ],
    'UTVs': [
        'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80'
    ],
    'Snowmobiles': [
        'https://images.unsplash.com/photo-1614093635634-11883be717cf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80'
    ],
    'Boats': [
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80'
    ],
    'Personal Watercraft (PWC)': [
        'https://images.unsplash.com/photo-1610448721566-47369c768e70?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80'
    ],
    'Non-Powered': [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1471086569966-db3eebc25a59?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'
    ],
    'default': [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80'
    ]
};

// Default Admin Owner ID for listings
const DEFAULT_OWNER_ID = '1a1115a8-9aaf-4545-9858-9abc7d44e481';

// Nominatim Geocoding function
async function geocodeAddress(address, cityName) {
    const query = address || cityName;
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'HobbyRent-IngestionAgent/1.0'
                }
            }
        );
        if (!response.ok) {
            throw new Error(`Nominatim error: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (e) {
        console.error(`Geocoding error for "${query}":`, e.message);
    }
    return null;
}

// Jitter coordinates to keep pins distinct and maintain location privacy (3-5 miles)
function applyJitter(lat, lng) {
    const jitter = () => (Math.random() - 0.5) * 0.06; // ~2-3 miles offset
    return {
        lat: lat + jitter(),
        lng: lng + jitter()
    };
}

// Helper to get image assets
function getImagesForSubcategory(subcategory, index = 0) {
    const list = IMAGE_RESOURCES[subcategory] || IMAGE_RESOURCES['default'];
    const primary = list[index % list.length];
    // Gather 2 additional images
    const additional = [];
    for (let i = 1; i <= 2; i++) {
        additional.push(list[(index + i) % list.length]);
    }
    return { primary, additional };
}

// Decode DuckDuckGo redirect link parameter
function decodeUddg(url) {
    try {
        const u = new URL(url);
        const uddg = u.searchParams.get('uddg');
        if (uddg) return decodeURIComponent(uddg);
    } catch(e) {}
    return null;
}

// Scrape fleet images from company domain
async function scrapeVehicleImages(domain, vehicleName, onLog = console.log) {
    onLog(`   🔍 Crawling images for: site:${domain} ${vehicleName}`);
    const query = encodeURIComponent(`site:${domain} ${vehicleName}`);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${query}`;
    
    const foundImages = [];
    try {
        const res = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error(`DDG search failed with status: ${res.status}`);
        const text = await res.text();
        
        const links = [];
        const regex = /href="([^"]*\/l\/\?uddg=[^"]*)"/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const decoded = decodeUddg('https:' + match[1]);
            if (decoded && decoded.includes(domain)) {
                links.push(decoded);
            }
        }
        
        const uniqueLinks = [...new Set(links)];
        
        if (uniqueLinks.length === 0) {
            uniqueLinks.push(`https://${domain}`);
        }
        
        for (const pageUrl of uniqueLinks.slice(0, 3)) {
            onLog(`   📥 Fetching: ${pageUrl}`);
            try {
                const pageRes = await fetch(pageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                if (!pageRes.ok) continue;
                const pageHtml = await pageRes.text();
                
                const imgRegex = /<img[^>]+src="([^"]+)"/g;
                let imgMatch;
                while ((imgMatch = imgRegex.exec(pageHtml)) !== null) {
                    let imgUrl = imgMatch[1];
                    if (imgUrl.startsWith('//')) {
                        imgUrl = 'https:' + imgUrl;
                    } else if (imgUrl.startsWith('/')) {
                        const parsedUrl = new URL(pageUrl);
                        imgUrl = parsedUrl.origin + imgUrl;
                    }
                    foundImages.push(imgUrl);
                }
            } catch (err) {
                // Ignore page fetch errors
            }
        }
    } catch (e) {
        onLog(`   ⚠️ Image crawl failed: ${e.message}`);
    }
    
    // Fallback: homepage link crawler
    if (foundImages.length === 0) {
        onLog(`   ⚠️ No images found via search. Direct crawling homepage link map...`);
        try {
            const homepageUrl = `https://${domain}`;
            const res = await fetch(homepageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (res.ok) {
                const html = await res.text();
                const links = [];
                const regex = /<a[^>]+href="([^"]+)"/g;
                let match;
                while ((match = regex.exec(html)) !== null) {
                    let link = match[1];
                    if (link.startsWith('//')) {
                        link = 'https:' + link;
                    } else if (link.startsWith('/')) {
                        link = homepageUrl + link;
                    }
                    if (link.includes(domain)) {
                        links.push(link);
                    }
                }
                const matchedLinks = [...new Set(links)].filter(link => {
                    const lower = link.toLowerCase();
                    return ['rent', 'fleet', 'polaris', 'rzr', 'utv', 'atv', 'offroad', 'boat', 'water'].some(kw => lower.includes(kw));
                });
                
                for (const pageUrl of matchedLinks.slice(0, 2)) {
                    onLog(`   📥 Fetching link: ${pageUrl}`);
                    const pageRes = await fetch(pageUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    });
                    if (!pageRes.ok) continue;
                    const pageHtml = await pageRes.text();
                    const imgRegex = /<img[^>]+src="([^"]+)"/g;
                    let imgMatch;
                    while ((imgMatch = imgRegex.exec(pageHtml)) !== null) {
                        let imgUrl = imgMatch[1];
                        if (imgUrl.startsWith('//')) {
                            imgUrl = 'https:' + imgUrl;
                        } else if (imgUrl.startsWith('/')) {
                            const parsedUrl = new URL(pageUrl);
                            imgUrl = parsedUrl.origin + imgUrl;
                        }
                        foundImages.push(imgUrl);
                    }
                }
            }
        } catch (e) {
            onLog(`   ⚠️ Direct homepage crawl failed: ${e.message}`);
        }
    }
    
    const uniqueImages = [...new Set(foundImages)];
    
    // Filter out UI / layout images
    const filtered = uniqueImages.filter(url => {
        const lower = url.toLowerCase();
        if (lower.includes('logo') || lower.includes('icon') || lower.includes('header') || lower.includes('footer') || lower.includes('social') || lower.includes('pixel') || lower.includes('button') || lower.includes('arrow') || lower.includes('avatar') || lower.includes('nav')) {
            return false;
        }
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.includes('.jpg?') || lower.includes('.jpeg?') || lower.includes('.png?') || lower.includes('.webp?');
    });
    
    // Rank images by relevance matching words in the vehicle's name
    const vehicleWords = vehicleName.toLowerCase().split(' ');
    const ranked = filtered.map(url => {
        const lowerUrl = url.toLowerCase();
        let score = 0;
        for (const word of vehicleWords) {
            if (word.length > 2 && lowerUrl.includes(word)) score += 10;
        }
        if (lowerUrl.includes('opt') || lowerUrl.includes('large') || lowerUrl.includes('hero') || lowerUrl.includes('slider') || lowerUrl.includes('gallery')) {
            score += 5;
        }
        return { url, score };
    }).sort((a, b) => b.score - a.score);
    
    return ranked.map(item => item.url);
}

// Download image binary and upload to Supabase Storage
async function downloadAndUploadImage(imageUrl, supabase, onLog = console.log) {
    try {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const buffer = await res.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        
        const extension = contentType.split('/')[1] || 'jpg';
        const filePath = `imported/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
        
        const { error } = await supabase.storage
            .from('items')
            .upload(filePath, fileBuffer, {
                contentType,
                upsert: true
            });
            
        if (error) throw error;
        
        const { data: publicUrlData } = supabase.storage
            .from('items')
            .getPublicUrl(filePath);
            
        return publicUrlData.publicUrl;
    } catch (err) {
        onLog(`   ⚠️ Failed to upload image "${imageUrl}": ${err.message}`);
        return null;
    }
}

// Ingestion Pipeline Function
async function runIngestion({ cities, categories, dryRun = false, onLog = console.log }) {
    onLog(`🤖 Starting Powersports Ingestion Agent (Dry Run: ${dryRun})`);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
        onLog('❌ ERROR: Missing Supabase credentials in environment.');
        return { success: false, error: 'Missing Supabase credentials' };
    }

    if (!openaiKey) {
        onLog('❌ ERROR: Missing OpenAI API Key in environment.');
        return { success: false, error: 'Missing OpenAI API Key' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    const stats = {
        processed: 0,
        imported: 0,
        skipped: 0,
        failed: 0
    };

    for (const city of cities) {
        for (const category of categories) {
            onLog(`\n🏙️  Processing: ${city} | Category: ${category}`);

            // 1. Get LLM recommendation for actual major rental companies and their inventory
            onLog(`   🧠 Consulting OpenAI to identify real powersports rental companies in ${city}...`);
            let listings = [];
            try {
                const systemPrompt = `You are a powersports marketplace ingestion assistant.
Your goal is to identify real major powersports rental companies in the requested city and category.
Generate 2 realistic powersports items they rent out. 
Return ONLY a valid JSON array of objects. Do not include markdown code block formatting or explanation.

Each object in the array MUST contain:
- company_name: Name of the rental company (e.g. "Moab Adventure Center")
- website_domain: Real website domain of the rental company (e.g. "moabadventurecenter.com")
- name: Compelling item title (e.g. "2023 Polaris RZR XP 4 1000")
- price: Numeric daily rental cost (e.g. 290)
- description: A detailed, engaging 2-3 sentence rental description.
- category: The category (must be exactly "${category}")
- subcategory: Must be one of:
  - If category is "offroad": "Dirt Bikes", "2-Seaters", "4-Seaters", "ATVs", "UTVs", "Snowmobiles"
  - If category is "water": "Boats", "Personal Watercraft (PWC)", "Non-Powered"
- year: Integer (e.g. 2023)
- make: String (e.g. "Polaris")
- model: String (e.g. "RZR XP")
- specs: Object containing key-value strings of specs (e.g. {"Engine": "999cc", "Fuel Type": "Gasoline"})
- features: Array of strings (e.g. ["4WD", "Helmets Included", "Bluetooth"])
- rules: String (e.g. "Must be 21+ with valid driver's license.")
- street_address: Estimated real street address of the company in that city (e.g. "225 S Main St, Moab, UT")
`;

                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `List major powersports rentals for category "${category}" in "${city}".` }
                    ],
                    response_format: { type: "json_object" }
                });

                const rawJson = completion.choices[0].message.content.trim();
                const parsed = JSON.parse(rawJson);
                // The AI might nest it under a root key like "listings" or return direct array
                listings = Array.isArray(parsed) ? parsed : (parsed.listings || Object.values(parsed)[0] || []);
                
                if (!Array.isArray(listings)) {
                    onLog(`   ⚠️ Failed to parse OpenAI listings format. Skipping. Raw response: ${rawJson.substring(0, 100)}`);
                    continue;
                }

                onLog(`   ✅ Found ${listings.length} items to import.`);
            } catch (e) {
                onLog(`   ❌ OpenAI or JSON Parsing failed: ${e.message}`);
                continue;
            }

            // 2. Process each listing
            for (let i = 0; i < listings.length; i++) {
                const item = listings[i];
                stats.processed++;

                try {
                    // Check duplicate
                    const { data: existing } = await supabase
                        .from('items')
                        .select('id')
                        .eq('name', item.name)
                        .eq('location', city)
                        .limit(1);

                    if (existing && existing.length > 0) {
                        onLog(`   ⏩ Skipping duplicate listing: "${item.name}"`);
                        stats.skipped++;
                        continue;
                    }

                    onLog(`   📍 Geocoding address for "${item.company_name}" ("${item.street_address || city}")...`);
                    let coords = await geocodeAddress(item.street_address, city);
                    
                    if (!coords) {
                        onLog(`   ⚠️ Could not geocode address, falling back to city center: "${city}"`);
                        coords = await geocodeAddress(null, city);
                    }

                    if (!coords) {
                        onLog(`   ❌ Could not geocode city center. Skipping "${item.name}".`);
                        stats.failed++;
                        continue;
                    }

                    // Apply jitter for privacy/visual dispersion
                    const jitteredCoords = applyJitter(coords.lat, coords.lng);

                    // Discover and upload actual images
                    let primaryImage = null;
                    let additionalImages = [];

                    if (item.website_domain) {
                        onLog(`   🔎 Discovering actual fleet images for "${item.name}"...`);
                        const scrapedImages = await scrapeVehicleImages(item.website_domain, `${item.make} ${item.model}`, onLog);
                        
                        if (scrapedImages.length > 0) {
                            onLog(`   📸 Scraped ${scrapedImages.length} actual image URLs. Uploading to Supabase Storage...`);
                            if (!dryRun) {
                                primaryImage = await downloadAndUploadImage(scrapedImages[0], supabase, onLog);
                            } else {
                                primaryImage = scrapedImages[0];
                            }
                            
                            // Upload additional images (up to 2 more)
                            for (let j = 1; j < Math.min(scrapedImages.length, 3); j++) {
                                if (!dryRun) {
                                    const uploaded = await downloadAndUploadImage(scrapedImages[j], supabase, onLog);
                                    if (uploaded) additionalImages.push(uploaded);
                                } else {
                                    additionalImages.push(scrapedImages[j]);
                                }
                            }
                        }
                    }

                    // Fallback to Unsplash if no images were scraped/uploaded
                    if (!primaryImage) {
                        onLog(`   ⚠️ No actual images scraped. Falling back to category-based Unsplash images.`);
                        const images = getImagesForSubcategory(item.subcategory, stats.imported);
                        primaryImage = images.primary;
                        additionalImages = images.additional;
                    }

                    const dbItem = {
                        name: item.name,
                        price: item.price,
                        image_url: primaryImage,
                        additional_images: additionalImages,
                        location: city,
                        lat: jitteredCoords.lat,
                        lng: jitteredCoords.lng,
                        category: item.category.toLowerCase(),
                        subcategory: item.subcategory,
                        description: `${item.description} Managed by ${item.company_name}.`,
                        owner_id: DEFAULT_OWNER_ID,
                        year: item.year,
                        make: item.make,
                        model: item.model,
                        specs: item.specs || {},
                        rules: item.rules || '',
                        features: item.features || [],
                        instant_book: true // Auto-set true for company imports to drive conversions
                    };

                    if (dryRun) {
                        onLog(`   🧪 [DRY RUN] Would import: "${dbItem.name}" in ${city} for $${dbItem.price}/day. Lat: ${dbItem.lat}, Lng: ${dbItem.lng}`);
                        stats.imported++;
                    } else {
                        const { error: insertErr } = await supabase
                            .from('items')
                            .insert(dbItem);

                        if (insertErr) {
                            onLog(`   ❌ Failed to insert "${item.name}": ${insertErr.message}`);
                            stats.failed++;
                        } else {
                            onLog(`   ✅ Successfully imported: "${dbItem.name}" ($${dbItem.price}/day)`);
                            stats.imported++;
                        }
                    }

                    // Nominatim friendly spacing
                    await new Promise(resolve => setTimeout(resolve, 1100));

                } catch (err) {
                    onLog(`   ❌ Failed to process listing "${item.name}": ${err.message}`);
                    stats.failed++;
                }
            }
        }
    }

    onLog(`\n🎉 Ingestion Finished!`);
    onLog(`   Total Processed: ${stats.processed}`);
    onLog(`   Imported: ${stats.imported}`);
    onLog(`   Duplicates Skipped: ${stats.skipped}`);
    onLog(`   Failed: ${stats.failed}`);

    return { success: true, stats };
}

// Module execution check (run from terminal)
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    // Default config for CLI run
    const cities = [
        'Moab, UT',
        'Las Vegas, NV',
        'Miami, FL',
        'Lake Havasu, AZ',
        'Denver, CO',
        'Salt Lake City, UT',
        'San Diego, CA',
        'Tahoe City, CA',
        'Key West, FL',
        'Page, AZ',
        'Jackson Hole, WY',
        'Destin, FL',
        'Brainerd, MN',
        'Phoenix, AZ',
        'Scottsdale, AZ',
        'Orlando, FL',
        'Fort Lauderdale, FL',
        'Tampa, FL',
        'Anchorage, AK'
    ];
    const categories = ['offroad', 'water'];

    runIngestion({ cities, categories, dryRun })
        .then(() => process.exit(0))
        .catch(e => {
            console.error('Fatal CLI Error:', e);
            process.exit(1);
        });
}

module.exports = { runIngestion };
