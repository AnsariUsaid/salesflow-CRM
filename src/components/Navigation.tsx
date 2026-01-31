"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Package, User, LogOut } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();

  // Hide navigation on home and sign-in pages
  if (pathname === "/" || pathname.startsWith("/sign-in")) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/orders", label: "New Order" },
    { href: "/orders-list", label: "Existing Orders" },
    { href: "/processing/available", label: "Processing" },
    { href: "/followup/available", label: "Follow-up" },
    { href: "/tickets", label: "Tickets" },
  ];

  const isActive = (href: string) => {
    // Exact match for most routes
    if (href === "/orders") {
      return pathname === "/orders";
    }
    // For other routes, use startsWith to catch sub-routes
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-[72px]"></div>
      
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 group"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
              <Package className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SalesFlow
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          {user?.primaryEmailAddress && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg px-4 py-2 border border-gray-200/50 shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full">
                  <User className="text-white" size={16} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.primaryEmailAddress.emailAddress}
                </span>
              </div>
              <SignOutButton>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 shadow-sm">
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </SignOutButton>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
