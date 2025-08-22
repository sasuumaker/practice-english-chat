export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
        };
        Update: {
          username?: string;
          email?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title?: string | null;
        };
        Update: {
          title?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_session_id: string;
          message_type: "user" | "ai_welcome" | "ai_response";
          content: string;
          created_at: string;
        };
        Insert: {
          chat_session_id: string;
          message_type: "user" | "ai_welcome" | "ai_response";
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      english_expressions: {
        Row: {
          id: string;
          message_id: string;
          expression_text: string;
          pronunciation: string | null;
          difficulty_level: string | null;
          created_at: string;
        };
        Insert: {
          message_id: string;
          expression_text: string;
          pronunciation?: string | null;
          difficulty_level?: string | null;
        };
        Update: {
          expression_text?: string;
          pronunciation?: string | null;
          difficulty_level?: string | null;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          english_expression_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          english_expression_id: string;
          notes?: string | null;
        };
        Update: {
          notes?: string | null;
        };
      };
    };
    Enums: {
      message_type_enum: "user" | "ai_welcome" | "ai_response";
    };
  };
}
