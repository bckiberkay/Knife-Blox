<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Knife Blox | Anlık Roblox Item Takipçisi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0b0e14;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: rgba(15, 19, 26, 0.95);
      border-bottom: 1px solid #1e293b;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(10px);
    }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 16px; width: 100%; }
    .nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      gap: 12px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo {
      width: 42px; height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ef4444, #991b1b);
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; color: #fff; font-size: 18px;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
    }
    .brand h1 { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .brand h1 span { color: #ef4444; }
    .brand p { font-size: 12px; color: #94a3b8; }
    .controls { display: flex; gap: 8px; align-items: center; }
    button {
      border: none; cursor: pointer;
      padding: 10px 16px; border-radius: 8px;
      font-size: 13px; font-weight: 600;
      transition: all 0.2s;
    }
    .btn-active-red { background: #ef4444; color: #fff; }
    .btn-active-green { background: #10b981; color: #fff; }
    .btn-default { background: #1e293b; color: #cbd5e1; }
    .btn-default:hover { background: #334155; }
    .status-bar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 0 10px; font-size: 12px; color: #94a3b8;
    }
    .live-dot {
      display: inline-block; width: 8px; height: 8px;
      background: #10b981; border-radius: 50%; margin-right: 6px;
      box-shadow: 0 0 8px #10b981;
    }
    main { flex: 1; padding: 16px 0 40px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 16px;
    }
    .card {
      background: #131822;
      border: 1px solid #1e293b;
      border-radius: 14px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-4px); border-color: #ef4444; }
    .img-box {
      position: relative;
      aspect-ratio: 1 / 1;
      background: #0d1117;
      padding: 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .img-box img { width: 100%; height: 100%; object-fit: contain; }
    .badge {
      position: absolute; top: 10px; right: 10px;
      font-size: 11px; font-weight: 700;
      padding: 4px 8px; border-radius: 6px;
    }
    .badge-free { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-robux { background: rgba(15, 23, 42, 0.9); color: #fbbf24; border: 1px solid #334155; }
    .card-body { padding: 14px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .card-title { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-creator { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .card-footer {
      margin-top: 12px; padding-top: 10px;
      border-top: 1px solid #1e293b;
      display: flex; justify-content: space-between;
      font-size: 12px; color: #f87171; font-weight: 600;
    }
    .msg { grid-column: 1 / -1; text-align: center; padding: 60px 0; color: #94a3b8; }
    footer { border-top: 1px solid #1e293b; padding: 24px 0; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>

  <header>
    <div class="container nav">
      <div class="brand">
        <div class="logo">KB</div>
        <div>
          <h1>KNIFE <span>BLOX</span></h1>
          <p>Anlık Roblox Katalog & UGC Radarı</p>
        </div>
      </div>
      <div class="controls">
        <button id="btnAll" class="btn-active-red" onclick="setFilter(false)">Tüm Yeni Eşyalar</button>
        <button id="btnFree" class="btn-default" onclick="setFilter(true)">🔥 Sadece Ücretsiz (Free)</button>
        <button class="btn-default" onclick="loadItems()" title="Yenile">↻</button>
      </div>
    </div>
  </header>

  <div class="container">
    <div class="status-bar">
      <div><span class="live-dot"></span>Canlı veri akışı aktif (Her 45 saniyede bir güncellenir)</div>
      <div id="lastUpdated"></div>
    </div>
    <main>
      <div id="grid" class="grid"></div>
    </main>
  </div>

  <footer>
    © 2026 <strong>Knife Blox</strong>. Roblox Corporation ile resmi bir bağlantısı yoktur.
  </footer>

  <script>
    let freeOnly = false;

    function setFilter(isFree) {
      freeOnly = isFree;
      document.getElementById('btnAll').className = !isFree ? 'btn-active-red' : 'btn-default';
      document.getElementById('btnFree').className = isFree ? 'btn-active-green' : 'btn-default';
      loadItems();
    }

    async function loadItems() {
      const grid = document.getElementById('grid');
      grid.innerHTML = '<div class="msg">Roblox kataloğu taranıyor...</div>';

      try {
        const res = await fetch(`/api/items?freeOnly=${freeOnly}`);
        const data = await res.json();

        if (!data.items || data.items.length === 0) {
          grid.innerHTML = `<div class="msg">Şu an listelenecek eşya bulunamadı. ${data.debug ? '(' + data.debug + ')' : ''}</div>`;
          return;
        }

        grid.innerHTML = data.items.map(item => `
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="card">
            <div class="img-box">
              <img src="${item.image}" alt="${item.name}" loading="lazy" />
              <span class="badge ${item.isFree ? 'badge-free' : 'badge-robux'}">${item.price}</span>
            </div>
            <div class="card-body">
              <div>
                <div class="card-title" title="${item.name}">${item.name}</div>
                <div class="card-creator">Yapımcı: ${item.creator}</div>
              </div>
              <div class="card-footer">
                <span>Roblox'ta Gör</span>
                <span>↗</span>
              </div>
            </div>
          </a>
        `).join('');

        document.getElementById('lastUpdated').innerText = 'Son güncelleme: ' + new Date().toLocaleTimeString('tr-TR');
      } catch (err) {
        grid.innerHTML = `<div class="msg">Bağlantı hatası: ${err.message}</div>`;
      }
    }

    loadItems();
    setInterval(loadItems, 45000);
  </script>
</body>
</html>
