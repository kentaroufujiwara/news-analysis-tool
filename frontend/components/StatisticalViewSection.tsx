import { StatisticalView } from '@/types/analysis'

const CONFIDENCE_STYLES = {
  '高': { bg: 'bg-green-100', text: 'text-green-700', label: '高 ●●●' },
  '中': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '中 ●●○' },
  '低': { bg: 'bg-slate-100', text: 'text-slate-600', label: '低 ●○○' },
}

export default function StatisticalViewSection({ data }: { data: StatisticalView }) {
  const confidence = CONFIDENCE_STYLES[data.confidence] || CONFIDENCE_STYLES['中']

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">📈</span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">② 統計的視点</h2>
          <p className="text-xs text-slate-500">過去に同様のニュースが出た際の市場反応傾向</p>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${confidence.bg} ${confidence.text}`}>
            信頼度: {confidence.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">過去の類似事例</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{data.similarCases}</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">📊 市場反応パターン</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{data.reactionPattern}</p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">⚠️ 今回の注意点</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{data.caveat}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4 flex items-start gap-1">
        <span>ℹ️</span>
        <span>統計的視点はAIの学習済み知識（知識カットオフ: 2025年初頭）をベースに生成しています。実際の市場動向を保証するものではありません。</span>
      </p>
    </section>
  )
}
