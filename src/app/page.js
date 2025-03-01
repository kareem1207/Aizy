// import Image from "next/image";
import Main from "@/ui/Home";
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-white">
      <h1 className="text-primary-blue text-3xl font-bold">Welcome to Aizy.</h1>
      <Main />
    </div>
  );
}
