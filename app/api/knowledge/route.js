import { createClient } from "@supabase/supabase-js";
import pdf from "pdf-parse";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ナレッジ一覧取得
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

      // PDF本文を抽出
      const parsed = await pdf(buffer);
      const extractedText = parsed.text;

      if (!extractedText.trim()) {
        return Response.json(
          { error: "PDFから本文を読み取れませんでした。" },
          { status: 400 }
        );
      }

      // Supabase Storageへ保存
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
          { error: `PDF保存に失敗しました: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // 抽出した本文をknowledgeへ保存
      const { data, error: insertError } = await supabase
        .from("knowledge")
        .insert([
          {
            title: title || file.name,
            category: category || "PDF",
            content: extractedText,
          },
        ])
        .select()
        .single();

      if (insertError) {
        return Response.json(
          { error: `ナレッジ保存に失敗しました: ${insertError.message}` },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: "PDFを登録しました。",
        knowledge: data,
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
    console.error(error);

    return Response.json(
      { error: `処理に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}
