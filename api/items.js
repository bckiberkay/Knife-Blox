export default async function handler(req, res) {
  const { freeOnly } = req.query;

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'KnifeBlox-Catalog-Radar/1.0'
  };

  try {
    let items = [];

    // 1. Kaynak: RoProxy Katalog v1 (En Yeni Eşyalar)
    const v1Url = `https://roproxy.com{freeOnly === 'true' ? '&MaxPrice=0' : ''}`;
    const res1 = await fetch(v1Url, { headers });
    if (res1.ok) {
      const data1 = await res1.json();
      items = data1.data || [];
    }

    // 2. Kaynak (Yedek): RoProxy Katalog v2
    if (items.length === 0) {
      const v2Url = `https://roproxy.com{freeOnly === 'true' ? '&maxPrice=0' : ''}`;
      const res2 = await fetch(v2Url, { headers });
      if (res2.ok) {
        const data2 = await res2.json();
        items = data2.data || [];
      }
    }

    // 3. Kaynak (Garanti Yedek): Rolimon's Açık Eşya Veritabanı
    if (items.length === 0 && freeOnly !== 'true') {
      const res3 = await fetch('https://rolimons.com', { headers });
      if (res3.ok) {
        const data3 = await res3.json();
        const entries = Object.entries(data3.items || {}).slice(-30).reverse();
        items = entries.map(([id, info]) => ({
          id: Number(id),
          name: info,
          creatorName: 'Roblox Limited',
          price: info > 0 ? info : null
        }));
      }
    }

    if (items.length === 0) {
      return res.status(200).json({ items: [], debug: 'Kaynaklardan boş liste döndü' });
    }

    // Küçük resimleri (Thumbnail) RoProxy üzerinden çekme
    const ids = items.map(i => i.id).join(',');
    let thumbMap = {};
    try {
      const thumbRes = await fetch(`https://roproxy.com{ids}&size=420x420&format=Png&isCircular=false`, { headers });
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        (thumbData.data || []).forEach(t => {
          thumbMap[t.targetId] = t.imageUrl;
        });
      }
    } catch (e) {}

    const enrichedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      creator: item.creatorName || 'Roblox',
      price: item.price === 0 ? 'ÜCRETSİZ' : (item.price ? `${item.price.toLocaleString('tr-TR')} Robux` : 'Limited / Satışta Değil'),
      isFree: item.price === 0,
      image: thumbMap[item.id] || `https://rbxcdn.com`,
      url: `https://roblox.com{item.id}`
    }));

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    return res.status(200).json({ items: enrichedItems });
  } catch (error) {
    return res.status(200).json({ items: [], debug: error.message });
  }
}
