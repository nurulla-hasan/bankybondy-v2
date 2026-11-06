import Footer from "@/components/home/footer";

export default async function BareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer/>
    </>
  );
}
