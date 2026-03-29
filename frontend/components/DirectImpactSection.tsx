import { DirectImpact } from '@/types/analysis'
import Accordion from './Accordion'

const MAGNITUDE_COLORS = {
  '大': 'bg-red-100 text-red-700 border border-red-200',
  '中': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  '小': 'bg-blue-100 text-blue-700 border border-blue-200',
}

const TIMEFRAME_COLORS = {
  '短期': 'bg-orange-100 text-orange-600',
  '中期': 'bg-purple-100 text-purple-600',
  '長期': 'bg-teal-100 text-teal-600',
}

export default function DirectImpactSection({ data }: { data: DirectImpact }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">⚡</span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">① 直接的影響</h2>
          <p className="text-xs text-slate-500">このニュースでプラス・マイナスになる業界・銘柄</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* プラス影響 */}
        <div>
          <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-1">
            🟢 プラス影響の業界
          </h3>
          <div className="flex flex-col gap-2">
            {data.positiveIndustries.map((ind, i) => (
              <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 text-sm">{ind.name}</span>
                  <div className="flex gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MAGNITUDE_COLORS[ind.magnitude] || 'bg-slate-100 text-slate-600'}`}>
                      影響度:{ind.magnitude}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TIMEFRAME_COLORS[ind.timeframe] || 'bg-slate-100 text-slate-600'}`}>
                      {ind.timeframe}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{ind.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* マイナス影響 */}
        <div>
          <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-1">
            🔴 マイナス影響の業界
          </h3>
          <div className="flex flex-col gap-2">
            {data.negativeIndustries.map((ind, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 text-sm">{ind.name}</span>
                  <div className="flex gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MAGNITUDE_COLORS[ind.magnitude] || 'bg-slate-100 text-slate-600'}`}>
                      影響度:{ind.magnitude}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TIMEFRAME_COLORS[ind.timeframe] || 'bg-slate-100 text-slate-600'}`}>
                      {ind.timeframe}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{ind.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 注目銘柄 */}
      {data.notableStocks && data.notableStocks.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📌 注目銘柄</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-200">銘柄名</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-200">コード</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-200">方向</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-200">理由</th>
                </tr>
              </thead>
              <tbody>
                {data.notableStocks.map((stock, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-800">{stock.name}</td>
                    <td className="px-3 py-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-xs">{stock.code}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stock.direction === 'プラス' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stock.direction === 'プラス' ? '↑ プラス' : '↓ マイナス'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{stock.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 初心者向け解説 */}
      <Accordion title="💡 初心者向け解説を見る">
        <p>{data.beginnerNote}</p>
      </Accordion>
    </section>
  )
}
