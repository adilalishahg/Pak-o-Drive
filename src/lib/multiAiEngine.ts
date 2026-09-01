/**
 * Multi-Provider AI Fallback Engine for Pak-o-Drive
 * Zero-Downtime Waterfall: Google Gemini ➔ Hugging Face ➔ Groq ➔ AWS Bedrock / OpenRouter
 */

export interface AIProviderStatus {
  name: string;
  isAvailable: boolean;
  coolingDownUntil?: number;
  lastError?: string;
}

const providerCoolingDown = new Map<string, number>();

function isCoolingDown(provider: string): boolean {
  const expiry = providerCoolingDown.get(provider);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    providerCoolingDown.delete(provider);
    return false;
  }
  return true;
}

function setCoolingDown(provider: string, durationMs = 5 * 60 * 1000) {
  providerCoolingDown.set(provider, Date.now() + durationMs);
}

/**
 * Clean AI response from any chain-of-thought or markdown leaks
 */
function cleanAiResponse(text: string): string {
  if (!text) return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^\*\*Reasoning:\*\*[\s\S]*?\n\n/gi, '')
    .replace(/^Reasoning:[\s\S]*?\n\n/gi, '')
    .trim();
}

/**
 * 1. Google Gemini Provider
 */
async function callGemini(systemPrompt: string, userMessage: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
  if (!apiKey || isCoolingDown('gemini')) return null;

  const versions = ['v1beta', 'v1'];
  const models = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-2.5-pro',
  ];
  const prompt = `${systemPrompt}\n\nCustomer: "${userMessage}"\n\nReply as Ali (Pak-o-Drive):`;

  for (const ver of versions) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleaned = cleanAiResponse(text);
            if (cleaned) {
              console.log(`✅ [AI Engine: Gemini] Generated reply via ${model} (${ver})`);
              return cleaned;
            }
          }
        } else {
          if (res.status === 429 || res.status === 402 || res.status === 403) {
            console.warn(`⚠️ [AI Engine: Gemini Quota/Billing ${res.status}] Cooling down Gemini for 5 mins.`);
            setCoolingDown('gemini', 5 * 60 * 1000);
            return null;
          }
        }
      } catch (err: any) {
        // Continue to next model
      }
    }
  }
  return null;
}

/**
 * 2. Hugging Face Inference API / Router
 */
async function callHuggingFace(systemPrompt: string, userMessage: string): Promise<string | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!apiKey || isCoolingDown('huggingface')) return null;

  const models = [
    process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.3-70B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'microsoft/Phi-3.5-mini-instruct',
  ];

  for (const model of models) {
    try {
      const url = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.6,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          const cleaned = cleanAiResponse(text);
          if (cleaned) {
            console.log(`✅ [AI Engine: Hugging Face] Generated reply via ${model}`);
            return cleaned;
          }
        }
      } else {
        if (res.status === 401 || res.status === 402) {
          setCoolingDown('huggingface', 5 * 60 * 1000);
          return null;
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ [AI Engine: Hugging Face Error]:`, err.message);
    }
  }
  return null;
}

/**
 * 3. Groq Cloud Ultra-Fast Provider
 */
async function callGroq(systemPrompt: string, userMessage: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || isCoolingDown('groq')) return null;

  const models = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'groq/compound-mini',
    'qwen/qwen3.6-27b',
  ];

  for (const model of models) {
    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.6,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          const cleaned = cleanAiResponse(text);
          if (cleaned) {
            console.log(`✅ [AI Engine: Groq] Generated reply via ${model}`);
            return cleaned;
          }
        }
      } else {
        if (res.status === 429 || res.status === 401) {
          setCoolingDown('groq', 5 * 60 * 1000);
          return null;
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ [AI Engine: Groq Error]:`, err.message);
    }
  }
  return null;
}

/**
 * 4. Master AI Dispatcher with Sequential Waterfall Fallback
 */
export async function callMultiProviderAI(
  systemPrompt: string,
  userMessage: string
): Promise<{ text: string | null; provider: string }> {
  // 1. Try Google Gemini
  const geminiText = await callGemini(systemPrompt, userMessage);
  if (geminiText) return { text: geminiText, provider: 'gemini' };

  // 2. Try Groq (Ultra-Fast 500ms response)
  const groqText = await callGroq(systemPrompt, userMessage);
  if (groqText) return { text: groqText, provider: 'groq' };

  // 3. Try Hugging Face
  const hfText = await callHuggingFace(systemPrompt, userMessage);
  if (hfText) return { text: hfText, provider: 'huggingface' };

  return { text: null, provider: 'none' };
}

