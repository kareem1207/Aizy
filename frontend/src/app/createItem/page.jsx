"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ProductForm } from "@/components/ProductForm";
import { useProductStore } from "@/store/productStore";
import { decodeToken, getStoredToken } from "@/lib/token";

const CreateItem = () => {
  const router = useRouter();
  const createProduct = useProductStore((s) => s.createProduct);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const decoded = decodeToken(getStoredToken());
    if (!decoded || !["seller", "admin"].includes(decoded.role)) {
      router.replace("/login");
      return;
    }
    setMe(decoded);
  }, [router]);

  if (!me) return null;

  const submit = async (values) => {
    const res = await createProduct({ ...values, sellersName: me.username, sellersEmail: me.email });
    if (res.success) {
      toast.success("Product created");
      router.push("/");
    }
    return res;
  };

  return (
    <main className="min-h-screen bg-[#fffcf6] px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-[#3c6ca8]/10 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[#3c6ca8] mb-6">Create product</h1>
        <ProductForm submitLabel="Create product" onSubmit={submit} onCancel={() => router.push("/")} />
      </div>
    </main>
  );
};

export default CreateItem;
