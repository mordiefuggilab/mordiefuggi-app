import { NextResponse } from 'next/server';

// Traduzione via Google Translate (endpoint non ufficiale - gratuito, no API key)
async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000) 
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Google returns [[["translated","original",...],...],...]
    const translated = data?.[0]?.map(chunk => chunk?.[0]).filter(Boolean).join('');
    return translated || null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const { piatti, lang } = await request.json();

    if (!piatti || !Array.isArray(piatti) || piatti.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    const langMap = { en: 'en', fr: 'fr', es: 'es' };
    const targetLang = langMap[lang] || 'en';

    const results = await Promise.all(
      piatti.map(async ({ id, nome }) => {
        const translated = await translateText(nome, targetLang);
        return { id, nome: translated || nome };
      })
    );

    return NextResponse.json({ translations: results });

  } catch (err) {
    console.error('Translate error:', err);
    return NextResponse.json({ translations: [] }, { status: 200 });
  }
}