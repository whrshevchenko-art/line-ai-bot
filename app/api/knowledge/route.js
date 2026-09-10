import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ナレッジ一覧取得
export async function GET() {
  try {
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
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ナレッジ追加
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // =========================
    // PDFアップロード
    // =========================
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const file = formData.get("file");
      const title = formData.get("title");
      const category = formData.get("category");

      if (!file || typeof file === "string") {
        return Response.json(
          { error: "PDFファイルがありません。" },
          { status: 400 }
        );
      }

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return Response.json(
          { error: "PDFファイルのみアップロードできます。" },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // =========================
      // Supabase Storageへ保存
      // =========================
      const fileName =
        `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { error: uploadError } = await supabase.storage
        .from("knowledge-files")
        .upload(fileName, buffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        return Response.json(
          {
            error: `PDF保存に失敗しました: ${uploadError.message}`,
          },
          { status: 500 }
        );
      }

      // =========================
      // まずはStorage登録成功だけ確認
      // =========================
      return Response.json({
        success: true,
        message: "PDFをStorageに保存しました。",
        fileName,
      });
    }

    // =========================
    // 通常のナレッジ追加
    // =========================
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
    console.error("knowledge API error:", error);

    return Response.json(
      {
        error: `処理に失敗しました: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
