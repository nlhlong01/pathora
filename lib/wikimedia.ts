export async function fetchCastlePhoto(
  name: string,
  wikipediaTag?: string,
): Promise<string | null> {
  if (wikipediaTag) {
    const colon = wikipediaTag.indexOf(":");
    if (colon > 0) {
      const lang = wikipediaTag.slice(0, colon);
      const title = wikipediaTag.slice(colon + 1);
      if (/^[a-z-]{2,5}$/.test(lang) && title) {
        const photo = await fetchFromWiki(lang, title);
        if (photo) return photo;
      }
    }
  }

  return fetchFromWiki("de", name);
}

async function fetchFromWiki(lang: string, title: string): Promise<string | null> {
  const encoded = encodeURIComponent(title);
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=400&origin=*&redirects=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 604800 } });
    if (!res.ok) return null;

    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as any;
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}
