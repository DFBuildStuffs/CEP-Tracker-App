import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Gemini Chat Endpoint
interface ChatMessagePayload {
  role: 'user' | 'model';
  text: string;
}

app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      model = 'gemini-3.8-flash',
      systemInstruction = 'You are an expert engineering board exam coach and CEP tutor.',
    } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A valid text message is required.' });
    }

    const ai = getAI();

    // If Gemini API Key is not configured, provide an intelligent offline tutor response
    if (!ai) {
      return res.json({
        text: `### 🎓 CEP Board Exam Coaching Assistant\n\nThank you for asking: **"${message.trim()}"**\n\n> ⚠️ *Note: To connect live Gemini AI responses, provide your \`GEMINI_API_KEY\` in your environment settings.*\n\nHere is your board review tip for this topic:\n- **Problem-Solving Strategy**: Always identify given parameters, target values, and state fundamental governing formulas with SI units before solving.\n- **CEP Benchmark Requirement**: Ensure you clear your initial pass threshold (e.g., 65%) then maintain at least 45% in all consecutive exam stages.\n- **Mockboard Tip**: Time yourself strictly at 1.5 to 2 minutes per item.`,
        modelUsed: 'offline-academic-mode',
        timestamp: new Date().toISOString(),
      });
    }

    // Build alternating message array compliant with Gemini API (first must be user, strict alternating turns)
    const rawList: Array<{ role: 'user' | 'model'; text: string }> = [];

    if (Array.isArray(history)) {
      for (const item of history as ChatMessagePayload[]) {
        if (item && typeof item.text === 'string' && item.text.trim()) {
          const r = item.role === 'model' ? 'model' : 'user';
          rawList.push({ role: r, text: item.text.trim() });
        }
      }
    }
    rawList.push({ role: 'user', text: message.trim() });

    // Filter out leading model turns and merge consecutive turns with same role
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const item of rawList) {
      if (contents.length === 0) {
        if (item.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        }
      } else {
        const prev = contents[contents.length - 1];
        if (prev.role === item.role) {
          prev.parts[0].text += `\n\n${item.text}`;
        } else {
          contents.push({ role: item.role, parts: [{ text: item.text }] });
        }
      }
    }

    // If contents somehow empty, provide current user prompt
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: message.trim() }] });
    }

    // Ensure system instruction emphasizes LaTeX formatting and structured engineering solutions
    const enhancedSystemInstruction = `${systemInstruction || 'You are an engineering board exam review tutor.'}
CRITICAL FORMATTING REQUIREMENT: Always write mathematical formulas, equations, and expressions using standard LaTeX syntax.
- Use inline $...$ for inline expressions (e.g. $F = ma$, $\\sigma = \\frac{P}{A}$, $I = \\frac{bh^3}{12}$, $V = IR$).
- Use block $$...$$ for display formulas and step-by-step derivations.
- Keep solutions concise, structured, and free of unnecessary fluff.`;

    // Fast, free, low-traffic models prioritized:
    // 'gemini-3.1-flash-lite' is the fastest and least congested free model.
    const requestedModel = model && ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'].includes(model)
      ? model
      : 'gemini-3.1-flash-lite';

    // Limit history to last 6 turns to keep payload lightweight and avoid context overflows
    const recentHistory = contents.slice(-6);

    let responseText = '';
    let usedModel = requestedModel;

    try {
      const response = await ai.models.generateContent({
        model: requestedModel,
        contents: recentHistory,
        config: {
          systemInstruction: enhancedSystemInstruction,
          temperature: 0.5,
        },
      });
      responseText = response.text || '';
    } catch (modelErr: any) {
      console.warn(`Primary model ${requestedModel} encountered error, trying fallback gemini-3.8-flash:`, modelErr?.message);
      usedModel = 'gemini-3.8-flash';
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: recentHistory,
        config: {
          systemInstruction: enhancedSystemInstruction,
          temperature: 0.5,
        },
      });
      responseText = fallbackResponse.text || '';
    }

    if (!responseText) {
      responseText = 'I could not generate an answer. Please rephrase or specify the engineering problem you would like to solve.';
    }

    return res.json({
      text: responseText,
      modelUsed: usedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errorMessage = error?.message || 'Failed to communicate with Gemini API';
    return res.json({
      text: `### ⚠️ Tutor Connection Update\n\nWe encountered a temporary issue reaching the Gemini model (${errorMessage}).\n\nPlease check your question or retry in a moment. In the meantime, remember to focus on high-yield formulas and practice standard mock exam problems!`,
      modelUsed: 'fallback-handler',
      timestamp: new Date().toISOString(),
    });
  }
});

async function startServer() {
  // Vite dev middleware vs static production files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CEP Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
