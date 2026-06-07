export interface Castle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "castle" | "fortress";
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const QUERY = `
[out:json][timeout:60];
area["name"="Hessen"]["admin_level"="4"]->.hessen;
area["name"="Rheinland-Pfalz"]["admin_level"="4"]->.rlp;
area["name"="Baden-Württemberg"]["admin_level"="4"]->.bw;
area["name"="Bayern"]["admin_level"="4"]->.bavaria;
(
  node["historic"="castle"](area.hessen);
  node["historic"="castle"](area.rlp);
  node["historic"="castle"](area.bw);
  node["historic"="castle"](area.bavaria);
  way["historic"="castle"](area.hessen);
  way["historic"="castle"](area.rlp);
  way["historic"="castle"](area.bw);
  way["historic"="castle"](area.bavaria);
  node["historic"="fortress"](area.hessen);
  node["historic"="fortress"](area.rlp);
  node["historic"="fortress"](area.bw);
  node["historic"="fortress"](area.bavaria);
  way["historic"="fortress"](area.hessen);
  way["historic"="fortress"](area.rlp);
  way["historic"="fortress"](area.bw);
  way["historic"="fortress"](area.bavaria);
);
out center;
`.trim();

// In-memory cache so the server only hits Overpass once per process lifetime
let cache: Castle[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchCastles(): Promise<Castle[]> {
  if (cache && Date.now() - cacheTime < CACHE_TTL_MS) return cache;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Pathora/1.0 (heritage travel map)",
    },
    body: `data=${encodeURIComponent(QUERY)}`,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);

  const data = await res.json();

  const castles = (data.elements as any[])
    .filter((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      return lat && lng && (el.tags?.name || el.tags?.["name:de"] || el.tags?.["name:en"]);
    })
    .map((el) => ({
      id: `${el.type}-${el.id}`,
      name:
        el.tags?.name ||
        el.tags?.["name:de"] ||
        el.tags?.["name:en"] ||
        "Unnamed",
      lat: el.lat ?? el.center.lat,
      lng: el.lon ?? el.center.lon,
      type: (el.tags?.historic === "fortress" ? "fortress" : "castle") as Castle["type"],
    }));

  cache = castles;
  cacheTime = Date.now();
  return castles;
}
