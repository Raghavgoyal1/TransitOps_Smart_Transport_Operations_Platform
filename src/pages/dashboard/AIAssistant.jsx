wimport { useState, useRef, useEffect } from \"react\";
import { PageHeader } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Bot, Send, User, Sparkles, Loader2 } from \"lucide-react\";
import { motion } from \"framer-motion\";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SUGGESTIONS = [
  \"How many vehicles are running right now?\",
  \"Which drivers have the best performance scores?\",
  \"Predict fuel cost for next week\",
  \"Summarize today's fleet operations\",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: \"assistant\", content: \"Hi! I'm TransitOps AI. Ask me anything about your fleet, trips, drivers, or analytics.\" },
  ]);
  const [input, setInput] = useState(\"\");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: \"smooth\" });
  }, [messages, loading]);

  const send = async (msg) => {
    const text = msg || input;
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: \"user\", content: text }]);
    setInput(\"\");
    setLoading(true);
    let assistantText = \"\";
    setMessages((m) => [...m, { role: \"assistant\", content: \"\" }]);

    try {
      const token = localStorage.getItem(\"transitops_token\");
      const resp = await fetch(`${API}/ai/chat`, {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = \"\";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split(\"

\");
        buffer = chunks.pop() || \"\";
        for (const chunk of chunks) {
          if (!chunk.startsWith(\"data: \")) continue;
          const data = chunk.slice(6);
          if (data.startsWith(\"[DONE:\")) {
            setSessionId(data.match(/\[DONE:(.*?)\]/)?.[1]);
            continue;
          }
          if (data.startsWith(\"[error:\")) {
            assistantText += `

[Error: ${data}]`;
          } else {
            assistantText += data;
          }
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: \"assistant\", content: assistantText };
            return copy;
          });
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: \"assistant\", content: \"Sorry, I encountered an error.\" };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"space-y-4\">
      <PageHeader title=\"AI Assistant\" subtitle=\"Powered by GPT-5.2 · Fleet-aware\" testId=\"ai-header\" />

      <Card className=\"flex h-[calc(100vh-14rem)] flex-col border-white/10 bg-white/[0.02]\" data-testid=\"ai-chat-card\">
        <div ref={scrollRef} className=\"flex-1 space-y-4 overflow-y-auto p-6\">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === \"user\" ? \"justify-end\" : \"\"}`}>
              {m.role === \"assistant\" && (
                <div className=\"grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-emerald-500\">
                  <Bot className=\"h-4 w-4 text-white\" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${m.role === \"user\" ? \"bg-blue-600 text-white\" : \"bg-white/[0.04] border border-white/5\"}`} data-testid={`msg-${i}`}>
                <div className=\"whitespace-pre-wrap\">{m.content || (loading && i === messages.length - 1 ? <Loader2 className=\"h-4 w-4 animate-spin\" /> : \"\")}</div>
              </div>
              {m.role === \"user\" && (
                <div className=\"grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/10\"><User className=\"h-4 w-4\" /></div>
              )}
            </motion.div>
          ))}
        </div>

        {messages.length <= 1 && (
          <div className=\"border-t border-white/5 px-6 py-3\">
            <div className=\"mb-2 text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1\"><Sparkles className=\"h-3 w-3\" /> Try asking</div>
            <div className=\"flex flex-wrap gap-2\">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className=\"rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-300 hover:border-blue-500/40 hover:text-white\" data-testid={`suggestion-${s.slice(0, 10)}`}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className=\"border-t border-white/5 p-4\">
          <div className=\"flex gap-2\">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === \"Enter\" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder=\"Ask about your fleet...\"
              disabled={loading}
              className=\"border-white/10 bg-black/40\"
              data-testid=\"ai-input\"
            />
            <Button onClick={() => send()} disabled={loading || !input.trim()} className=\"bg-blue-600 hover:bg-blue-500\" data-testid=\"ai-send-btn\">
              {loading ? <Loader2 className=\"h-4 w-4 animate-spin\" /> : <Send className=\"h-4 w-4\" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
