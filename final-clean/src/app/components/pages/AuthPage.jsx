import { darkBg, inputBase } from '@/constants';
import ChatBot from '../ChatBot.jsx';

function AuthPage({ mode, authForm, setAuthForm, authError, setAuthError, onLogin, onSignup, onBack, onToggleMode }) {
  return (
    <div style={{...darkBg,display:"flex",flexDirection:"column"}}>
      <nav style={{padding:"18px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
          <span style={{color:"#fff",fontWeight:700,fontSize:16}}>PathForge</span>
        </div>
        <button onClick={onBack} style={{background:"rgba(168,85,247,0.1)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(168,85,247,0.2)",borderRadius:6,padding:"8px 18px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>← Back</button>
      </nav>

      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px"}}>
        <div style={{width:380,background:"rgba(18,9,32,0.95)",border:"1px solid rgba(168,85,247,0.25)",borderRadius:16,padding:"36px 32px",backdropFilter:"blur(16px)"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:36,marginBottom:10}}>{mode==="login"?"🔐":"✨"}</div>
            <h2 style={{color:"#fff",margin:"0 0 6px",fontSize:20,fontWeight:700}}>{mode==="login"?"Welcome back":"Create your account"}</h2>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:0}}>{mode==="login"?"Sign in to access your roadmap":"Join PathForge and start your journey"}</p>
          </div>

          {authError && (
            <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:7,padding:"10px 14px",marginBottom:16,color:"#f87171",fontSize:13}}>{authError}</div>
          )}

          {mode==="signup" && (
            <>
              <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Full Name</label>
              <input value={authForm.name} onChange={e=>setAuthForm(p=>({...p,name:e.target.value}))} placeholder="Your full name" style={{...inputBase,marginBottom:12}}/>
              <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Email</label>
              <input value={authForm.email} onChange={e=>setAuthForm(p=>({...p,email:e.target.value}))} placeholder="you@email.com" style={{...inputBase,marginBottom:12}}/>
            </>
          )}
          <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Username</label>
          <input value={authForm.username} onChange={e=>setAuthForm(p=>({...p,username:e.target.value}))} placeholder={mode==="login"?"your username":"choose a username"} style={{...inputBase,marginBottom:12}}/>
          <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Password</label>
          <input type="password" value={authForm.password} onChange={e=>setAuthForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(mode==="login"?onLogin():onSignup())} style={{...inputBase,marginBottom:20}}/>

          <button onClick={mode==="login"?onLogin:onSignup} style={{width:"100%",background:"linear-gradient(90deg,#7c3aed,#a855f7)",color:"#fff",border:"none",borderRadius:9,padding:"13px",fontSize:15,fontFamily:"'Georgia',serif",cursor:"pointer",fontWeight:700,boxShadow:"0 4px 24px rgba(168,85,247,0.4)",marginBottom:16}}>
            {mode==="login"?"Sign In →":"Create Account →"}
          </button>

          <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,textAlign:"center",margin:0}}>
            {mode==="login" ? "Don't have an account? " : "Already have one? "}
            <span onClick={onToggleMode} style={{color:"#a855f7",cursor:"pointer"}}>{mode==="login"?"Sign up":"Log in"}</span>
          </p>
        </div>
      </div>
      <ChatBot/>
    </div>
  );
}

export default AuthPage;
