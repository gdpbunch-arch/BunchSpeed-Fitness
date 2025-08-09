import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, day, data } = body; // e.g. data = { workout_done, meals_logged, protein_g, steps, sleep_hrs, weight_kg, notes }

    const { error } = await supabaseAdmin
      .from('logs')
      .upsert({ client_id: clientId, day, ...data }, { onConflict: 'client_id,day' });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
