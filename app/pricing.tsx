"use client";
import ShinyText from "@/components/ShinyText";
import { Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const Pricing = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const createCheckout = useAction(api.stripe.createSubscriptionCheckout);

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Upgrade successful! Welcome to Pro.");
      // Small delay to let the webhook finish before redirecting
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  }, [searchParams, router]);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      return;
    }

    try {
      setIsLoading(true);

      const session = await createCheckout({});

      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section
      id="pricing"
      className="container mx-auto px-4 sm:px-6 py-12 sm:py-24 max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-foreground tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          Choose the plan that fits your growth.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier - Forced Light */}
        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
          <div className="mb-8">
            <h3 className="text-xl font-black mb-4 text-slate-900">
              Free Starter
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                $0
              </span>
              <span className="text-slate-500 text-sm font-bold">/ forever</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3.5 mb-8 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black rounded-2xl transition-all active:scale-95 text-sm border border-slate-200"
          >
            Get Started
          </button>

          <ul className="space-y-4 text-sm flex-1">
            {[
              "Up to 5 PDF Documents",
              "Limited AI Analysis",
              "Basic Note-taking",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-600 font-bold">
                <div className="p-1 rounded-full bg-slate-50 border border-slate-100">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Tier - Forced Light Premium */}
        <div className="relative p-8 bg-white border-2 border-[#d8b131] rounded-3xl shadow-[0_20px_50px_rgba(216,177,49,0.15)] flex flex-col hover:shadow-[0_20px_60px_rgba(216,177,49,0.25)] transition-all duration-500 group overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#d8b131]/5 rounded-full blur-[100px]"></div>

          <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#d8b131] text-white text-[10px] font-black rounded-b-2xl tracking-[0.2em] uppercase shadow-lg z-20">
            MOST POPULAR
          </div>

          <div className="mb-8 relative z-10 pt-4">
            <h3 className="text-2xl font-black mb-4 text-slate-900 flex items-center gap-2">
              Pro Access <Sparkles className="w-6 h-6 text-[#d8b131]" />
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">
                ₹1725
              </span>
              <span className="text-slate-500 font-bold text-base">/year</span>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-4 mb-8 bg-[#d8b131] text-white hover:bg-[#c49e2b] font-black rounded-2xl transition-all shadow-[0_10px_25px_rgba(216,177,49,0.2)] active:scale-95 text-sm z-10 disabled:opacity-50"
          >
            {isLoading ? "Preparing..." : "Upgrade to Pro"}
          </button>

          <ul className="space-y-4 text-sm flex-1 relative z-10 font-bold">
            {[
              "Unlimited PDF Uploads",
              "Priority AI Context Analysis",
              "Advanced Workspace Tools",
              "Priority Human Support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-800 transition-all group-hover:translate-x-1">
                <div className="p-1 rounded-full bg-amber-50 border border-amber-100">
                  <svg
                    className="w-3.5 h-3.5 text-[#d8b131]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
