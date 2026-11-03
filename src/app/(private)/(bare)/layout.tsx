import { Navbar } from "@/components/layout/navbar";

export default async function BareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
