const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load env from .env.local via --env-file flag
// dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkItems() {
    console.log('Fetching all items to check locations...');
    const { data, error } = await supabase
        .from('items')
        .select('id, name, location, latitude, longitude');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} items:`);
    data.forEach(item => {
        console.log(`- [${item.name}] Location: "${item.location}", Lat: ${item.latitude}, Lng: ${item.longitude}`);
    });
}

checkItems();
