
const coinListDiv = document.getElementById('coinList');
const loadingDiv = document.getElementById('loading');

// CoinGecko API
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usdt&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true')
  .then(response => response.json())
  .then(data => {
    
    document.getElementById('bitcoin-price').innerText = `Price: $${data.bitcoin.usdt}`;
    document.getElementById('bitcoin-24h').innerText = `24h Change: ${data.bitcoin.usdt_24h_change.toFixed(2)}%`;
    document.getElementById('bitcoin-highlow').innerText = `High: $${data.bitcoin.usdt_24h_high}, Low: $${data.bitcoin.usdt_24h_low}`;

    document.getElementById('ethereum-price').innerText = `Price: $${data.ethereum.usdt}`;
    document.getElementById('ethereum-24h').innerText = `24h Change: ${data.ethereum.usdt_24h_change.toFixed(2)}%`;
    document.getElementById('ethereum-highlow').innerText = `High: $${data.ethereum.usdt_24h_high}, Low: $${data.ethereum.usdt_24h_low}`;

    loadingDiv.style.display = 'none';
    coinListDiv.style.display = 'flex';
  })
  .catch(error => console.error("CoinGecko API Error:", error));

// Numbers API
const randomNumber = Math.floor(Math.random() * 100) + 1;

fetch(`http://numbersapi.com/${randomNumber}`)
  .then(response => response.text())
  .then(fact => {
    document.getElementById('number-fact').innerText = fact;
  })
  .catch(error => console.error("Numbers API Error:", error));
