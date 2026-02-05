export interface Participant {
  display_name?: string;
  twitter_screen_name?: string;
  periscope_user_id?: string;
  avatar_url?: string;
  is_verified?: boolean;
  is_muted_by_admin?: boolean;
  is_muted_by_guest?: boolean;
  start?: number;
  user_results?: any;
}

export interface Space {
  id: string;
  title: string;
  title_en?: string;  // English translation of title for ZH spaces
  state: string;
  creator_id: string | null;
  date: number;  // Unix timestamp from API
  length: string;  // Duration string like "1 h 17 m" from API
  listeners: number;  // Total listeners from API
  started_at?: string;  // Optional, for backwards compatibility
  ended_at?: string | null;  // Optional, for backwards compatibility
  detected_language: string | null;
  is_crypto: boolean;
  total_live_listeners?: number;  // Optional, for backwards compatibility
  total_replay_watched?: number;  // Optional, for backwards compatibility
  participants: {
    admins: Participant[];
    speakers: Participant[];
  } | null;
  reports?: Report[];
  // New API v0 fields
  abstract?: string[];  // Abstract paragraphs moved to space level
  audio_url?: string;  // Direct link to audio file
  m3u8_url?: string;  // HLS stream URL
  transcription_id?: string;  // UUID linking to transcript
  transcription_service?: string;  // Provider used (e.g., "deepgram")
  created_at?: number;  // Record creation timestamp
  updated_at?: number;  // Last update timestamp
}

export interface Report {
  id: string;
  space_id: string;
  report_language: string;
  is_published: boolean;
  created_at: string;
  report_data: ReportData | null;
}

export interface ReportData {
  abstract?: string[];  // Array of strings, not single string
  timeline?: TimelineEntry[];
  key_insights?: string[];
  project_mentions?: ProjectMention[];
  hot_takes?: HotTake[];  // Array of objects with text/speaker/timestamp
  potential_alpha?: string[];  // Array of strings
  market_sentiment?: MarketSentiment;  // Object with overall/notes
}

export interface TimelineEntry {
  event?: string;
  start_time_ms?: number;
  end_time_ms?: number;
  significance?: string;
}

export interface ProjectMention {
  name?: string;
  context?: string;
}

export interface HotTake {
  text?: string;
  speaker?: string;
  timestamp?: string;
}

export interface MarketSentiment {
  overall?: string;
  notes?: string;
}

export interface SpacesListResponse {
  spaces: Space[];
  next_page: string | null;
}

export interface ReportResponse {
  report: Report;
  space?: Space;
}
