import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { playSound } from "@/lib/sounds";
import { Send, Smile } from "lucide-react";

interface Message {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  timestamp: Timestamp;
}

const EMOJIS = ["😂", "😍", "🎉", "👑", "🚔", "😈", "💰", "🏆", "🤣", "😤", "😱", "🙏", "💀", "🔥", "⚡", "🎭", "👮", "🗡️", "😎", "🤫"];

export function ChatPanel({ roomCode, className = "" }: { roomCode: string; className?: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, `rooms/${roomCode}/messages`), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const newMessages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(newMessages);
      
      // Play sound if there's a new message and it's not from us
      if (snap.docChanges().some(change => change.type === "added" && change.doc.data().uid !== user?.uid)) {
        playSound("chat");
      }
    });
    return unsub;
  }, [roomCode, user?.uid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user) return;
    
    const text = input.trim();
    setInput("");
    setShowEmojis(false);
    
    await addDoc(collection(db, `rooms/${roomCode}/messages`), {
      uid: user.uid,
      displayName: user.displayName || "Unknown Player",
      text,
      timestamp: serverTimestamp()
    });
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  return (
    <div className={`flex flex-col bg-card/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl ${className}`}>
      <div className="px-4 py-3 bg-white/5 border-b border-white/10 font-bold text-sm text-white/80 flex justify-between items-center">
        <span>Room Chat</span>
        <span className="text-xs font-normal text-white/40">{messages.length} msgs</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-sm font-medium">
            No messages yet. Say hi! 👋
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.uid === user?.uid;
            const showName = i === 0 || messages[i-1].uid !== msg.uid;
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {showName && !isMe && (
                  <span className="text-[10px] font-bold text-white/40 mb-1 ml-1">{msg.displayName}</span>
                )}
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-br-sm font-medium" 
                    : "bg-white/10 text-white rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white/5 border-t border-white/10 relative">
        {showEmojis && (
          <div className="absolute bottom-full right-3 mb-2 bg-card border border-white/10 rounded-xl p-3 shadow-2xl grid grid-cols-5 gap-2 z-10 w-[240px]">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => addEmoji(e)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
