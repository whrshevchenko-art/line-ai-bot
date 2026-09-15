import { STAGE, initialState, scenario, firstCustomerMessage, supabase, publicSession, errorResponse } from "../_lib";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { userId = "anonymous" } = await request.json().catch(() => ({}));
    const db = supabase();
    const customer = scenario();
    const { data: session, error } = await db.from("sales_sessions").insert({
      user_id: userId,
      stage: STAGE,
      status: "in_progress",
      customer_scenario: customer,
      customer_state: initialState,
    }).select().single();
    if (error) throw error;

    const opening = firstCustomerMessage(customer);
    const { error: messageError } = await db.from("sales_messages").insert({
      session_id: session.id, role: "assistant", content: opening,
    });
    if (messageError) throw messageError;

    const { data: stats } = await db.from("user_sales_stats").select("*").eq("user_id", userId).maybeSingle();
    return Response.json({ session: publicSession(session), opening, stats: stats || { level: 1, exp: 0, total_quests: 0, completed_quests: 0, average_score: 0, best_score: 0 } });
  } catch (error) { return errorResponse(error); }
}
