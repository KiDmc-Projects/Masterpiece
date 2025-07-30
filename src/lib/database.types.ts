export type Database = {
  public: {
    Tables: {
      artworks: {
        Row: {
          id: number;
          title_en: string;
          title_ru: string;
          artist_name_en: string;
          artist_name_ru: string;
          artist_id: number | null;
          year_created: number | null;
          image_path: string;
          medium: string | null;
          dimensions: string | null;
          current_location: string | null;
          difficulty_level: number | null;
          art_movement: string | null;
          nationality: string | null;
          time_period: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          title_en: string;
          title_ru: string;
          artist_name_en: string;
          artist_name_ru: string;
          artist_id?: number | null;
          year_created?: number | null;
          image_path: string;
          medium?: string | null;
          dimensions?: string | null;
          current_location?: string | null;
          difficulty_level?: number | null;
          art_movement?: string | null;
          nationality?: string | null;
          time_period?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          title_en?: string;
          title_ru?: string;
          artist_name_en?: string;
          artist_name_ru?: string;
          artist_id?: number | null;
          year_created?: number | null;
          image_path?: string;
          medium?: string | null;
          dimensions?: string | null;
          current_location?: string | null;
          difficulty_level?: number | null;
          art_movement?: string | null;
          nationality?: string | null;
          time_period?: string | null;
          created_at?: string | null;
        };
      };
      difficulty_levels: {
        Row: {
          id: number;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
        };
      };
      quiz_sessions: {
        Row: {
          id: number;
          difficulty_level_id: number | null;
          score: number | null;
          completed: boolean | null;
          completed_at: string | null;
          created_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          difficulty_level_id?: number | null;
          score?: number | null;
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: number;
          difficulty_level_id?: number | null;
          score?: number | null;
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
      };
      user_quiz_results: {
        Row: {
          id: number;
          user_id: string;
          difficulty_level: number;
          score: number;
          total_questions: number;
          percentage: number;
          grade: string;
          quiz_answers: any;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          difficulty_level: number;
          score: number;
          total_questions: number;
          percentage: number;
          grade: string;
          quiz_answers: any;
          completed_at: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          difficulty_level?: number;
          score?: number;
          total_questions?: number;
          percentage?: number;
          grade?: string;
          quiz_answers?: any;
          completed_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
