const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/)[1];
const supabase = createClient(url, key);

const OWNER_ID = '3c24581c-ec78-4f56-bd01-5d8798568d9c'; // Verified existing owner

const itemsToSeed = [
  // Trailers
  {
    owner_id: OWNER_ID,
    name: '2024 Big Tex 70CH Car Hauler 20ft',
    description: 'Heavy-duty 20ft tandem-axle car hauler trailer with electric brakes, slide-in ramps, and 7,000 lb GVWR. Ideal for hauling vehicles, ATVs, UTVs, and project cars. Includes spare tire and heavy-duty D-ring tie-down anchors.',
    price: 120,
    category: 'trailers',
    subcategory: 'Car Hauler',
    location: 'Moab, UT',
    lat: 38.5738,
    lng: -109.5498,
    image_url: '/images/car-hauler.png',
    price_type: 'daily',
    min_duration: 1,
    instant_book: true
  },
  {
    owner_id: OWNER_ID,
    name: '2023 Iron Bull 14ft Hydraulic Dump Trailer',
    description: '14ft heavy-duty hydraulic dump trailer with 14,000 lb GVWR, dual hoist cylinders, and integrated roll tarp. Perfect for landscaping, roofing, gravel hauling, and construction debris. 2-5/16" ball hitch required.',
    price: 150,
    category: 'trailers',
    subcategory: 'Dump Trailers',
    location: 'Meridian, ID',
    lat: 43.6121,
    lng: -116.3915,
    image_url: '/images/dump-trailer.png',
    price_type: 'daily',
    min_duration: 1,
    instant_book: false
  },
  {
    owner_id: OWNER_ID,
    name: '2023 Continental Cargo 16ft Enclosed Trailer',
    description: '16ft tandem axle enclosed cargo trailer with spring-assisted rear ramp door and side RV-style lockable door. Clean, weather-tight interior with dual E-track tie-down rows. Great for moves, equipment transport, and event staging.',
    price: 95,
    category: 'trailers',
    subcategory: 'Enclosed Trailers',
    location: 'Las Vegas, NV',
    lat: 36.1716,
    lng: -115.1391,
    image_url: '/images/enclosed-trailer.png',
    price_type: 'daily',
    min_duration: 1,
    instant_book: true
  },
  {
    owner_id: OWNER_ID,
    name: '2024 PJ Trailers 22ft Flatbed Equipment Trailer',
    description: '22ft equipment flatbed trailer with drive-over fenders and heavy-duty spring-assisted flip-up knee ramps. 10,000 lb payload capacity designed for tractors, compact excavators, skid steers, and building materials.',
    price: 110,
    category: 'trailers',
    subcategory: 'Flatbed Trailers',
    location: 'Miami, FL',
    lat: 25.7617,
    lng: -80.1918,
    image_url: '/images/flatbed-trailer.png',
    price_type: 'daily',
    min_duration: 1,
    instant_book: false
  },

  // Tools & Equipment
  {
    owner_id: OWNER_ID,
    name: 'Bobcat S650 Skid Steer Loader',
    description: 'Powerful 74hp vertical lift path skid-steer loader. Features enclosed cab with A/C, high-flow auxiliary hydraulics, standard dirt bucket, and 2,690 lb rated operating capacity. Perfect for grading, earthmoving, material handling, and site prep.',
    price: 295,
    category: 'tools',
    subcategory: 'Heavy Machinery',
    location: 'Meridian, ID',
    lat: 43.6121,
    lng: -116.3915,
    image_url: '/images/dumpster-bin.png',
    price_type: 'daily',
    min_duration: 1,
    instant_book: false
  },
  {
    owner_id: OWNER_ID,
    name: 'DeWalt 20V MAX XR Brushless Hammer Drill & Driver Kit',
    description: 'Professional-grade 20V brushless 3-speed hammer drill kit. Includes two 5Ah XR lithium-ion batteries, high-speed fan-cooled charger, 1/2" metal ratcheting chuck, and heavy-duty contractor carrying bag.',
    price: 35,
    category: 'tools',
    subcategory: 'Power Tools',
    location: 'Moab, UT',
    lat: 38.5738,
    lng: -109.5498,
    image_url: '/images/dewalt-drill.png',
    price_type: 'daily',
    min_duration: 1,
    instant_book: true
  },
  {
    owner_id: OWNER_ID,
    name: 'Bissell BigGreen Commercial Carpet Cleaner Machine',
    description: 'Commercial-grade deep carpet cleaning extractor. Features 8-row rotating DirtLifter powerbrush, large-capacity dual tanks for clean and dirty water, 9ft hose, and 6" tough stain hand tool. Restores high-traffic carpet.',
    price: 45,
    category: 'tools',
    subcategory: 'Cleaning Equipment',
    location: 'Las Vegas, NV',
    lat: 36.1716,
    lng: -115.1391,
    image_url: '/images/carpet-cleaner.png',
    price_type: 'daily',
    min_duration: 1,
    instant_book: true
  },
  {
    owner_id: OWNER_ID,
    name: 'Heavy Duty 15-Yard Roll-Off Dumpster Bin',
    description: '15-yard roll-off residential dumpster bin rental. Includes drop-off, 3-day on-site rental period, pickup, and up to 2 tons of waste disposal. Low-profile sides with rear swinging barn doors for easy walk-in loading.',
    price: 185,
    category: 'tools',
    subcategory: 'Disposal & Dumpsters',
    location: 'Lake Havasu, AZ',
    lat: 34.4839,
    lng: -114.3224,
    image_url: '/images/dumpster-bin.png',
    price_type: 'daily',
    min_duration: 3,
    instant_book: false
  }
];

async function seed() {
  console.log(`Checking existing items before seed...`);
  const { data: existing, error: fetchErr } = await supabase.from('items').select('name');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }
  const existingNames = new Set(existing.map(e => e.name));

  const toInsert = itemsToSeed.filter(item => !existingNames.has(item.name));
  if (toInsert.length === 0) {
    console.log('All seed items already exist in database!');
    return;
  }

  console.log(`Inserting ${toInsert.length} new items into Supabase...`);
  const { data, error } = await supabase.from('items').insert(toInsert).select();
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log(`Successfully seeded ${data.length} items:`);
    data.forEach(item => {
      console.log(`- [${item.category}] ${item.name} ($${item.price}/day) | ID: ${item.id}`);
    });
  }
}

seed().catch(console.error);
