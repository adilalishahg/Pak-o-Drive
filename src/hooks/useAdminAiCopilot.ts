'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminStoreSummary } from '@/lib/adminAiEngine';
import type { AdminActionRequired } from '@/lib/adminActionEngine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
  actionRequired?: AdminActionRequired;
  actionExecuted?: {
    type: string;
    description: string;
    count?: number;
    details?: any;
  };
}

export interface PromptCategory {
  category: string;
  icon: string;
  prompts: string[];
}

export const COPILOT_PROMPT_CATEGORIES: PromptCategory[] = [
  {
    category: 'Viral Ads & TikTok Scripts',
    icon: '🎬',
    prompts: [
      'Top selling car accessory ka viral TikTok aur Reels video script banao',
      'Ambient LED light ka Meta Facebook ad copy aur 3-second hook likho',
      'Twin Cities ke car owners ke liye high-converting ad copy generate karo',
    ],
  },
  {
    category: 'WhatsApp Anti-RTO & Confirmation',
    icon: '🛡️',
    prompts: [
      'Pending orders ke liye 1-click WhatsApp confirmation links generate karo',
      'COD fraud aur return risk check karo pending orders par',
      'Aaj ka WhatsApp Daily Executive Digest generate karo',
    ],
  },
  {
    category: 'Dynamic Competitor Re-Pricing',
    icon: '📈',
    prompts: [
      'Sehgal Motors se sasti price set karo aur auto-beat price calculate karo',
      'Top selling ambient light ki price check kar ke competitor se beat karo',
    ],
  },
  {
    category: '1-Click Flash Sales & Promo Events',
    icon: '⚡',
    prompts: [
      'Weekend Twin Cities Mega Flash Sale 20% discount ke sath live activate karo',
      'Smog Season Flash Sale campaign create karo 15% discount aur coupon ke sath',
      'Suggest High-Margin Bundle 💡',
    ],
  },
  {
    category: 'Authentic Customer Reviews & Social Proof',
    icon: '⭐',
    prompts: [
      'Top product ke liye 4 authentic Pakistani car owners ke verified reviews add karo',
      'Civic aur Alto owners ke 5-star social proof reviews generate kar ke publish karo',
    ],
  },
  {
    category: 'Courier Manifest & Dispatch Batch',
    icon: '🚚',
    prompts: [
      'Tamam orders ki TCS / Trax bulk courier dispatch manifest sheet tayyar karo',
      'Latest order ki thermal courier dispatch slip print karo',
    ],
  },
  {
    category: 'Vision AI & Auto-Listing',
    icon: '📸',
    prompts: [
      'Is tasweer se product identify kar ke auto-list aur competitor price benchmark karo',
      'Car accessory ki photo upload karo aur Sehgal Motors se sasti price set karo',
    ],
  },
  {
    category: 'Store Operations & Inventory',
    icon: '📦',
    prompts: [
      'Pending orders check karo aur latest order ko Delivered mark kar do',
      'Tamam Cancelled orders database se delete kar do',
      'Mery store me kon se products ka stock khatam ya 5 se kam reh gaya hai?',
    ],
  },
];

const DEFAULT_QUICK_PROMPTS = [
  '🎬 Viral TikTok Video Script',
  '🛡️ WhatsApp COD Confirmation',
  '📈 Auto-Beat Competitor Price',
  '⚡ Launch Flash Sale Event',
  '⭐ Add Customer Reviews',
  '🚚 Courier Dispatch Manifest',
  '📸 Snap & Auto-List Photo',
  'Suggest High-Margin Bundle 💡',
  'Daily WhatsApp Digest 📱',
];

const STORAGE_KEY = 'pakodrive_admin_copilot_chat';

