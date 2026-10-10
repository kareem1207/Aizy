"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { decodeToken, getStoredToken, TOKEN_KEY } from "@/lib/token";
import { asset } from "@/lib/format";
import { DemoBanner } from "@/components/DemoBanner";
import { CartDrawer } from "@/components/CartDrawer";

export const Header = () => {
  const [me, setMe] = useState(null);
  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const hydrate = useCartStore((s) => s.hydrate);
  const setOpen = useCartStore((s) => s.setOpen);

  useEffect(() => {
    hydrate();
    const sync = () => setMe(decodeToken(getStoredToken()));
    sync();
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("aizy-auth", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("aizy-auth", sync);
    };
  }, [hydrate]);

  const label = me ? (me.role === "customer" ? "Account" : me.role === "seller" ? "Seller hub" : "Admin") : null;

  return (
    <>
      <DemoBanner />
      <div className="sticky top-0 z-50 bg-[#fffcf6]/95 backdrop-blur shadow-sm">
        <header className="container mx-auto">
          <div className="flex items-center justify-between h-16 px-4 gap-6">
            <Link href="/" className="flex-shrink-0" aria-label="Aizy home">
              <Image src={asset("/logo.jpg")} alt="Aizy" width={150} height={50} unoptimized className="object-contain hover:opacity-90 transition-opacity h-12 w-auto" />
            </Link>

            <nav className="flex items-center gap-3 sm:gap-5 text-[#3c6ca8] font-medium">
              <Link href="/" className="hover:underline hidden sm:inline">Shop</Link>
              {me ? (
                <Link href="/user" className="hover:underline" data-testid="account-link">{label}</Link>
              ) : (
                <Link href="/login" className="hover:underline" data-testid="login-link">Login</Link>
              )}
              {(!me || me.role === "customer") && (
                <button
                  onClick={() => setOpen(true)}
                  aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
                  className="relative p-2 rounded-full hover:bg-[#3c6ca8]/10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 5h13M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" /></svg>
                  {count > 0 && (
                    <span data-testid="cart-count" className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#3c6ca8] text-white text-[11px] leading-[18px] text-center">{count}</span>
                  )}
                </button>
              )}
            </nav>
          </div>
        </header>
      </div>
      <CartDrawer />
    </>
  );
};
