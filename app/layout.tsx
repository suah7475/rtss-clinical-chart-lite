import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://rtss-clinical-chart-lite.exact-lyric-8003.chatgpt.site'),
  title: 'RTSS Lite | 빠른 물리치료 회기 기록',
  description: '재활치료 명세체계 핵심 요소를 세 단계로 기록하는 물리치료 교육·파일럿 도구',
  openGraph: {
    title: 'RTSS Lite | 빠른 물리치료 회기 기록',
    description: '목표, 실제 치료, 반응과 다음 결정을 한 화면에서 기록하는 물리치료 교육·파일럿 도구',
    images: [{ url: '/og.png', width: 1600, height: 900, alt: 'RTSS Lite 임상기록 도구 소개' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RTSS Lite | 빠른 물리치료 회기 기록',
    description: '목표, 실제 치료, 반응과 다음 결정을 한 화면에서 기록하는 물리치료 교육·파일럿 도구',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