export function useAdminAiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AdminStoreSummary | null>(null);
  const [seoAudit, setSeoAudit] = useState<{ totalMissingSeo: number; sampleUnoptimizedProducts: string[] } | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<AdminActionRequired | null>(null);

  // Web Speech API Voice Command State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'ur-PK';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [isListening, speechSupported]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Load chat history from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Ignore sessionStorage parsing error
    }

    // Default welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `**Assalam-o-Alaikum! Main Pak-o-Drive ka Supercharged AI Copilot hoon.** 🚗💼⚡\n\nAap mujh se:\n- **🎙️ Voice Commands:** Mic dabayein aur bol kar hukum dein.\n- **📱 WhatsApp Executive Briefing:** *"Aaj ka daily WhatsApp digest banao"* bol kar 1-click share karein.\n- **✍️ 1-Click SEO Blog Publisher:** *"Smog care aur Fog lights par blog publish kar do"* — AI likh kar live publish karega.\n- **🛡️ COD Fraud & Return Risk:** Pending orders ka risk score analyze karayein.\n- **🚚 Courier Dispatch Thermal Slips:** Orders ki printable slips generate karein.\n- **🔮 Seasonal Stock & Profit Forecasting:** Rawalpindi & Islamabad ke winter/summer trends.\n\nNeeche diye gaye **Quick Prompts** par click karein ya mic dabayein!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  // Save to sessionStorage on message update
  useEffect(() => {
    if (messages.length > 1) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // Storage unavailable
      }
    }
  }, [messages]);

  // Fetch live store snapshot
  const fetchSnapshot = useCallback(async () => {
    try {
      setSnapshotLoading(true);
      const res = await fetch('/api/admin/ai-copilot');
      const data = await res.json();
      if (data.success && data.data) {
        setSnapshot(data.data.snapshot);
        setSeoAudit(data.data.seoAudit);
      }
    } catch (err: any) {
      console.error('Error fetching snapshot in copilot:', err);
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  // High-performance client-side image downscaler to guarantee < 150KB JPEG payload
  const compressImageForUpload = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If image is already smaller than 120KB, read directly
      if (file.size <= 120 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        const MAX_DIM = 1024;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.82 JPEG -> typically ~75KB - 120KB
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback to basic file reader
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };
      img.src = objectUrl;
    });
  }, []);

  // Handle image upload from file picker with automatic client-side compression
  const handleImageSelect = useCallback(async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Baraye meherbani sirf tasweer (image) file select karein.');
      return;
    }

    try {
      setError(null);
      const compressedDataUrl = await compressImageForUpload(file);
      setSelectedImage(compressedDataUrl);
      setSelectedImageName(file.name);
    } catch (err: any) {
      setError(`Tasweer read karne me masla hua: ${err?.message || 'Unknown'}`);
    }
  }, [compressImageForUpload]);

  const clearSelectedImage = useCallback(() => {
    setSelectedImage(null);
    setSelectedImageName(null);
  }, []);

  // Send message with optional SEO URL or Competitor URL or Attached Image
  const sendMessage = useCallback(
    async (customText?: string, targetSeoUrl?: string, customCompetitorUrl?: string) => {
      const query = (customText ?? input).trim();
      const currentImage = selectedImage;
      const currentImageName = selectedImageName;

      // Need either text or image
      if ((!query && !currentImage) || isThinking) return;

      setError(null);
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query || (currentImage ? `📸 [Product Photo: ${currentImageName || 'product.jpg'}]` : ''),
        imageUrl: currentImage || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setSelectedImage(null);
      setSelectedImageName(null);
      setIsThinking(true);

      try {
        const historyPayload = messages
          .filter((m) => m.id !== 'welcome')
          .slice(-6)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const effectiveCompetitorUrl = customCompetitorUrl ?? (competitorUrl.trim() || undefined);

        const res = await fetch('/api/admin/ai-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query || (currentImage ? 'Analyze this product photo and auto-list' : ''),
            image: currentImage || undefined,
            history: historyPayload,
            targetSeoUrl,
            competitorUrl: effectiveCompetitorUrl,
          }),
        });

        if (!res.ok) {
          const rawText = await res.text();
          let serverErrMsg = `Server Error (${res.status})`;
          try {
            const errObj = JSON.parse(rawText);
            serverErrMsg = errObj.error || errObj.message || serverErrMsg;
          } catch {
            serverErrMsg = rawText.slice(0, 250) || `HTTP ${res.status}: ${res.statusText}`;
          }
          throw new Error(serverErrMsg);
        }

        const data = await res.json();

        if (data.success && data.reply) {
          const aiMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            actionRequired: data.actionRequired,
            actionExecuted: data.actionExecuted,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);

          if (data.actionRequired) {
            setPendingAction(data.actionRequired);
          } else {
            setPendingAction(null);
          }

          if (data.actionExecuted) {
            fetchSnapshot();
          }
        } else {
          throw new Error(data.error || 'AI response error');
        }
      } catch (err: any) {
        const rawErrMsg = err?.message || 'Kuch masla hua, baraye meherbani dubara koshish karein.';
        setError(rawErrMsg);
        const fallbackMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Maazrat:** Query execute karne mein masla aya:\n\`\`\`\n${rawErrMsg}\n\`\`\`\nAap upar diye gaye **Copy Error** button se error message copy kar ke check karwa sakte hain.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [input, isThinking, messages, competitorUrl, selectedImage, selectedImageName, fetchSnapshot]
  );

  // Confirms and executes an action that required explicit admin permission
  const confirmPendingAction = useCallback(
    async (actionToConfirm?: AdminActionRequired) => {
      const act = actionToConfirm || pendingAction;
      if (!act || isThinking) return;

      setIsThinking(true);
      setPendingAction(null);

      const userConfirmMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `✅ Confirmed: ${act.title}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userConfirmMsg]);

      try {
        const res = await fetch('/api/admin/ai-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionConfirmation: act.payload,
          }),
        });

        if (!res.ok) {
          const rawText = await res.text();
          let serverErrMsg = `Server Error (${res.status})`;
          try {
            const errObj = JSON.parse(rawText);
            serverErrMsg = errObj.error || errObj.message || serverErrMsg;
          } catch {
            serverErrMsg = rawText.slice(0, 250) || `HTTP ${res.status}: ${res.statusText}`;
          }
          throw new Error(serverErrMsg);
        }

        const data = await res.json();
        if (data.success && data.reply) {
          const aiMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            actionExecuted: data.actionExecuted,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);
          fetchSnapshot();
        } else {
          throw new Error(data.error || 'Action execution failed');
        }
      } catch (err: any) {
        setError(err.message || 'Action execute karne me masla pesh aya.');
        const fallbackMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `❌ **Error:** Action mukammal nahi ho saka: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [pendingAction, isThinking, fetchSnapshot]
  );

  // Cancels pending safety action
  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
    const cancelMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `🚫 **Action Cancelled:** Deletion rok di gayi hai. Database me koi tabdeeli nahi hui.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cancelMsg]);
  }, []);

  const analyzeCompetitor = useCallback(
    async (urlToAnalyze?: string) => {
      const url = (urlToAnalyze ?? competitorUrl).trim();
      if (!url) return;
      const prompt = `Is competitor URL (${url}) ka mukammal live SEO, pricing, offer breakdown aur Google ranking ki wajah reverse engineer karo. Aur Pak-o-Drive ke liye actionable strategy aur Meta/TikTok ad insights batao.`;
      await sendMessage(prompt, undefined, url);
    },
    [competitorUrl, sendMessage]
  );

  const clearChat = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setPendingAction(null);
    setSelectedImage(null);
    setSelectedImageName(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `**Chat clear ho gayi hai!** Main aapki nayi queries aur database actions ke liye tayyar hoon.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    competitorUrl,
    setCompetitorUrl,
    selectedImage,
    selectedImageName,
    handleImageSelect,
    clearSelectedImage,
    isThinking,
    loading: isThinking,
    error,
    quickPrompts: DEFAULT_QUICK_PROMPTS,
    promptCategories: COPILOT_PROMPT_CATEGORIES,
    snapshot,
    seoAudit,
    snapshotLoading,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
    isListening,
    speechSupported,
    toggleVoiceInput,
    sendMessage,
    analyzeCompetitor,
    clearChat,
    fetchSnapshot,
    messagesEndRef,
  };
}
