import Footer from "@/components/home/footer";
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
      <Footer/>
    </>
  );
}
