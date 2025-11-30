import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, MessageSquare, Sparkles } from "lucide-react";
import api from "../services/api";

export default function ProjectChat({ projectId, open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(`/api/ai/chat/${projectId}`, { message: text });
      const reply = res.data?.reply || "Sem resposta.";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("Erro no chat:", err);
      const errorMsg = err.response?.data?.error || "Erro ao gerar resposta.";
      setMessages((m) => [...m, { role: "assistant", text: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] z-40 transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="h-full flex flex-col bg-[#0b0f14] border-l border-[#2C2C3C] shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#2C2C3C] bg-linear-to-r from-[#7C5DFA]/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#7C5DFA] to-[#6C4FE0] rounded-xl flex items-center justify-center shadow-lg shadow-[#7C5DFA]/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  Chat com IA
                </h3>
                <p className="text-xs text-gray-400">Assistente de Documentação</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 bg-linear-to-br from-[#7C5DFA]/20 to-[#6C4FE0]/20 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-[#7C5DFA]" />
                </div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Como posso ajudar?
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pergunte sobre endpoints, parâmetros, exemplos de requisição ou qualquer dúvida sobre a documentação da API.
                </p>
              </div>
            )}

            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-linear-to-br from-[#7C5DFA] to-[#6C4FE0] text-white shadow-lg shadow-[#7C5DFA]/20"
                      : m.isError
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-[#16181D] text-gray-200 border border-[#2C2C3C]"
                  }`}
                >
                  <pre className="whitespace-pre-wrap wrap-break-word font-sans">
                    {m.text}
                  </pre>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#16181D] border border-[#2C2C3C] rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#7C5DFA]" />
                  <span className="text-sm text-gray-400">Gerando resposta...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-[#2C2C3C] bg-[#0b0f14]">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Pergunte sobre endpoints, exemplos, parâmetros..."
                rows={1}
                disabled={loading}
                className="w-full resize-none bg-[#16181D] text-sm text-white placeholder-gray-500 pl-4 pr-12 py-3 rounded-xl border border-[#2C2C3C] focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-32 overflow-y-auto"
                style={{ 
                  minHeight: '44px',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 bottom-2 p-2 bg-linear-to-br from-[#7C5DFA] to-[#6C4FE0] hover:from-[#6C4FE0] hover:to-[#7C5DFA] text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#7C5DFA]/20 hover:shadow-[#7C5DFA]/40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Pressione <kbd className="px-1.5 py-0.5 bg-[#16181D] border border-[#2C2C3C] rounded text-xs">Enter</kbd> para enviar, <kbd className="px-1.5 py-0.5 bg-[#16181D] border border-[#2C2C3C] rounded text-xs">Shift + Enter</kbd> para nova linha
            </p>
          </div>
        </div>
      </div>
    </>
  );
}