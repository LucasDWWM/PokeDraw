import { ReactNode } from "react";
import Navbar from "./Navbar";

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-[#f9f4ea] text-neutral-900 font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pb-16 pt-10">{children}</main>
    </div>
  );
};

export default Layout;
