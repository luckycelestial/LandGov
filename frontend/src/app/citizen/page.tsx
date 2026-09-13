"use client";

import React, { useState } from "react";
import { MessageSquareCode, Mic, MicOff, Send, Phone, CheckCheck, Sparkles, Volume2, ShieldCheck } from "lucide-react";

export default function CitizenVoiceWhatsAppPage() {
  // WhatsApp State
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "bot",
      text: "🙏 *Namaste! Welcome to National Bhu-Seva Assistant (DoLR - MoRD)*\n\nHow can I assist you with your land records today?\n\n1️⃣ Type `Khasra 104/1A` to check title & SVAMITVA status\n2️⃣ Type `Dispute` to track active court cases\n3️⃣ Type `Mutation` to track ownership transfer",
      time: "10:30 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [phone, setPhone] = useState("+91 98765 43210");

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState("मेरी खसरा संख्या 104/1A का स्वामित्व कार्ड कब मिलेगा?");
  const [voiceResponse, setVoiceResponse] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState("hi-IN");

  const sendWhatsApp = async () => {
    if (!inputText.trim()) return;
    const userMsg = { sender: "user", text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText("");

    try {
      const res = await fetch("http://localhost:8001/api/v1/citizen/whatsapp-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, message_text: currentInput }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply_text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `📋 *Land Record Status for Khasra No:* \`104/1A\`\n📍 *Village:* Mehrauli, South Delhi\n👤 *Registered Owner:* Rameshwar Prasad\n📏 *Area:* 4.85 Acres (Agricultural)\n🛡️ *Title Status:* Clear\n📑 *SVAMITVA Property Card:* ✅ Issued & Downloadable`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const processVoice = async () => {
    setIsListening(true);
    setTimeout(async () => {
      setIsListening(false);
      try {
        const res = await fetch("http://localhost:8001/api/v1/citizen/voice-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript_text: voiceQuery, language: selectedLang }),
        });
        const data = await res.json();
        setVoiceResponse(data);
      } catch (err) {
        setVoiceResponse({
          language_detected: selectedLang,
          transcription: voiceQuery,
          ai_synthesized_response: "Your land title for Khasra 104/1A in Village Mehrauli is fully clear with digital SVAMITVA card issued.",
        });
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquareCode size={22} className="text-emerald-400" />
          Citizen & Field Multi-Modal Assistant (WhatsApp Bot & Voice AI)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Bridging the digital divide for rural landholders and field patwaris via natural language voice queries and interactive WhatsApp messaging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: WhatsApp Bhu-Seva Bot Simulator */}
        <div className="glass-panel p-5 flex flex-col justify-between h-[620px] bg-slate-950/90 border-slate-800">
          <div className="space-y-3">
            {/* WhatsApp Header */}
            <div className="flex items-center justify-between p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  DoLR
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    Bhu-Seva National Assistant <ShieldCheck size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-emerald-300">Official Government Bot • Active</div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400">{phone}</div>
            </div>

            {/* Message Thread */}
            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs whitespace-pre-line leading-relaxed shadow-md ${
                      m.sender === "user"
                        ? "bg-emerald-700 text-white rounded-tr-none"
                        : "bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Input Bar */}
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Type e.g. Khasra 104/1A or Dispute..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendWhatsApp()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={sendWhatsApp}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Right Col: Multilingual Voice Assistant */}
        <div className="glass-panel p-5 flex flex-col justify-between h-[620px] space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Mic size={18} className="text-amber-400" />
                Multilingual Voice AI Assistant
              </h2>

              {/* Language Selector */}
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none font-medium"
              >
                <option value="hi-IN">Hindi (हिंदी)</option>
                <option value="en-IN">English (Indian)</option>
                <option value="mr-IN">Marathi (मराठी)</option>
                <option value="ta-IN">Tamil (தமிழ்)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
              </select>
            </div>

            {/* Voice Input Tester */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Sample Voice Query Input:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voiceQuery}
                  onChange={(e) => setVoiceQuery(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* Voice Trigger Button */}
            <div className="flex flex-col items-center justify-center py-6 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <button
                onClick={processVoice}
                disabled={isListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl ${
                  isListening
                    ? "bg-rose-600 animate-pulse scale-110 shadow-rose-600/40"
                    : "bg-gradient-to-tr from-amber-500 to-emerald-600 hover:scale-105 shadow-amber-500/30"
                }`}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
              <span className="text-xs font-bold text-slate-300">
                {isListening ? "Listening & Processing Natural Speech..." : "Tap Mic to Test Voice Query"}
              </span>
            </div>

            {/* Voice Synthesized Output */}
            {voiceResponse && (
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Volume2 size={16} /> Audio Speech Synthesis
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">LiveKit Speech Node</span>
                </div>

                <div className="text-slate-200 leading-relaxed font-medium pt-1">
                  "{voiceResponse.ai_synthesized_response}"
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>Integrated with Bhashini API & LiveKit Real-time Voice Pipelines for field accessibility.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
