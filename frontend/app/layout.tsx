import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ニュース分析ツール | 株式市場への影響を4軸で分析',
  description: 'ニュース記事のURLを入力するだけで、株式市場への影響を直接的影響・統計的視点・織り込み度・連想ゲームの4軸で自動分析します。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  )
}
