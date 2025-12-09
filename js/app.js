
const coinListDiv = document.getElementById('coinList');
const loadingDiv = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const adviceDiv = document.getElementById('random-advice');
const searchInput = document.getElementById('searchInput');

const COIN_IDS = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'solana',
  'ripple',
  'cardano',
  'dogecoin',
  'litecoin',
  'shiba-inu'
];

const COIN_DISPLAY_NAMES = {
  bitcoin: 'Bitcoin (BTC)',
  ethereum: 'Ethereum (ETH)',
  binancecoin: 'BNB (BNB)',
  solana: 'Solana (SOL)',
  ripple: 'XRP (XRP)',
  cardano: 'Cardano (ADA)',
  dogecoin: 'Dogecoin (DOGE)',
  litecoin: 'Litecoin (LTC)',
  'shiba-inu': 'Shiba Inu (SHIB)'
};

const API = {

  fetchCoinsMarket(coinIds, vsCurrency = 'usd') {
    const ids = coinIds.join(',');
    const url =
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${ids}`;
    return fetch(url).then(response => {
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      return response.json();
    });
  },

  fetchCoinHistory(coinId, vsCurrency = 'usd', days = 7) {
    const url =
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=daily`;
    return fetch(url).then(response => {
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      return response.json();
    });
  },

  fetchRandomAdvice() {
    return fetch('https://api.adviceslip.com/advice').then(response => {
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      return response.json();
    });
  }
};

const Favorites = {
  KEY: 'favoriteCoins',

  getAll() {
    const json = localStorage.getItem(this.KEY);
    return json ? JSON.parse(json) : [];
  },

  save(list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  toggle(coinId) {
    const list = this.getAll();
    const index = list.indexOf(coinId);
    if (index === -1) {
      list.push(coinId);
    } else {
      list.splice(index, 1);
    }
    this.save(list);
    return list;
  },

  isFavorite(coinId) {
    return this.getAll().includes(coinId);
  }
};

const ChartModule = {
  drawSimpleLine(canvasId, points) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !points.length) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const prices = points.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const normalize = price =>
      height - ((price - min) / (max - min || 1)) * (height - 20) - 10;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#1E88E5';
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((p, index) => {
      const x = (width / (points.length - 1 || 1)) * index;
      const y = normalize(p.price);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }
};

function renderCoinCards(coins) {
  if (!coinListDiv) return;
  coinListDiv.innerHTML = '';

  coins.forEach(coin => {
    const card = document.createElement('div');
    card.className = 'coin-card';
    card.id = coin.id;

    card.innerHTML = `
      <h2>${COIN_DISPLAY_NAMES[coin.id] || coin.name}</h2>
      <p>Price: $${coin.current_price}</p>
      <p>24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%</p>
      <p>24h High/Low: $${coin.high_24h} / $${coin.low_24h}</p>
      <p>24h Volume: ${coin.total_volume}</p>
      <p>Market Cap: ${coin.market_cap}</p>
      <p>Circulating / Max: ${coin.circulating_supply} / ${coin.max_supply}</p>
      <button class="fav-btn" data-coin="${coin.id}">★ Favorite</button>
      <button class="chart-btn" data-coin="${coin.id}">View Chart</button>
    `;

    coinListDiv.appendChild(card);
  });
}

function setupFavoriteButtons() {
  const favButtons = document.querySelectorAll('.fav-btn');
  favButtons.forEach(btn => {
    const coinId = btn.dataset.coin;

    if (Favorites.isFavorite(coinId)) {
      btn.classList.add('active');
      btn.textContent = '★ Favorited';
    }

    btn.addEventListener('click', () => {
      Favorites.toggle(coinId);
      btn.classList.toggle('active');
      btn.textContent = btn.classList.contains('active')
        ? '★ Favorited'
        : '★ Favorite';
    });
  });
}

function setupChartButtons() {
  const chartButtons = document.querySelectorAll('.chart-btn');
  chartButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const coinId = btn.dataset.coin;
      loadHistoryForCoin(coinId);
    });
  });
}

function setupSearch() {
  if (!searchInput) return;
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.coin-card');
    cards.forEach(card => {
      const title = card.querySelector('h2').innerText.toLowerCase();
      card.style.display = title.includes(term) ? 'block' : 'none';
    });
  });
}

function loadHistoryForCoin(coinId) {
  API.fetchCoinHistory(coinId, 'usd', 7)
    .then(history => {
      const listEl = document.getElementById('btc-history-list');
      const titleEl = document.getElementById('history-title');
      if (!listEl) return;
      listEl.innerHTML = '';

      if (titleEl) {
        const label = COIN_DISPLAY_NAMES[coinId] || coinId;
        titleEl.textContent = `${label} - last 7 days`;
      }

      const points = history.prices.map(([ts, price]) => {
        const date = new Date(ts);
        const label = date.toLocaleDateString();
        const li = document.createElement('li');
        li.textContent = `${label} - $${price.toFixed(2)}`;
        listEl.appendChild(li);
        return { time: label, price };
      });

      ChartModule.drawSimpleLine('btc-chart', points);
    })
    .catch(error => {
      console.error('History API Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  if (coinListDiv && loadingDiv) {
    coinListDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
  }

  API.fetchRandomAdvice()
    .then(data => {
      if (data.slip && loadingText) {
        loadingText.innerText = data.slip.advice;
      }
      if (data.slip && adviceDiv) {
        adviceDiv.innerText = data.slip.advice;
      }
    })
    .catch(() => {
      if (loadingText) {
        loadingText.innerText = 'Loading crypto data...';
      }
      if (adviceDiv) {
        adviceDiv.innerText = 'Could not load advice.';
      }
    });

  API.fetchCoinsMarket(COIN_IDS, 'usd')
    .then(list => {
      renderCoinCards(list);

      if (loadingDiv && coinListDiv) {
        loadingDiv.style.display = 'none';
        coinListDiv.style.display = 'flex';
      }

      setupFavoriteButtons();
      setupSearch();
      setupChartButtons();
    })
    .catch(error => {
      console.error('CoinGecko API Error:', error);
      if (loadingText) {
        loadingText.innerText = 'Failed to load crypto data.';
      }
    });

  loadHistoryForCoin('bitcoin');
});
