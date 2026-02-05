const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log('Checking messages table structure...');

    // Try to select one row with raw * to see keys
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting from messages:', error);
    } else {
        // If table is empty, we can't see keys from data[0], but at least we know query worked.
        // If data has length, we print keys.
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table exists but is empty. Trying to insert dry run to fail on column?');
            // We can't easily check columns if empty without admin rights or inspector.
            // But we can try to select specific columns and see if it errors.
        }
    }

    // Probe for booking_id
    const { error: bookingError } = await supabase.from('messages').select('booking_id').limit(1);
    console.log('Probing booking_id:', bookingError ? 'MISSING/ERROR' : 'EXISTS');

    // Probe for rental_id
    const { error: rentalError } = await supabase.from('messages').select('rental_id').limit(1);
    console.log('Probing rental_id:', rentalError ? 'MISSING/ERROR' : 'EXISTS');
}

checkSchema();
