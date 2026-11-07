import Footer from "@/components/home/footer";

export default async function WithFooterLayout({
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
