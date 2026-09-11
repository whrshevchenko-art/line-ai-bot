import { createClient } from "@supabase/supabase-js";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

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
      // PDFをBuffer化
      // --------------------------
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ==================================================
      // Storage保存用ファイル名
      // ==================================================
      const fileName = `${Date.now()}_upload.pdf`;

      console.log("=================================");
      console.log("PDF処理開始");
      console.log("元ファイル名:", file.name);
      console.log("Storage保存名:", fileName);
      console.log("=================================");

      // ==================================================
      // ① Supabase StorageへPDF保存
      // ==================================================
      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("knowledge-files")
          .upload(fileName, buffer, {
            contentType: "application/pdf",
            upsert: false,
          });

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

      console.log("PDF Storage保存成功:", uploadData);

      // ==================================================
      // ② PDFから文字を抽出
      // ==================================================
      let pdf;

      try {
        pdf = await getDocumentProxy(
          new Uint8Array(buffer)
        );

        const result = await extractText(pdf, {
          mergePages: true,
        });

        const extractedText = result.text || "";

        console.log(
          "PDF文字抽出成功"
        );

        console.log(
          "ページ数:",
          result.totalPages
        );

        console.log(
          "文字数:",
          extractedText.length
        );

        // --------------------------
        // 文字が取れなかった場合
        // --------------------------
        if (!extractedText.trim()) {
          return Response.json(
            {
              error:
                "PDFは保存できましたが、文字を抽出できませんでした。画像PDFの可能性があります。",
              fileName,
            },
            {
              status: 400,
            }
          );
        }

        // ==================================================
        // ③ knowledgeテーブルへ保存
        // ==================================================
        const knowledgeTitle =
          typeof title === "string" && title.trim()
            ? title.trim()
            : file.name;

        const knowledgeCategory =
          typeof category === "string" && category.trim()
            ? category.trim()
            : "PDF";

        const { data: knowledgeData, error: knowledgeError } =
          await supabase
            .from("knowledge")
            .insert([
              {
                title: knowledgeTitle,
                category: knowledgeCategory,
                content: extractedText,
              },
            ])
            .select()
            .single();

        if (knowledgeError) {
          console.error(
            "knowledge保存エラー:",
            knowledgeError
          );

          return Response.json(
            {
              error:
                `PDFはStorageに保存できましたが、` +
                `ナレッジ登録に失敗しました: ${knowledgeError.message}`,
              fileName,
            },
            {
              status: 500,
            }
          );
        }

        console.log(
          "knowledge登録成功:",
          knowledgeData.id
        );

        // ==================================================
        // 完了
        // ==================================================
        return Response.json({
          success: true,
          message: "PDFをナレッジに登録しました。",
          fileName,
          knowledgeId: knowledgeData.id,
          totalPages: result.totalPages,
          textLength: extractedText.length,
        });

      } finally {
        if (pdf) {
          try {
            await pdf.destroy();
          } catch (error) {
            console.error(
              "PDF destroy error:",
              error
            );
          }
        }
      }
    }

    // ==================================================
    // 通常のナレッジ追加
    // ==================================================
    const body = await request.json();

    const { title, category, content } = body;

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
