"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "sales-quest-employee";

export default function SalesQuestStartPage() {
  const router = useRouter();

  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed?.id) {
          setEmployee(parsed);
        }
      }
    } catch {
      // localStorageの読み込み失敗時は何もしない
    }
  }, []);

  function handleStart() {
    if (!employee?.id) {
      router.push("/sales-quest");
      return;
    }

    router.push("/sales-quest");
  }

  function handleBack() {
    router.push("/sales-quest");
  }

  if (!employee) {
    return (
      <main className="startPage">
        <div className="loadingScreen">
          <div className="loadingIcon">⚔</div>
          <p>冒険者情報を読み込んでいます...</p>
        </div>

        <style jsx>{`
          .startPage {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 50% 20%,
                rgba(255, 196, 84, 0.12),
                transparent 35%
              ),
              linear-gradient(
                180deg,
                #0b1020 0%,
                #11182b 50%,
                #080c17 100%
              );
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loadingScreen {
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
          }

          .loadingIcon {
            font-size: 48px;
            margin-bottom: 18px;
            animation: pulse 1.4s ease-in-out infinite;
          }

          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.55;
            }

            50% {
              transform: scale(1.12);
              opacity: 1;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="startPage">
      <div className="backgroundGlow glowOne" />
      <div className="backgroundGlow glowTwo" />

      <div className="startContainer">
        <header className="topHeader">
          <button
            type="button"
            className="backButton"
            onClick={handleBack}
          >
            ← 冒険者選択へ
          </button>

          <div className="questLogo">
            <span>⚔</span>
            <strong>SALES QUEST</strong>
          </div>

          <div className="headerStage">
            STAGE <strong>01</strong>
          </div>
        </header>

        <section className="hero">
          <div className="stageBadge">
            <span className="badgeLine" />
            <span>STAGE 01</span>
            <span className="badgeLine" />
          </div>

          <h1>
            眠れる店舗の
            <br />
            <span>可能性を覚醒させろ</span>
          </h1>

          <p className="heroDescription">
            既存顧客へのGBPサポートから、
            <br />
            店舗の課題とGAPを見つけ出せ。
          </p>
        </section>

        <section className="questCard">
          <div className="questCardTop">
            <div>
              <span className="eyebrow">QUEST BRIEFING</span>
              <h2>今回の任務</h2>
            </div>

            <div className="difficulty">
              <span>難易度</span>
              <strong>★★☆☆☆</strong>
            </div>
          </div>

          <div className="divider" />

          <div className="questContent">
            <div className="targetPanel">
              <span className="panelLabel">TARGET</span>

              <div className="targetIcon">🏪</div>

              <div>
                <strong>店舗オーナー</strong>
                <p>既存POS顧客</p>
              </div>
            </div>

            <div className="objectivePanel">
              <span className="panelLabel">OBJECTIVE</span>

              <ul>
                <li>
                  <span>01</span>
                  GBPサポートを入口に会話を開始
                </li>
                <li>
                  <span>02</span>
                  店舗の現状と課題を引き出す
                </li>
                <li>
                  <span>03</span>
                  理想とのGAPを認識してもらう
                </li>
                <li>
                  <span>04</span>
                  HPについて詳しく聞きたい状態へ
                </li>
              </ul>
            </div>
          </div>

          <div className="skillPanel">
            <div>
              <span className="panelLabel">RECOMMENDED SKILLS</span>
              <div className="skills">
                <span>SPIN</span>
                <span>GAP</span>
                <span>ヒアリング</span>
                <span>課題発見</span>
              </div>
            </div>

            <div className="warning">
              <span>⚠</span>
              <p>
                いきなりHPを売るな。
                <br />
                まずは店舗の話を聞け。
              </p>
            </div>
          </div>
        </section>

        <section className="adventurerCard">
          <div className="avatar">
            {employee.name?.slice(0, 1) || "冒"}
          </div>

          <div className="adventurerInfo">
            <span>ADVENTURER</span>
            <strong>{employee.name}</strong>
            <p>
              {employee.department || "営業部"}
              {employee.office ? ` ・ ${employee.office}` : ""}
            </p>
          </div>

          <div className="level">
            <span>LEVEL</span>
            <strong>01</strong>
          </div>
        </section>

        <section className="startArea">
          <p className="startHint">
            準備はできたか？
          </p>

          <button
            type="button"
            className="startButton"
            onClick={handleStart}
          >
            <span className="buttonIcon">⚔</span>

            <span className="buttonText">
              <small>BEGIN THE QUEST</small>
              <strong>QUEST START</strong>
            </span>

            <span className="buttonArrow">→</span>
          </button>
        </section>

        <footer className="footer">
          <span>SALES QUEST</span>
          <span>・</span>
          <span>TRAINING SYSTEM</span>
        </footer>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .startPage {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 15%,
              rgba(255, 193, 72, 0.13),
              transparent 32%
            ),
            radial-gradient(
              circle at 10% 70%,
              rgba(83, 111, 255, 0.09),
              transparent 30%
            ),
            linear-gradient(
              180deg,
              #090d19 0%,
              #101729 48%,
              #070a12 100%
            );
          color: #f8fafc;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .startPage::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 85%
          );
        }

        .backgroundGlow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.18;
          pointer-events: none;
        }

        .glowOne {
          top: -250px;
          left: 50%;
          transform: translateX(-50%);
          background: #f59e0b;
        }

        .glowTwo {
          right: -300px;
          bottom: -200px;
          background: #3157d5;
        }

        .startContainer {
          position: relative;
          z-index: 1;
          width: min(1100px, calc(100% - 40px));
          margin: 0 auto;
          padding: 26px 0 40px;
        }

        .topHeader {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 20px;
          margin-bottom: 60px;
        }

        .backButton {
          justify-self: start;
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .backButton:hover {
          color: #fff;
          transform: translateX(-3px);
        }

        .questLogo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f8fafc;
          letter-spacing: 0.14em;
          font-size: 15px;
        }

        .questLogo span {
          color: #f6bd55;
          font-size: 22px;
        }

        .headerStage {
          justify-self: end;
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .headerStage strong {
          color: #f6bd55;
          margin-left: 6px;
        }

        .hero {
          text-align: center;
          margin-bottom: 46px;
        }

        .stageBadge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #f4bd57;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.28em;
        }

        .badgeLine {
          width: 42px;
          height: 1px;
          background: rgba(244, 189, 87, 0.45);
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 62px);
          line-height: 1.08;
          letter-spacing: -0.04em;
          font-weight: 800;
        }

        .hero h1 span {
          color: #f4bd57;
          text-shadow: 0 0 35px rgba(244, 189, 87, 0.12);
        }

        .heroDescription {
          margin: 22px 0 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 15px;
          line-height: 1.8;
        }

        .questCard {
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          background: rgba(15, 21, 37, 0.78);
          backdrop-filter: blur(18px);
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
          padding: 30px;
        }

        .questCardTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .eyebrow,
        .panelLabel {
          display: block;
          color: rgba(255, 255, 255, 0.36);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .questCardTop h2 {
          margin: 7px 0 0;
          font-size: 22px;
        }

        .difficulty {
          text-align: right;
        }

        .difficulty span {
          display: block;
          color: rgba(255, 255, 255, 0.36);
          font-size: 9px;
          letter-spacing: 0.15em;
          margin-bottom: 7px;
        }

        .difficulty strong {
          color: #f4bd57;
          letter-spacing: 4px;
          font-size: 13px;
        }

        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
          margin: 25px 0;
        }

        .questContent {
          display: grid;
          grid-template-columns: 0.8fr 1.5fr;
          gap: 28px;
        }

        .targetPanel {
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: 150px;
          padding: 22px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .targetIcon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          flex: 0 0 auto;
          border-radius: 16px;
          background: rgba(244, 189, 87, 0.1);
          border: 1px solid rgba(244, 189, 87, 0.22);
          font-size: 27px;
        }

        .targetPanel strong {
          display: block;
          font-size: 16px;
        }

        .targetPanel p {
          margin: 5px 0 0;
          color: rgba(255, 255, 255, 0.42);
          font-size: 12px;
        }

        .objectivePanel {
          padding: 4px 0;
        }

        .objectivePanel ul {
          list-style: none;
          padding: 0;
          margin: 13px 0 0;
          display: grid;
          gap: 9px;
        }

        .objectivePanel li {
          display: flex;
          align-items: center;
          gap: 13px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 13px;
        }

        .objectivePanel li span {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.045);
          color: #f4bd57;
          font-size: 9px;
          font-weight: 800;
        }

        .skillPanel {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 25px;
          margin-top: 28px;
          padding-top: 25px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .skills span {
          padding: 7px 11px;
          border-radius: 8px;
          background: rgba(244, 189, 87, 0.08);
          border: 1px solid rgba(244, 189, 87, 0.14);
          color: #f3c66f;
          font-size: 10px;
          font-weight: 700;
        }

        .warning {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 15px;
          border-radius: 10px;
          background: rgba(220, 160, 54, 0.07);
          border: 1px solid rgba(220, 160, 54, 0.1);
        }

        .warning > span {
          color: #f4bd57;
          font-size: 18px;
        }

        .warning p {
          margin: 0;
          color: rgba(255, 255, 255, 0.48);
          font-size: 10px;
          line-height: 1.6;
        }

        .adventurerCard {
          display: flex;
          align-items: center;
          gap: 15px;
          width: fit-content;
          min-width: 330px;
          margin: 25px auto 0;
          padding: 13px 18px 13px 13px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.035);
        }

        .avatar {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(
            145deg,
            #35435f,
            #182136
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f4bd57;
          font-size: 19px;
          font-weight: 800;
        }

        .adventurerInfo {
          min-width: 0;
        }

        .adventurerInfo span,
        .level span {
          display: block;
          color: rgba(255, 255, 255, 0.3);
          font-size: 8px;
          letter-spacing: 0.16em;
          font-weight: 800;
        }

        .adventurerInfo strong {
          display: block;
          margin-top: 3px;
          font-size: 14px;
        }

        .adventurerInfo p {
          margin: 2px 0 0;
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
        }

        .level {
          margin-left: auto;
          text-align: right;
          padding-left: 18px;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
        }

        .level strong {
          display: block;
          margin-top: 2px;
          color: #f4bd57;
          font-size: 18px;
        }

        .startArea {
          text-align: center;
          margin-top: 32px;
        }

        .startHint {
          margin: 0 0 13px;
          color: rgba(255, 255, 255, 0.32);
          font-size: 11px;
          letter-spacing: 0.08em;
        }

        .startButton {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          min-width: 310px;
          padding: 16px 22px;
          border: 1px solid rgba(244, 189, 87, 0.55);
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              rgba(244, 189, 87, 0.18),
              rgba(168, 105, 24, 0.08)
            );
          color: #fff;
          cursor: pointer;
          box-shadow:
            0 0 0 1px rgba(244, 189, 87, 0.05),
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 45px rgba(244, 189, 87, 0.06);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .startButton:hover {
          transform: translateY(-3px);
          border-color: rgba(244, 189, 87, 0.9);
          box-shadow:
            0 16px 45px rgba(0, 0, 0, 0.3),
            0 0 55px rgba(244, 189, 87, 0.13);
        }

        .startButton:active {
          transform: translateY(0);
        }

        .buttonIcon {
          color: #f4bd57;
          font-size: 25px;
        }

        .buttonText {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .buttonText small {
          color: rgba(255, 255, 255, 0.35);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .buttonText strong {
          margin-top: 3px;
          font-size: 18px;
          letter-spacing: 0.08em;
        }

        .buttonArrow {
          margin-left: auto;
          color: #f4bd57;
          font-size: 20px;
        }

        .footer {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 38px;
          color: rgba(255, 255, 255, 0.16);
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        @media (max-width: 760px) {
          .startContainer {
            width: min(100% - 24px, 600px);
            padding-top: 18px;
          }

          .topHeader {
            grid-template-columns: 1fr auto;
            margin-bottom: 42px;
          }

          .questLogo {
            justify-self: end;
          }

          .headerStage {
            display: none;
          }

          .hero {
            margin-bottom: 32px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .heroDescription {
            font-size: 13px;
          }

          .questCard {
            padding: 20px;
            border-radius: 16px;
          }

          .questContent {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .targetPanel {
            min-height: auto;
          }

          .skillPanel {
            align-items: stretch;
            flex-direction: column;
          }

          .warning {
            width: 100%;
          }

          .adventurerCard {
            width: 100%;
            min-width: 0;
          }

          .startButton {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </main>
  );
}
