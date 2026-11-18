import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { runIngestion } from '@/scripts/ingest-listings';

export async function POST(req) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { cities, categories, dryRun } = body;

        if (!cities || !Array.isArray(cities) || !categories || !Array.isArray(categories)) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendLog = (message) => {
                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'log', message }) + '\n'));
                };

                try {
                    const result = await runIngestion({
                        cities,
                        categories,
                        dryRun: !!dryRun,
                        onLog: sendLog
                    });
                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'done', result }) + '\n'));
                } catch (err) {
                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message: err.message }) + '\n'));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
