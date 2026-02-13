'use client'
import { FileText, Upload } from 'lucide-react';

import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Upgrade from './upgrade/page';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '../components/sidebar'
import Header from '../components/header'
import { toast } from 'sonner';

export default function Dashboard() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  React.useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Upgrade successful! Welcome to Pro.");
      // Small delay to let the state sync
      setTimeout(() => {
        router.replace("/dashboard");
      }, 3000);
    }
  }, [searchParams, router]);
  // const [loading, setLoading] = useState(false);

  const getAllFiles = useQuery(api.fileStorage.getUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress as string
  })

  return (
    <>
      {/* Mobile Menu Button */}
      {path === '/dashboard/upgrade' && <Upgrade />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header name="Dashboard" />

        {/* PDF Grid */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {getAllFiles === undefined ? (
            <div className="animate-in fade-in duration-500">
              <div className="mb-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                  <div key={index} className="bg-card rounded-xl border border-border overflow-hidden">
                    <Skeleton className="h-44 w-full rounded-none" />
                    <div className="p-5">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : getAllFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-sm border border-border">
                <FileText size={36} className="text-muted-foreground/60" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No documents yet</h3>
              <p className="text-muted-foreground max-w-xs">Upload your first PDF to start your smart note-taking journey.</p>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground">Recent Documents</h2>
                <p className="text-sm text-muted-foreground mt-1">You have {getAllFiles.length} document{getAllFiles.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getAllFiles.map((pdf, index) => (
                  <button
                    key={index}
                    className="bg-card rounded-xl border border-border hover:border-[#d8b131]/50 hover:shadow-xl hover:shadow-[#d8b131]/5 transition-all duration-300 overflow-hidden text-left group relative focus:ring-2 focus:ring-[#d8b131]/20 outline-none"
                  >
                    <Link href={`/workspace/${pdf.fileId}`}>
                      {/* PDF Preview */}
                      <div className="h-44 bg-muted/30 flex items-center justify-center border-b border-border group-hover:bg-[#d8b131]/5 transition-colors">
                        <FileText size={56} className="text-muted-foreground/40 group-hover:text-[#d8b131]/40 transition-colors" />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white/80 dark:bg-black/80 backdrop-blur-md p-1.5 rounded-lg shadow-sm">
                            <FileText size={14} className="text-[#d8b131]" />
                          </span>
                        </div>
                      </div>

                      {/* PDF Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-foreground mb-2 truncate text-sm leading-tight group-hover:text-[#d8b131] transition-colors">
                          {pdf?.fileName}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full capitalize">
                            PDF Document
                          </span>
                        </div>
                      </div>
                    </Link>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}