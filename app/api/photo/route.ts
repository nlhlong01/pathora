import { NextRequest, NextResponse } from "next/server";
import { fetchCastlePhoto } from "@/lib/wikimedia";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ photo: null });

  const photo = await fetchCastlePhoto(name);
  return NextResponse.json({ photo });
}
