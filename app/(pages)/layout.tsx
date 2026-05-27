import { Navbar1 } from "@/components/navbar1";
import Footer from "@/components/shadcn-studio/blocks/footer-component-01/footer-component-01";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar1 />
      {children}
      <Footer />
    </>
  );
}
