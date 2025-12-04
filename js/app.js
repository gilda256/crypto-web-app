// ===== انتخاب المنت‌های صفحه =====
const coinListDiv = document.getElementById('coinList');
const loadingDiv = document.getElementById('loading');
const adviceDiv = document.getElementById('random-advice');

if (coinListDiv && loadingDiv) {
  coinListDiv.style.display = 'none';
  loadingDiv.style.display = 'block';
}

fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log('CoinGecko data:', data);

    document.getElementById('bitcoin-price').innerText =
      `Price: $${data.bitcoin.usd}`;
    document.getElementById('bitcoin-24h').innerText =
      `24h Change: ${data.bitcoin.usd_24h_change.toFixed(2)}%`;

    document.getElementById('ethereum-price').innerText =
      `Price: $${data.ethereum.usd}`;
    document.getElementById('ethereum-24h').innerText =
      `24h Change: ${data.ethereum.usd_24h_change.toFixed(2)}%`;


    if (loadingDiv && coinListDiv) {
      loadingDiv.style.display = 'none';
      coinListDiv.style.display = 'flex';
    }
  })
  .catch(error => {
    console.error('CoinGecko API Error:', error);
    if (loadingDiv) {
      loadingDiv.innerText = 'Failed to load crypto data.';
    }
  });

fetch('https://api.adviceslip.com/advice')
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    if (data.slip && adviceDiv) {
      adviceDiv.innerText = data.slip.advice;
    }
  })
  .catch(error => {
    console.error('Advice API Error:', error);
    if (adviceDiv) {
      adviceDiv.innerText = 'Could not load advice.';
    }
  });
