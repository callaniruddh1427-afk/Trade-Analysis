module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  try {
    const ticker = `${symbol.toUpperCase()}.NS`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1mo&interval=1d`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Stock data not found', found: false });
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: 'No data available for this symbol', found: false });
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];

    const points = timestamps
      .map((t, i) => ({
        date: new Date(t * 1000).toISOString().split('T')[0],
        close: closes[i]
      }))
      .filter(p => p.close !== null && p.close !== undefined);

    if (points.length === 0) {
      return res.status(404).json({ error: 'No valid price data', found: false });
    }

    return res.status(200).json({
      found: true,
      symbol: ticker,
      companyName: result.meta?.longName || symbol,
      currency: result.meta?.currency || 'INR',
      points
    });

  } catch (error) {
    console.error('Stock data error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch stock data', found: false });
  }
};
