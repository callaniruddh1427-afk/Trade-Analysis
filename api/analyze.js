// Yeh file Vercel pe "serverless function" ke roop me chalti hai
// Jab website se request aati hai, yeh Gemini API ko call karti hai

const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Sirf POST request allow karo
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sirf POST request allowed hai" });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query (news/event) bhejna zaroori hai" });
  }

  try {
    // GEMINI_API_KEY Vercel ke environment variable se aayega (secret rahega)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Gemini ko clear instruction dete hain - structured JSON wapas maange
    const prompt = `Tum ek Indian stock market analyst ho. Neeche diya gaya news/event padho aur batao:
1. Yeh kis sector ko affect karega (Hindi/Hinglish me 2-3 words)
2. Konsi 3-5 Indian listed companies (NSE/BSE) is se directly ya indirectly affect hongi (real company names)
3. Mechanism - kyun affect hoga (1-2 sentence, Hinglish me, simple bhasha)
4. Direction - "up", "down", ya "mixed"

News/Event: "${query}"

Sirf neeche diye gaye JSON format me jawab do, koi extra text nahi, koi markdown backticks nahi:
{
  "sector": "...",
  "companies": ["...", "...", "..."],
  "mechanism": "...",
  "direction": "up"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Gemini kabhi-kabhi ```json``` wrap kar deta hai, usko clean karte hain
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return res.status(500).json({ error: "Analysis nahi ho paya, dobara try karo" });
  }
};
