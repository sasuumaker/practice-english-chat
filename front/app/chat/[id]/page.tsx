import { requireAuth } from "@/app/actions/auth";
import ChatInterface from "@/app/components/ChatInterface";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const user = await requireAuth();
  const supabase = await createClient();

  // チャットセッションが存在し、ユーザーのものであることを確認
  const { data: session, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    notFound();
  }

  // 既存のメッセージを取得
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_session_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatInterface 
        sessionId={params.id}
        initialMessages={messages || []}
        sessionTitle={session.title || "新しいチャット"}
      />
    </div>
  );
}