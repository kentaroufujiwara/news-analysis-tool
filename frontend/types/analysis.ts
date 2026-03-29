export interface ArticleSummary {
  title: string
  media: string
  summary: string
}

export interface Industry {
  name: string
  reason: string
  magnitude: '大' | '中' | '小'
  timeframe: '短期' | '中期' | '長期'
}

export interface Stock {
  name: string
  code: string
  direction: 'プラス' | 'マイナス'
  reason: string
}

export interface DirectImpact {
  positiveIndustries: Industry[]
  negativeIndustries: Industry[]
  notableStocks: Stock[]
  beginnerNote: string
}

export interface StatisticalView {
  similarCases: string
  reactionPattern: string
  caveat: string
  confidence: '高' | '中' | '低'
}

export interface PricingCheck {
  verdict: 'サプライズ' | '一部織り込み' | '織り込み済み'
  reasoning: string
  priceImplication: string
  beginnerNote: string
}

export interface AssociationItem {
  industry: string
  reason: string
}

export interface AssociationGame {
  primary: AssociationItem[]
  secondary: AssociationItem[]
  tertiary: AssociationItem[]
  story: string
}

export interface AnalysisResult {
  articleSummary: ArticleSummary
  directImpact: DirectImpact
  statisticalView: StatisticalView
  pricingCheck: PricingCheck
  associationGame: AssociationGame
}
