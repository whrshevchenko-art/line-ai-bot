import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const STAGE = "stage_1";

export const SCORE_KEYS = [
  "problem_discovery",
  "numbers",
  "problem_awareness",
  "interest",
  "conversation_control",
];

export function supabase() {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません。"
    );
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function openai() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY が設定されていません。");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export function model() {
  return process.env.OPENAI_SALES_QUEST_MODEL || "gpt-4o-mini";
}

export function jsonFrom(text) {
  try {
    return JSON.parse(text);
  } catch {}

  const match = text.match(/{[\s\S]*}/);

  if (!match) {
    throw new Error("AIの応答をJSONとして読み取れませんでした。");
  }

  return JSON.parse(match[0]);
}

export async function askJson(messages) {
  const completion = await openai().chat.completions.create({
    model: model(),
    temperature: 0.55,
    response_format: {
      type: "json_object",
    },
    messages,
  });

  return jsonFrom(completion.choices[0]?.message?.content || "");
}

export function clamp(value, min = 0, max = 100) {
  const number = Number(value);

  return Math.max(
    min,
    Math.min(max, Number.isFinite(number) ? number : min)
  );
}

export function cleanState(value = {}) {
  return {
    interest: clamp(value.interest, 0, 100),
    trust: clamp(value.trust, 0, 100),
    problem_awareness: clamp(value.problem_awareness, 0, 100),
    gap_awareness: clamp(value.gap_awareness, 0, 100),
    urgency: clamp(value.urgency, 0, 100),
    resistance: clamp(value.resistance, 0, 100),
  };
}

/**
 * STAGE 1の顧客シナリオ
 *
 * 共通前提
 * - すでにPOSを導入している既存顧客
 * - Googleビジネスプロフィール（Googleマップ）は利用している
 * - ZoomではGBP支援を入口に会話が始まる
 * - 最終的にはホームページへの興味を持たせる
 *
 * 重要：
 * 「新規客が増えたら大変」という判断をAIに丸投げしない。
 * 業態・スタッフ数・現在の客数・目標客数などをもとに
 * 現実的なキャパシティを判断できる材料をシナリオ側に持たせる。
 */
export function scenario() {
  const choices = [
    {
      industry: "飲食店",

      business_size: "個人経営・18席",

      owner_type: "慎重で忙しい",

      main_problem: "平日の新規客が伸びない",

      hidden_problem: "Googleマップ経由の来店が少ない",

      monthly_new_customers: 30,

      desired_new_customers: 50,

      average_spend: 4500,

      current_solution: "Instagramを不定期に更新",

      decision_maker: true,

      pos_installed: true,

      gbp_usage:
        "Googleマップには登録している。基本情報や口コミは確認しているが、細かい数字まではあまり見ていない",

      homepage_status:
        "ホームページはあるが、数年前からほとんど更新していない",

      homepage_attitude:
        "Googleマップがある程度使えているなら、ホームページはそこまで重要ではないと思っている",

      capacity_context:
        "18席の個人店。店主を含めた少人数運営。平日の客数にはまだ余裕があるが、ピーク時間帯は忙しい。新規客が月に数名増える程度なら大きな負担にはなりにくい。一方で、月20名以上の増加となると曜日や時間帯によってはオペレーションへの影響を考える必要がある",

      capacity_notes:
        "新規客の増加数だけで負担を判断せず、席数・ピーク時間・スタッフ数・曜日別の混雑状況を考慮する",
    },

    {
      industry: "美容室",

      business_size: "スタッフ4名",

      owner_type: "数字重視",

      main_problem: "新規集客の広告費が高い",

      hidden_problem: "Google検索からホームページへの導線が弱い",

      monthly_new_customers: 42,

      desired_new_customers: 65,

      average_spend: 7800,

      current_solution: "ホットペッパー中心",

      decision_maker: true,

      pos_installed: true,

      gbp_usage:
        "口コミや基本情報は管理している。Googleマップ自体は問題なく利用している",

      homepage_status:
        "ホームページはあるが、情報が古く更新できていない",

      homepage_attitude:
        "予約はポータルサイトから来るので、ホームページの優先度は低いと思っている",

      capacity_context:
        "スタッフ4名の美容室。月間新規客42名。理想は65名で、差は23名。月3名程度の増加であれば、通常はスタッフ4名全体にとって大きな負担とは考えにくい。増加分が23名規模になる場合は、スタッフごとの予約枠・施術時間・現在の稼働率・曜日別の偏りなどを考慮する必要がある",

      capacity_notes:
        "スタッフ1人あたりの増加人数だけで負担を断定しない。美容室では施術時間や予約枠、現在の稼働率によってキャパシティが変わる",

      workload_reference: {
        small_increase: "月数名程度なら通常は大きな負担とは限らない",
        medium_increase: "月10名前後なら予約枠や稼働率を確認する",
        large_increase:
          "月20名以上ならスタッフ数だけでなく施術時間・予約枠・稼働率を確認する",
      },
    },

    {
      industry: "整体サロン",

      business_size: "1店舗・2名",

      owner_type: "既存業者への信頼が強い",

      main_problem: "予約の波が大きい",

      hidden_problem: "口コミが少なく比較で選ばれにくい",

      monthly_new_customers: 18,

      desired_new_customers: 35,

      average_spend: 6200,

      current_solution: "紹介と既存の広告会社",

      decision_maker: true,

      pos_installed: true,

      gbp_usage:
        "Googleマップは登録しているが、積極的には運用していない",

      homepage_status:
        "ホームページはあるが、数年前からほぼ更新していない",

      homepage_attitude:
        "紹介が多いので、ホームページはなくても何とかなると思っている",

      capacity_context:
        "2名で運営する整体サロン。月間新規18名。理想は35名で差は17名。新規客が月数名増える程度なら必ずしも大きな負担ではないが、施術時間や1日の予約枠によってキャパシティは変わる。増加分が大きい場合は、営業時間・予約枠・既存客とのバランスを考える必要がある",

      capacity_notes:
        "整体は施術時間によって1日の対応可能人数が大きく変わるため、新規客数だけで負担を判断しない",

      workload_reference: {
        small_increase: "月数名程度なら必ずしも大きな負担とは限らない",
        medium_increase: "月10名前後なら予約枠と施術時間を確認する",
        large_increase:
          "月20名近い増加なら既存客・施術時間・営業時間とのバランスを確認する",
      },
    },
  ];

  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * STAGE 1開始時の顧客心理
 *
 * resistanceは「警戒心」。
 * 初期値を高すぎる拒絶状態にすると、
 * 普通に会話しているだけなのにクソ客が完成するため35程度。
 */
export const initialState = {
  interest: 10,
  trust: 25,
  problem_awareness: 15,
  gap_awareness: 5,
  urgency: 10,
  resistance: 35,
};

export function firstCustomerMessage(customer) {
  return "こんにちは。本日はよろしくお願いします。";
}

export function publicSession(session) {
  return {
    id: session.id,
    stage: session.stage,
    status: session.status,
    customer: session.customer_scenario,
    startedAt: session.started_at,
  };
}

export function errorResponse(
  error,
  fallback = "処理に失敗しました。"
) {
  console.error("sales quest error:", error);

  return Response.json(
    {
      error: error?.message || fallback,
    },
    {
      status: 500,
    }
  );
}
