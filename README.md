# Stock News Impact App

Yeh app news/event daalne pe Gemini AI se batata hai ki kis sector/company pe asar padega.

## Files kya karti hain

- `public/index.html` — website jo user dekhega (search box, results)
- `api/analyze.js` — backend jo Gemini AI ko call karta hai (yeh user ko nahi dikhta)
- `vercel.json` — Vercel ko batata hai kaise deploy karna hai

## Vercel pe deploy karne ke steps

### 1. GitHub pe code daalo (Vercel GitHub se connect hota hai)
- github.com pe jaake naya repository banao (jaise "stock-impact-app")
- Is poore folder ka code wahan upload karo

### 2. Vercel pe account banao
- vercel.com pe jaake "Sign up" karo (GitHub account se login kar sakte ho, easy hai)

### 3. Project import karo
- Vercel dashboard me "Add New Project" pe click karo
- Apni GitHub repository select karo ("stock-impact-app")
- "Import" pe click karo

### 4. Environment Variable daalo (SABSE IMPORTANT STEP)
- Deploy karne se pehle, "Environment Variables" section me jaake:
  - Name: `GEMINI_API_KEY`
  - Value: (apni Gemini API key paste karo jo AI Studio se li thi)
- "Add" pe click karo

### 5. Deploy pe click karo
- Vercel khud sab setup kar dega
- 1-2 minute me tera website live ho jayega, ek link milega (jaise `stock-impact-app.vercel.app`)

## Important baat

- API key kabhi bhi code ke andar mat likhna (jaise index.html ya analyze.js me) — yeh sirf Vercel ke Environment Variable me jaani chahiye, taaki koi dekh na sake
- Free Gemini tier: roz 1500 requests milte hain, roz reset hote hain
