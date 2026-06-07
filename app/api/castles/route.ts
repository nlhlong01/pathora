import { NextResponse } from "next/server";
import { fetchCastles } from "@/lib/overpass";

export const revalidate = 86400;

export async function GET() {
  try {
    const castles = await fetchCastles();
    return NextResponse.json(castles);
  } catch (err) {
    console.error("Failed to fetch castles:", err);
    return NextResponse.json({ error: "Failed to load castles" }, { status: 500 });
  }
}
