import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("knowledge")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { title, category, content } = body;

    if (!title || !category || !content) {
      return Response.json(
        { error: "タイトル・カテゴリ・本文は必須です。" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("knowledge")
      .insert([
        {
          title,
          category,
          content,
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);

  } catch (error) {
    return Response.json(
      { error: "保存に失敗しました。" },
      { status: 500 }
    );
  }
}
