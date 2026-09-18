import "./globals.css";

export const metadata = {
  title: "営業クエスト",
  description: "営業力を鍛えるロールプレイ型クエスト",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
