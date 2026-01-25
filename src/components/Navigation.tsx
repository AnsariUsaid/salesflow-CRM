"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Package } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/orders", label: "New Order" },
    { href: "/orders-list", label: "Orders List" },
    { href: "/processing/available", label: "Processing Available" },
    { href: "/processing/my-orders", label: "My Processing" },
    { href: "/followup/available", label: "Followup Available" },
    { href: "/followup/my-orders", label: "My Followup" },
    { href: "/tickets", label: "Tickets" },
    { href: "/tickets/my-tickets", label: "My Tickets" },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <span className="text-xl font-bold text-white">SalesFlow</span>
                <span className="text-xs block text-gray-400 -mt-0.5">CRM System</span>
              </div>
            </Link>
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === item.href
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
