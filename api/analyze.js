module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Add GROQ_API_KEY in Vercel Settings → Environment Variables, then redeploy.' });
  }

  try {
    const prompt = `You are an Indian stock market analyst with deep knowledge of historical market events. Analyze this news/event and respond ONLY with valid JSON (no markdown, no backticks, no explanation):

News: "${query}"

Return exactly this JSON structure:
{
  "sector": "2-3 word sector name",
  "companies": ["Company1", "Company2", "Company3", "Company4"],
  "mechanism": "1-2 sentence explanation of why and how these stocks are affected",
  "historicalPrecedent": "Describe a REAL similar past event and what actually happened to relevant stocks/sectors then. Be specific with real company names, approximate percentage moves, and timeframes if you know them. If no close precedent exists, say so honestly and explain the closest analogous situation.",
  "primaryTicker": "The NSE ticker symbol (without .NS suffix) of the single most relevant/liquid company from your companies list, e.g. RELIANCE, TCS, DIXON, ZEEL",
  "direction": "up"
}

Rules:
- companies must be real NSE/BSE listed Indian companies
- primaryTicker must be a valid NSE symbol for one of the companies listed
- direction must be exactly "up", "down", or "mixed"
- historicalPrecedent must reference REAL past events, not hypothetical ones — be honest if you're not fully certain of exact numbers, use "approximately" or "around"
- No markdown, no backticks, only raw JSON`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return res.status(500).json({ error: 'Analysis failed. Please try again.' });
    }

    const data = await response.json();
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
};
