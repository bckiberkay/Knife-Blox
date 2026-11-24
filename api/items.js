javascript
export default async function handler(req, res) {
  const { freeOnly } = req.query;
  
  try {
    // Roblox Katalog API'sinden en yeni UGC eşyaları çekme
    let url = 'https://roblox.com';
    if (freeOnly === 'true') {
      url += '&MaxPrice=0';
    }

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Roblox API yanit vermedi');
    }

    const data = await response.json();
    const items = data.data || [];

    if (items.length === 0) {
      return res.status(200).json({ items: [] });
    }

    // Eşyaların küçük resimlerini (Thumbnail) çekme
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
      id: item.id,
      name: item.name,
      creator: item.creatorName,
      price: item.price === 0 ? 'ÜCRETSİZ' : (item.price ? `${item.price} Robux` : 'Satışta Değil'),
      isFree: item.price === 0,
      image: thumbMap[item.id] || 'https://rbxcdn.com',
      url: `https://roblox.com{item.id}`
    }));

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    return res.status(200).json({ items: enrichedItems });
  } catch (error) {
    return res.status(500).json({ error: 'Veri çekilemedi', details: error.message });
  }
}


