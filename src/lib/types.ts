// Shape returned by HAF_FYP. Each post is in Hivemind bridge.get_ranked_posts
// shape PLUS a nested `fyp` object with this app's ranking signals.
// We type only the fields the UI actually reads; the rest pass through.

// Matches the live HAF_FYP `fyp` object (verified against testapi). Component
// scores are score_*; score_relevance is null when the user has no interest
// vector (cold start) or the post has no embedding.
export interface FypSignals {
  rank?: number
  final_score: number
  score_relevance: number | null
  score_recency: number
  score_engagement: number
  score_credibility: number
  community_boost_applied?: boolean
  boost_source?: string | null
  source?: 'personalized' | 'global'
  // Exposed for telemetry (haf_fyp #12): joinable post key + serving algo.
  post_id?: number
  algorithm_version?: string | null
}

export interface PostJsonMetadata {
  image?: string[] | string // Hive apps emit either; normalise before use
  tags?: string[] | string
  app?: string
  [k: string]: unknown
}

export interface FypPost {
  author: string
  permlink: string
  title: string
  body: string
  category?: string
  created: string
  json_metadata?: PostJsonMetadata | string
  payout?: number
  pending_payout?: number
  author_reputation?: number
  children?: number
  net_rshares?: number
  community?: string
  community_title?: string
  url?: string
  active_votes?: { voter: string; rshares: number }[]
  // Moderation signals from the Hivemind bridge (observer-dependent).
  blacklists?: string[]
  stats?: { gray?: boolean; hide?: boolean; flag_weight?: number }
  fyp?: FypSignals
}

export type FeedKind = 'foryou' | 'discover'
