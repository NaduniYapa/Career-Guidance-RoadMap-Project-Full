'use client';

import { useState, useRef, useEffect } from 'react';
import { inputBase } from '@/constants';

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from:"bot", text:"Hi I'm PathBot 🤖 Ask me about career paths, skills, timelines, or anything career-related!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { if(open) bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, open]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMsgs(p => [...p, { from:"user", text:userMsg }]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/chatbot/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setLoading(false);
      setMsgs(p => [...p, { from:"bot", text:data.response || "I'm having trouble understanding. Could you rephrase that?" }]);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Chatbot error:', error);
      setLoading(false);
      const errorMsg = error.name === 'AbortError'
        ? "Request timed out. Please try again! ⏱️"
        : "Sorry, I'm having trouble right now. Try again in a moment! 🤖";
      setMsgs(p => [...p, { from:"bot", text:errorMsg }]);
    }
  };

  return (
    <>
      <button onClick={()=>setOpen(o=>!o)} style={{position:"fixed",bottom:28,right:28,width:54,height:54,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",cursor:"pointer",zIndex:999,boxShadow:"0 4px 24px rgba(168,85,247,0.55)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,transition:"transform 0.2s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div style={{position:"fixed",bottom:96,right:28,width:340,height:440,background:"#120920",border:"1px solid rgba(168,85,247,0.3)",borderRadius:16,zIndex:998,display:"flex",flexDirection:"column",boxShadow:"0 8px 48px rgba(0,0,0,0.7)",overflow:"hidden"}}>
          <div style={{background:"linear-gradient(90deg,#6d28d9,#a855f7)",padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🤖</span>
            <div>
              <div style={{color:"#fff",fontWeight:700,fontSize:14}}>PathBot</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>Career Guidance Assistant</div>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i) => (
              <div key={i} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start"}}>
                <div style={{background:m.from==="user"?"#7c3aed":"rgba(255,255,255,0.07)",color:"#fff",borderRadius:m.from==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"10px 14px",fontSize:13,maxWidth:"82%",lineHeight:1.5,whiteSpace:"pre-wrap"}}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:"flex",justifyContent:"flex-start"}}>
                <div style={{background:"rgba(255,255,255,0.07)",color:"#fff",borderRadius:"12px 12px 12px 2px",padding:"10px 14px",fontSize:13}}>
                  <span style={{display:"inline-block",animation:"pulse 1.5s infinite"}}>●</span>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} disabled={loading}
              placeholder="Ask me anything..." style={{...inputBase,flex:1,padding:"9px 12px",fontSize:13,opacity:loading?0.6:1}}/>
            <button onClick={send} disabled={loading} style={{background:"#a855f7",border:"none",borderRadius:8,padding:"9px 14px",color:"#fff",cursor:loading?"not-allowed":"pointer",fontSize:16,opacity:loading?0.6:1}}>↑</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}

export default ChatBot;
