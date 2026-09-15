import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("従業員取得エラー:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("従業員APIエラー:", error);

    return NextResponse.json(
      { error: error.message || "従業員取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const department = String(body.department || "").trim();
    const office = String(body.office || "").trim();
    const active = body.active !== false;
    const quest_enabled = body.quest_enabled !== false;

    if (!name) {
      return NextResponse.json(
        { error: "氏名を入力してください" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .insert({
        name,
        department,
        office,
        active,
        quest_enabled,
      })
      .select()
      .single();

    if (error) {
      console.error("従業員登録エラー:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("従業員登録APIエラー:", error);

    return NextResponse.json(
      { error: error.message || "従業員登録に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();

    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "従業員IDがありません" },
        { status: 400 }
      );
    }

    const updates = {};

    if (body.name !== undefined) {
      updates.name = String(body.name || "").trim();
    }

    if (body.department !== undefined) {
      updates.department = String(body.department || "").trim();
    }

    if (body.office !== undefined) {
      updates.office = String(body.office || "").trim();
    }

    if (body.active !== undefined) {
      updates.active = Boolean(body.active);
    }

    if (body.quest_enabled !== undefined) {
      updates.quest_enabled = Boolean(body.quest_enabled);
    }

    if (updates.name === "") {
      return NextResponse.json(
        { error: "氏名を空にはできません" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("従業員更新エラー:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("従業員更新APIエラー:", error);

    return NextResponse.json(
      { error: error.message || "従業員更新に失敗しました" },
      { status: 500 }
    );
  }
}
