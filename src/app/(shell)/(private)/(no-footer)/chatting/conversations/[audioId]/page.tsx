import { ChattingFeed } from "../../_components/feed/chatting-feed";

interface ConversationPageProps {
  params: Promise<{ audioId: string }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { audioId } = await params;

  return <ChattingFeed conversationId={audioId} />;
}
