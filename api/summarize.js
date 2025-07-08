export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, type } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY || !text) {
    return res.status(400).json({ error: 'Missing API key or text' });
  }

  const prompts = {
    brief: `Provide a brief summary (2-3 sentences) of the following article:\n\n${text}`,
    detailed: `Provide a detailed summary covering all main points:\n\n${text}`,
    bullets: `Summarize this article in 5-7 key points. Use "- " for each point:\n\n${text}`
  };

  const prompt = prompts[type] || prompts.brief;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2
          }
        })
      }
    );

    const data = await response.json();
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Failed to fetch from Gemini API' });
  }
}
