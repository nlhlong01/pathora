"use client";

import { useEffect, useState } from "react";

interface PopupCardProps {
  name: string;
  lat: number;
  lng: number;
  type: "castle" | "fortress";
  wikipedia?: string;
}

export default function PopupCard({ name, lat, lng, type, wikipedia }: PopupCardProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ name });
    if (wikipedia) params.set("wikipedia", wikipedia);
    fetch(`/api/photo?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setPhoto(d.photo))
      .catch(() => setPhoto(null))
      .finally(() => setLoading(false));
  }, [name, wikipedia]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const label = type === "fortress" ? "Fortress" : "Castle";

  return (
    <div className="w-56 rounded-xl overflow-hidden shadow-lg bg-white font-sans">
      <div className="relative h-32 bg-stone-200">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
          />
        )}
        {!loading && !photo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
            <span className="text-4xl">🏰</span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs font-semibold uppercase tracking-wider bg-black/50 text-white px-2 py-0.5 rounded-full">
          {label}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-stone-900 leading-tight mb-2">
          {name}
        </h3>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
