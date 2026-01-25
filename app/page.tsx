'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Package,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Users,
  TrendingUp
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Streamline Your<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Sales Workflow
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            A modern CRM designed for automotive parts sales teams. Manage orders,
            track payments, and streamline customer relationships—all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <SignInButton mode="redirect">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-2xl shadow-blue-600/50 hover:shadow-blue-600/70 hover:scale-105 flex items-center gap-2 text-lg">
                Get Started
                <ArrowUpRight size={20} />
              </button>
            </SignInButton>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-24">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Protected</h3>
              <p className="text-blue-200">
                Enterprise-grade security with role-based access control and data encryption.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-blue-200">
                Process orders and payments in seconds with our optimized workflow.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="bg-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Team Collaboration</h3>
              <p className="text-blue-200">
                Built for teams with real-time updates and activity tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
