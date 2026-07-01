import ChatBot from '../ChatBot.jsx';
import { darkBg } from '@/constants';

function LandingPage({ onSignup, onLogin, onGuest }) {
  return (
    <div style={{...darkBg, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden"}}>
      <div style={{position:"absolute",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)",top:-300,left:-200,pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(168,85,247,0.05) 0%,transparent 70%)",bottom:-200,right:-100,pointerEvents:"none"}}/>

      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 48px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
          <span style={{color:"#fff",fontWeight:700,fontSize:17,letterSpacing:"-0.02em"}}>PathForge</span>
        </div>
        <div style={{display:"flex",gap:12}}>
          <button onClick={onGuest} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"9px 20px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>Browse as Guest</button>
          <button onClick={onLogin} style={{background:"rgba(168,85,247,0.15)",color:"#c084fc",border:"1px solid rgba(168,85,247,0.35)",borderRadius:7,padding:"9px 20px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>Log In</button>
          <button onClick={onSignup} style={{background:"#a855f7",color:"#fff",border:"none",borderRadius:7,padding:"9px 22px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:700,boxShadow:"0 4px 20px rgba(168,85,247,0.4)"}}>Sign Up Free</button>
        </div>
      </nav>

      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 80px",maxWidth:760}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.25)",borderRadius:20,padding:"5px 14px",marginBottom:32,width:"fit-content"}}>
          <span style={{background:"#a855f7",width:6,height:6,borderRadius:"50%",display:"inline-block"}}/>
          <span style={{color:"#c084fc",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700}}>Step by Step Career Guidance</span>
        </div>
        <h1 style={{color:"#fff",fontSize:"clamp(46px,6vw,88px)",lineHeight:1.02,fontWeight:700,margin:"0 0 24px",letterSpacing:"-0.03em"}}>
          Learn. Grow.<br/>Build your<br/><span style={{color:"#a855f7"}}>Career.</span>
        </h1>
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:16,lineHeight:1.8,maxWidth:450,margin:"0 0 42px"}}>
          Tell us what you already know. Our engine reads your skill profile and generates a personalised roadmap — starting exactly where you need it.
        </p>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <button onClick={onSignup} style={{background:"#a855f7",color:"#fff",border:"none",borderRadius:8,padding:"14px 34px",fontFamily:"'Georgia',serif",fontSize:15,cursor:"pointer",fontWeight:700,boxShadow:"0 6px 32px rgba(168,85,247,0.45)"}}>Get Started Free →</button>
          <button onClick={onGuest} style={{background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"14px 34px",fontFamily:"'Georgia',serif",fontSize:15,cursor:"pointer"}}>Browse as Guest</button>
        </div>
        <div style={{display:"flex",gap:10,marginTop:48,flexWrap:"wrap"}}>
          {[{icon:"🎓",label:"Students",desc:"Personalized roadmaps"},{icon:"👨‍💼",label:"Professionals",desc:"Mentor & guide learners"},{icon:"⚙️",label:"Admins",desc:"Manage & expand content"}].map(r=>(
            <div key={r.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,padding:"12px 18px",display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:18}}>{r.icon}</span>
              <div><div style={{color:"#fff",fontSize:13,fontWeight:700}}>{r.label}</div><div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>{r.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
      <ChatBot/>
    </div>
  );
}

export default LandingPage;
