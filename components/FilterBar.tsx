"use client";
import { useState, useEffect } from "react";

export function FilterBar({ onChange }: { onChange: (q: string) => void }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    const id = setTimeout(() => onChange(q.trim().toLowerCase()), 200);
    return () => clearTimeout(id);
  }, [q, onChange]);
  return (
    <div className="flex gap-2">
      <input
        className="w-full rounded-md border p-2"
        placeholder="Rechercher (titre, ingrédient, tag)…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </div>
  );
}
