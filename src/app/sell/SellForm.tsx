"use client";

import { useState } from "react";

type Cat = { id: string; name: string; riskWarning: boolean };

export function SellForm({
  categories,
  t,
}: {
  categories: Cat[];
  t: {
    title: string;
    description: string;
    category: string;
    price: string;
    images: string;
    submit: string;
    successTitle: string;
    successBody: string;
    required: string;
    riskWarning: string;
    another: string;
  };
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cat = categories.find((c) => c.id === categoryId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        categoryId,
        priceCents: Math.round(parseFloat(price) * 100),
        images: images
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok || !data.ok) {
      setError(data.error ?? "Error");
      return;
    }
    setSuccess(true);
    setTitle("");
    setDescription("");
    setPrice("");
    setImages("");
  };

  if (success) {
    return (
      <div className="card">
        <h2 className="text-silver-bright font-semibold">{t.successTitle}</h2>
        <p className="muted mt-1">{t.successBody}</p>
        <button className="btn-secondary mt-4" onClick={() => setSuccess(false)}>
          {t.another}
        </button>
      </div>
    );
  }

  return (
    <form className="card space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{t.title}</label>
        <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{t.category}</label>
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {cat?.riskWarning && (
          <div className="text-xs text-yellow-300 mt-1">⚠ {t.riskWarning}</div>
        )}
      </div>
      <div>
        <label className="text-sm muted block mb-1">{t.price}</label>
        <input type="number" min="0" step="0.01" required className="input" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{t.description}</label>
        <textarea rows={6} required className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{t.images}</label>
        <textarea rows={3} className="input" value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://..." />
      </div>
      {error && <div className="text-red-300 text-sm">{error}</div>}
      <button disabled={submitting} className="btn-primary w-full">{submitting ? "..." : t.submit}</button>
    </form>
  );
}
