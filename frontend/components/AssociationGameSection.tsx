import { AssociationGame } from '@/types/analysis'

const WAVE_STYLES = [
  {
    label: '一次波及',
    emoji: '1️⃣',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-500 text-white',
    text: 'text-blue-700',
    connector: 'text-blue-400',
  },
  {
    label: '二次波及',
    emoji: '2️⃣',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-500 text-white',
    text: 'text-purple-700',
    connector: 'text-purple-400',
  },
  {
    label: '三次波及',
    emoji: '3️⃣',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-500 text-white',
    text: 'text-teal-700',
    connector: 'text-teal-400',
  },
]

export default function AssociationGameSection({ data }: { data: AssociationGame }) {
  const waves = [data.primary, data.secondary, data.tertiary]

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🎯</span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">④ 連想ゲーム（波及推論）</h2>
          <p className="text-xs text-slate-500">「AならBの業界にも影響する」という論理的推論</p>
        </div>
      </div>

      {/* 波及フロー */}
      <div className="flex flex-col gap-2 mb-6">
        {waves.map((wave, waveIdx) => {
          const style = WAVE_STYLES[waveIdx]
          if (!wave || wave.length === 0) return null

          return (
            <div key={waveIdx}>
              {waveIdx > 0 && (
                <div className="flex justify-center py-1">
                  <span className="text-slate-300 text-xl">↓</span>
                </div>
              )}
              <div className={`${style.bg} border ${style.border} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wave.map((item, i) => (
                    <div key={i} className="bg-white rounded-lg px-3 py-2 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
                      <div className={`font-semibold text-sm ${style.text} mb-1`}>{item.industry}</div>
                      <div className="text-xs text-slate-600">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 連想ストーリー */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">📖 連想ストーリー</h3>
        <p className="text-sm text-slate-700 leading-relaxed">{data.story}</p>
      </div>
    </section>
  )
}
