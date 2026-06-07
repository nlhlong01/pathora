import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <div className="relative w-full h-full">
      <MapWrapper />

      {/* Wordmark */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md">
        <span className="text-lg" aria-hidden="true">🏰</span>
        <span className="text-base font-bold tracking-tight text-stone-900">
          Pathora
        </span>
        <span className="hidden sm:inline text-xs text-stone-400 font-medium">
          Castles & Fortresses
        </span>
      </div>
    </div>
  );
}
