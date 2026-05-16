"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditListingForm({
  id,
  initial,
  categories,
  labels,
}: {
  id: string;
  initial: { title: string; description: string; categoryId: string; priceCents: number; images: string[] };
  categories: { id: string; name: string }[];
  labels: any;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [price, setPrice] = useState((initial.priceCents / 100).toFixed(2));
  const [images, setImages] = useState((initial.images ?? []).join("\n"));
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErr(null);
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        categoryId,
        priceCents: Math.round(parseFloat(price) * 100),
        images: images.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok || !data.ok) {
      setErr(data.error ?? "Error");
      return;
    }
    router.push("/my-listings");
  };

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.title}</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.category}</label>
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.price}</label>
        <input type="number" className="input" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.description}</label>
        <textarea rows={6} className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.images}</label>
        <textarea rows={3} className="input" value={images} onChange={(e) => setImages(e.target.value)} />
      </div>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "..." : labels.save}</button>
    </form>
  );
}
