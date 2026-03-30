'use client'

import { useState, useRef } from 'react'
import { AnalysisResult } from '@/types/analysis'
import DirectImpactSection from '@/components/DirectImpactSection'
import StatisticalViewSection from '@/components/StatisticalViewSection'
import PricingCheckSection from '@/components/PricingCheckSection'
import AssociationGameSection from '@/components/AssociationGameSection'
import LoadingAnimation from '@/components/LoadingAnimation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function Home() {
  const [url, setUrl] = useState('')
  const [directText, setDirectText] = useState('')
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = async () => {
    const input = inputMode === 'url' ? url.trim() : directText.trim()
    if (!input) return

    setIsLoading(true)
    setLoadingStep(0)
    setResult(null)
    setError(null)

    const stepTimer1 = setTimeout(() => setLoadingStep(1), 3000)
    const stepTimer2 = setTimeout(() => setLoadingStep(2), 7000)

    try {
      const body = inputMode === 'url'
        ? { url: input }
        : { text: input }

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        const message = data.detail || '分析に失敗しました'
        if (res.status === 429) {
          setError('AIのレート制限に達しました。1〜2分待ってから再度お試しください。（無料枠: 15回/分）')
        } else if (res.status === 422 && message.includes('ペイウォール')) {
          setError(message)
          setInputMode('text')
        } else {
          setError(message)
        }
        return
      }

      setResult(data)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError('通信エラーが発生しました。バックエンドサーバーが起動しているか確認してください。')
    } finally {
      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      handleAnalyze()
    }
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">📰</span>
          <div>
            <h1 className="text-lg font-bold text-slate-800">ニュース分析ツール</h1>
            <p className="text-xs text-slate-500">URLを貼るだけで株式市場への影響を4軸で分析</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 入力エリア */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          {/* モード切替 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode('url')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                inputMode === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔗 URLで分析
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                inputMode === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📝 テキストで分析
            </button>
          </div>

          {inputMode === 'url' ? (
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/news/..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAnalyze}
                disabled={!url.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                分析スタート
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
                placeholder="記事のテキストをここに貼り付けてください..."
                rows={6}
                className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={!directText.trim() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                分析スタート
              </button>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">
            対応メディア: 日経新聞・ロイター・Bloomberg・NHK・各社IRニュース等（ペイウォール記事はテキスト貼り付けモードをご利用ください）
          </p>
        </section>

        {/* ローディング */}
        {isLoading && <LoadingAnimation step={loadingStep} />}

        {/* エラー表示 */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">取得エラー</p>
                <p className="text-sm text-red-600">{error}</p>
                {inputMode === 'text' && (
                  <p className="text-xs text-red-500 mt-2">
                    テキスト直接入力モードに切り替えました。記事本文を貼り付けて再度お試しください。
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 分析結果 */}
        {result && !isLoading && (
          <div ref={resultRef} className="flex flex-col gap-5">
            {/* 記事サマリー */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📄</span>
                <span className="text-sm font-semibold opacity-90">記事サマリー</span>
                {result.articleSummary.media && (
                  <span className="ml-auto bg-white/20 text-xs px-2 py-0.5 rounded-full">
                    {result.articleSummary.media}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold mb-3 leading-snug">
                {result.articleSummary.title || '（タイトル不明）'}
              </h2>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-sm leading-relaxed opacity-95 whitespace-pre-line">
                  {result.articleSummary.summary}
                </p>
              </div>
            </section>

            <DirectImpactSection data={result.directImpact} />
            <StatisticalViewSection data={result.statisticalView} />
            <PricingCheckSection data={result.pricingCheck} />
            <AssociationGameSection data={result.associationGame} />

            {/* 免責事項 */}
            <footer className="bg-slate-100 rounded-2xl p-5 text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-600 mb-2">⚠️ 免責事項</p>
              <ul className="list-disc list-inside space-y-1">
                <li>本ツールの分析結果はAIによる推論であり、<strong>投資判断の根拠として使用しないでください</strong></li>
                <li>統計的視点・織り込み度の判定はAIの学習済み知識（知識カットオフ: 2025年初頭）に基づくものであり、実際の市場動向を保証するものではありません</li>
                <li>株式投資には元本割れのリスクがあります</li>
              </ul>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}
