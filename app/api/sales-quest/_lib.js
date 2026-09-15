import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const STAGE = "stage_1";
export const SCORE_KEYS = ["problem_discovery", "numbers", "problem_awareness", "interest", "conversation_control"];

export function supabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません。");
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function openai() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY が設定されていません。");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function model() {
  return process.env.OPENAI_SALES_QUEST_MODEL || "gpt-4o-mini";
}

export function jsonFrom(text) {
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AIの応答をJSONとして読み取れませんでした。");
  return JSON.parse(match[0]);
}

export async function askJson(messages) {
  const completion = await openai().chat.completions.create({
    model: model(),
    temperature: 0.55,
    response_format: { type: "json_object" },
    messages,
  });
  return jsonFrom(completion.choices[0]?.message?.content || "");
}

export function clamp(value, min = 0, max = 100) {
  const number = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(number) ? number : min));
}

export function cleanState(value = {}) {
  return {
    interest: clamp(value.interest, 0, 100),
    trust: clamp(value.trust, 0, 100),
    problem_awareness: clamp(value.problem_awareness, 0, 100),
    urgency: clamp(value.urgency, 0, 100),
    resistance: clamp(value.resistance, 0, 100),
  };
}

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
      gbp_usage: "登録しているが、細かい数字まではあまり見ていない",
      homepage_status: "古いホームページがあるが、ほとんど更新していない",
      homepage_attitude: "Googleマップがあるならホームページはそこまで重要ではないと思っている",
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
      gbp_usage: "口コミや基本情報は管理している",
      homepage_status: "ホームページはあるが、情報が古く更新できていない",
      homepage_attitude: "予約はポータルサイトから来るので、ホームページの優先度は低いと思っている",
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
      gbp_usage: "Googleマップは登録しているが、積極的には運用していない",
      homepage_status: "ホームページはあるが、数年前からほぼ更新していない",
      homepage_attitude: "紹介が多いのでホームページはなくても何とかなると思っている",
    },
  ];

  return choices[Math.floor(Math.random() * choices.length)];
}

export const initialState = {
  interest: 10,
  trust: 25,
  problem_awareness: 15,
  urgency: 10,
  resistance: 35,
};

export function firstCustomerMessage(customer) {
  return "こんにちは。本日はよろしくお願いします。";
}

export function publicSession(session) {
  return { id: session.id, stage: session.stage, status: session.status, customer: session.customer_scenario, startedAt: session.started_at };
}

export function errorResponse(error, fallback = "処理に失敗しました。") {
  console.error("sales quest error:", error);
  return Response.json({ error: error?.message || fallback }, { status: 500 });
}
