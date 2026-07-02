const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Add GEMINI_API_KEY in Vercel Settings → Environment Variables, then redeploy.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an Indian stock market analyst. Analyze this news/event and respond ONLY with valid JSON (no markdown, no backticks, no explanation):

News: "${query}"

Return exactly this JSON structure:
{
  "sector": "2-3 word sector name",
  "companies": ["Company1", "Company2", "Company3", "Company4"],
  "mechanism": "1-2 sentence explanation of why and how these stocks are affected",
  "direction": "up"
}

Rules:
- companies must be real NSE/BSE listed Indian companies
- direction must be exactly "up", "down", or "mixed"
- No markdown, no backticks, only raw JSON`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
};
