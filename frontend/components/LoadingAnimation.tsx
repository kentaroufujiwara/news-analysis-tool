'use client'

const LOADING_STEPS = [
  { icon: '🔍', text: '記事を取得中...' },
  { icon: '🧠', text: 'AIが分析中...' },
  { icon: '📊', text: '4軸レポートを生成中...' },
]

export default function LoadingAnimation({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="loading-dot w-4 h-4 rounded-full bg-blue-500"
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-3">
        {LOADING_STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-sm transition-all duration-300 ${
              i === step
                ? 'text-blue-600 font-semibold scale-105'
                : i < step
                ? 'text-green-500'
                : 'text-slate-300'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.text}</span>
            {i < step && <span className="text-green-500">✓</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">分析には10〜20秒ほどかかります</p>
    </div>
  )
}
