"use client";
import { useEffect, useState } from "react";
import { decodeToken, getStoredToken } from "@/lib/token";
import { Seller } from "./Seller";
import { Admin } from "./Admin";
import Customer from "./Home";

export const Main = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const sync = () => {
      const r = decodeToken(getStoredToken())?.role;
      setRole(r === "admin" || r === "seller" ? r : "customer");
    };
    sync();
    window.addEventListener("aizy-auth", sync);
    return () => window.removeEventListener("aizy-auth", sync);
  }, []);

  if (role === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-12 h-12 border-4 border-[#3c6ca8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (role === "admin") return <Admin />;
  if (role === "seller") return <Seller />;
  return <Customer />;
};
