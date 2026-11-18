const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_OWNER_ID = '1a1115a8-9aaf-4545-9858-9abc7d44e481';

async function cleanup() {
    console.log(`Deleting all items owned by default ingestion account: ${DEFAULT_OWNER_ID}...`);
    const { count, error } = await supabase
        .from('items')
        .delete({ count: 'exact' })
        .eq('owner_id', DEFAULT_OWNER_ID);
        
    if (error) {
        console.error("Error during deletion:", error.message);
    } else {
        console.log(`Successfully deleted ${count} items.`);
    }
}

cleanup().then(() => process.exit(0));
