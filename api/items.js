export default async function handler(req, res) {
  const { freeOnly } = req.query;

  try {
    // 1. Yöntem: Roblox Catalog v2 Güncel Uç Noktası
    let v2Url = 'https://roblox.com';
    if (freeOnly === 'true') {
      v2Url += '&maxPrice=0';
    }

    const response = await fetch(v2Url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });

    let items = [];

    if (response.ok) {
      const data = await response.json();
      items = (data.data || []).map(item => ({
        id: item.id,
        name: item.name,
        creator: item.creatorName || 'UGC Üreticisi',
        price: item.price === 0 ? 'ÜCRETSİZ' : (item.price ? `${item.price} Robux` : 'Satışta Değil'),
        isFree: item.price === 0,
        url: `https://roblox.com{item.id}`
      }));
    }

    // 2. Yöntem (Yedek Motor): Roblox v2 engellenirse Rolimon's açık kataloğundan çek
    if (items.length === 0 && freeOnly !== 'true') {
      const roliRes = await fetch('https://api.rolimons.com/items/v1/itemdetails', {
        headers: { 'User-Agent': 'KnifeBlox-Tracker/1.0' }
      });
      if (roliRes.ok) {
        const roliData = await roliRes.json();
        const entries = Object.entries(roliData.items || {}).slice(-30).reverse();
        items = entries.map(([id, info]) => ({
          id: Number(id),
          name: info[0],
          creator: 'Roblox Limited',
          price: info[2] > 0 ? `${info[2].toLocaleString('tr-TR')} RAP` : 'Limited',
          isFree: false,
          url: `https://roblox.com{id}`
        }));
      }
    }

    if (items.length === 0) {
      return res.status(200).json({ items: [], debug: `Roblox Yanıt Kodu: ${response.status}` });
    }

    // Eşya küçük resimlerini (Thumbnail) çekme
    const assetIds = items.map(item => item.id).join(',');
    const thumbUrl = `https://roblox.com{assetIds}&size=420x420&format=Png&isCircular=false`;

    const thumbRes = await fetch(thumbUrl);
    const thumbData = await thumbRes.json();

    const thumbMap = {};
    if (thumbData.data) {
      thumbData.data.forEach(t => {
        thumbMap[t.targetId] = t.imageUrl;
      });
    }

    const enrichedItems = items.map(item => ({
      ...item,
      image: thumbMap[item.id] || 'https://rbxcdn.com'
    }));

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    return res.status(200).json({ items: enrichedItems });
  } catch (error) {
    return res.status(200).json({ items: [], debug: error.message });
  }
}

