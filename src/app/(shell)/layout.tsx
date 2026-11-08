import { Navbar } from "@/components/layout/navbar";
import { Footer } from "react-day-picker";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
