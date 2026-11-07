import { ChattingHeader } from "./chatting/_components/layout/chatting-header";

export default function ImmersiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-linear-to-b from-primary/10 via-tone-violet/5 to-transparent"
      />
      <ChattingHeader />
      <main className="relative flex-1">{children}</main>
    </div>
  );
}
