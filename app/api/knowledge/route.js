import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================
// ナレッジ一覧取得
// =========================
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("knowledge")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("ナレッジ取得エラー:", error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// ナレッジ追加
// =========================
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ==================================================
    // PDFアップロード
    // ==================================================
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const file = formData.get("file");
      const title = formData.get("title");
      const category = formData.get("category");

      // --------------------------
      // ファイル確認
      // --------------------------
      if (!file || typeof file === "string") {
        return Response.json(
          {
            error: "PDFファイルがありません。",
          },
          {
            status: 400,
          }
        );
      }

      // --------------------------
      // PDF確認
      // --------------------------
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return Response.json(
          {
            error: "PDFファイルのみアップロードできます。",
          },
          {
            status: 400,
          }
        );
      }

      // --------------------------
      // ファイルをBuffer化
      // --------------------------
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ==================================================
      // ファイル名は元の名前を一切使わない
      // ==================================================
      const fileName = `${Date.now()}_upload.pdf`;

      console.log("=================================");
      console.log("PDFアップロード開始");
      console.log("元ファイル名:", file.name);
      console.log("Storage保存名:", fileName);
      console.log("Bucket:", "knowledge-files");
      console.log("=================================");

      // ==================================================
      // Supabase Storageへ保存
      // ==================================================
      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("knowledge-files")
          .upload(fileName, buffer, {
            contentType: "application/pdf",
            upsert: false,
          });

      // --------------------------
      // Storageエラー
      // --------------------------
      if (uploadError) {
        console.error(
          "Supabase Storage upload error:",
          uploadError
        );

        return Response.json(
          {
            error: `PDF保存に失敗しました: ${uploadError.message}`,
          },
          {
            status: 500,
          }
        );
      }

      console.log(
        "PDFアップロード成功:",
        uploadData
      );

      // ==================================================
      // 現段階ではStorage保存だけ
      // ==================================================
      return Response.json({
        success: true,
        message: "PDFをStorageに保存しました。",
        fileName: fileName,
      });
    }

    // ==================================================
    // 通常のナレッジ追加
    // ==================================================
    const body = await request.json();

    const { title, category, content } = body;

    // --------------------------
    // 入力チェック
    // --------------------------
    if (!title || !category || !content) {
      return Response.json(
        {
          error: "タイトル・カテゴリ・本文は必須です。",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------
    // Supabaseへ保存
    // --------------------------
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
      console.error(
        "ナレッジ保存エラー:",
        error
      );

      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(data);

  } catch (error) {
    console.error(
      "knowledge API error:",
      error
    );

    return Response.json(
      {
        error: `処理に失敗しました: ${error.message}`,
      },
      {
        status: 500,
      }
    );
  }
}
