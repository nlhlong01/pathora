"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import PopupCard from "./PopupCard";

interface Castle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "castle" | "fortress";
}

const castleIcon = L.icon({
  iconUrl: "/castle-marker.svg",
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

function ClusteredMarkers({ castles }: { castles: Castle[] }) {
  const map = useMap();
  const clusterRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("leaflet.markercluster").then(() => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }

      const L_any = L as any;
      const cluster = L_any.markerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: (c: any) => {
          const count = c.getChildCount();
          return L.divIcon({
            html: `<div class="cluster-icon">${count}</div>`,
            className: "",
            iconSize: [40, 40],
          });
        },
      });

      const React = require("react");
      const ReactDOM = require("react-dom/client");

      castles.forEach((castle) => {
        const marker = L.marker([castle.lat, castle.lng], { icon: castleIcon });
        const div = document.createElement("div");
        let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

        // Only mount PopupCard when the popup actually opens
        marker.on("popupopen", () => {
          root = ReactDOM.createRoot(div);
          root.render(
            React.createElement(PopupCard, {
              name: castle.name,
              lat: castle.lat,
              lng: castle.lng,
              type: castle.type,
            })
          );
        });

        // Unmount when popup closes to free memory
        marker.on("popupclose", () => {
          if (root) {
            root.unmount();
            root = null;
          }
        });

        marker.bindPopup(div, { minWidth: 224, maxWidth: 224, className: "castle-popup" });
        cluster.addLayer(marker);
      });

      clusterRef.current = cluster;
      map.addLayer(cluster);
    });

    return () => {
      if (clusterRef.current) map.removeLayer(clusterRef.current);
    };
  }, [castles, map]);

  return null;
}

export default function Map() {
  const [castles, setCastles] = useState<Castle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/castles")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data) => {
        setCastles(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[49.5, 9.5]}
        zoom={7}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!loading && !error && <ClusteredMarkers castles={castles} />}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/80 backdrop-blur-sm z-[1000]">
          <div className="w-10 h-10 border-3 border-stone-300 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-stone-600 text-sm font-medium">Loading castles & fortresses…</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/80 z-[1000]">
          <p className="text-red-600 text-sm font-medium">Failed to load castles. Please refresh.</p>
        </div>
      )}
    </div>
  );
}
