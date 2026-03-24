import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar — фиксированный, 224px */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col ml-56">
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 px-8 py-6 max-w-3xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
