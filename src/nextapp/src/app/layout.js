import "./globals.css";

export const metadata = {
  title: "펫로그 - 반려동물 건강 기록",
  description: "반려동물의 체중·음수량을 기록하고 월간 건강 리포트를 확인하세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
