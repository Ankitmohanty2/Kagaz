"use client";
import {
  Upload,
  FileText,
  Crown,
  User,
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  Gem,
  CrownIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  const { user } = useUser();

  const getAllFiles = useQuery(api.fileStorage.getUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress as string,
  });

  const currentUser = useQuery(api.user.getUser, {
    email: user?.primaryEmailAddress?.emailAddress as string,
  });

  const progressValue =
    getAllFiles && getAllFiles.length ? (getAllFiles.length / 5) * 100 : 0;
  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-md text-foreground"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-background border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="h-16 flex items-center px-6 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">कागज़</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => router.push("/dashboard")}
            className={
              path === "/dashboard"
                ? "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground w-full transition-all font-semibold text-sm shadow-sm"
                : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground w-full hover:bg-muted hover:text-foreground transition-all font-medium text-sm group"
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <FileUpload>
            <Button
              disabled={
                getAllFiles?.length === 5 && currentUser?.upgrade === false
              }
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full bg-foreground text-background hover:opacity-90 transition-all cursor-pointer font-bold text-sm shadow-sm active:scale-95"
            >
              <Upload size={18} />
              <span>Upload PDF</span>
            </Button>
          </FileUpload>

          {currentUser?.upgrade === false && (
            <button
              onClick={() => router.push("/dashboard/upgrade")}
              className={
                path === "/dashboard/upgrade"
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 w-full transition-all font-bold text-sm"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground w-full hover:bg-amber-500/5 hover:text-amber-600 transition-all font-medium text-sm group"
              }
            >
              <Crown size={18} className="text-amber-500" />
              <span>Upgrade</span>
              <span className="ml-auto text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                PRO
              </span>
            </button>
          )}
        </nav>

        {/* Progress Section */}
        {currentUser?.upgrade === false && (
          <div className="p-6 border-t border-border space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Storage
                </span>
                <span className="text-sm font-bold text-foreground">
                  {getAllFiles?.length}/5 PDFs
                </span>
              </div>
              <Progress value={progressValue} className="h-2 bg-muted transition-all" />
              <p className="text-[11px] text-muted-foreground mt-3 font-medium">
                {5 - (getAllFiles?.length || 0)} upload
                {5 - (getAllFiles?.length || 0) !== 1 ? "s" : ""} remaining
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/upgrade")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#d8b131] text-white hover:bg-[#c49e2b] shadow-lg shadow-amber-500/10 transition-all text-sm font-bold active:scale-95"
            >
              <CrownIcon size={16} />
              Upgrade Now
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
