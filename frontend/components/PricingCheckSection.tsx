import { PricingCheck } from '@/types/analysis'
import Accordion from './Accordion'

const VERDICT_STYLES = {
  'サプライズ': {
    bg: 'bg-red-500',
    text: 'text-white',
    icon: '🚨',
    description: '市場が予想していなかった情報。株価への影響が大きい可能性があります。',
  },
  '一部織り込み': {
    bg: 'bg-yellow-400',
    text: 'text-white',
    icon: '⚡',
    description: '一部の投資家はすでに知っていた情報。株価への影響は中程度です。',
  },
  '織り込み済み': {
    bg: 'bg-slate-400',
    text: 'text-white',
    icon: '😴',
    description: 'すでに広く知られていた情報。株価への追加的な影響は限定的かもしれません。',
  },
}

export default function PricingCheckSection({ data }: { data: PricingCheck }) {
  const style = VERDICT_STYLES[data.verdict] || VERDICT_STYLES['一部織り込み']

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🔍</span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">③ 織り込み度チェック</h2>
          <p className="text-xs text-slate-500">「すでに周知の事実」か「サプライズ」かを判定</p>
        </div>
      </div>

      {/* 判定バッジ */}
      <div className="flex justify-center mb-5">
        <div className={`${style.bg} ${style.text} rounded-2xl px-8 py-4 text-center shadow-md`}>
          <div className="text-3xl mb-1">{style.icon}</div>
          <div className="text-xl font-bold">{data.verdict}</div>
          <div className="text-xs mt-1 opacity-90">{style.description}</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">判定根拠</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{data.reasoning}</p>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">💰 株価への期待値</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{data.priceImplication}</p>
        </div>
      </div>

      <div className="mt-4">
        <Accordion title="💡 「織り込み済み」とは？（初心者向け解説）">
          <p>{data.beginnerNote}</p>
        </Accordion>
      </div>
    </section>
  )
}
