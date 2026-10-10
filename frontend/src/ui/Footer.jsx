import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/format";

const REPO = "https://github.com/kareem1207/Aizy";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#fffcf6] border-t border-[#3c6ca8]/15">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <Image src={asset("/logo.jpg")} alt="Aizy" width={130} height={45} unoptimized className="object-contain h-11 w-auto" />
            <p className="text-gray-600 max-w-xs text-sm">
              An AI-assisted store with a fashion stylist for shoppers and sales forecasting for sellers.
            </p>
          </div>

          <nav aria-label="Footer">
            <h3 className="font-semibold text-gray-900 mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-[#3c6ca8]">Shop</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-[#3c6ca8]">Log in or sign up</Link></li>
              <li><a href={REPO} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#3c6ca8]">Source code on GitHub</a></li>
              <li><a href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#3c6ca8]">Report an issue</a></li>
            </ul>
          </nav>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">About this project</h3>
            <p className="text-gray-600 text-sm">
              Built by Shaik Kareem, with interface design by Annie Angel Yarram. Source-available under a non-commercial license. No payments are processed anywhere in this app.
            </p>
          </div>
        </div>

        <div className="border-t border-[#3c6ca8]/10 pt-6 text-center text-sm text-gray-500">
          © {year} Team Aizy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
