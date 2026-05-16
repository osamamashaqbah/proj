"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewStoreProductForm({
  categories,
  labels,
}: {
  categories: { id: string; name: string }[];
  labels: {
    title: string;
    price: string;
    stock: string;
    description: string;
    images: string;
    submit: string;
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [images, setImages] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await fetch("/api/admin/store-products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title, description, categoryId,
        priceCents: Math.round(parseFloat(price) * 100),
        stock: parseInt(stock, 10),
        images: images.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    setPending(false);
    setTitle(""); setDescription(""); setPrice(""); setStock("10"); setImages("");
    router.refresh();
  };

  return (
    <form className="card grid md:grid-cols-2 gap-2" onSubmit={submit}>
      <input className="input" placeholder={labels.title} required value={title} onChange={(e) => setTitle(e.target.value)} />
      <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input className="input" type="number" placeholder={labels.price} required value={price} onChange={(e) => setPrice(e.target.value)} />
      <input className="input" type="number" placeholder={labels.stock} value={stock} onChange={(e) => setStock(e.target.value)} />
      <textarea className="input md:col-span-2" rows={3} placeholder={labels.description} value={description} onChange={(e) => setDescription(e.target.value)} />
      <textarea className="input md:col-span-2" rows={2} placeholder={labels.images} value={images} onChange={(e) => setImages(e.target.value)} />
      <button className="btn-primary md:col-span-2" disabled={pending}>{pending ? "..." : labels.submit}</button>
    </form>
  );
}
