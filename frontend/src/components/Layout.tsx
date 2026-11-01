import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Player from "./Player";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col bg-surface text-white">
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto rounded-xl bg-linear-to-b from-[#1b2a22] via-panel to-panel px-4 pb-8 pt-4 sm:px-6">
          <Navbar />
          {children}
        </main>
      </div>
      <Player />
    </div>
  );
};

export default Layout;
