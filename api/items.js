export default async function handler(req, res) {
  const { freeOnly } = req.query;

  try {
    let url = 'https://roblox.com';
    if (freeOnly === 'true') {
      url += '&MaxPrice=0';
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      // İlk sorgu engellenirse genel katalog aramasına düş
      const fallbackUrl = `https://roblox.com{freeOnly === 'true' ? '&MaxPrice=0' : ''}`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!fallbackRes.ok) {
        return res.status(200).json({ items: [], debug: `Roblox HTTP ${fallbackRes.status}` });
      }
      var data = await fallbackRes.json();
    } else {
      var data = await response.json();
    }

    const items = data.data || [];

    if (items.length === 0) {
      return res.status(200).json({ items: [] });
    }

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
      creator: item.creatorName || 'Roblox',
      price: item.price === 0 ? 'ÜCRETSİZ' : (item.price ? `${item.price} Robux` : 'Satışta Değil'),
      isFree: item.price === 0,
      image: thumbMap[item.id] || 'https://rbxcdn.com',
      url: `https://roblox.com{item.id}`
    }));

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    return res.status(200).json({ items: enrichedItems });
  } catch (error) {
    return res.status(200).json({ items: [], error: error.message });
  }
}


