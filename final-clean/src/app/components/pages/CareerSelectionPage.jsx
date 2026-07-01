import { engine } from '@/engine';
import { darkBg } from '@/constants';
import ChatBot from '../ChatBot.jsx';

function CareerSelectionPage({ currentUser, isAdmin, onSelectCareer, onAdminOpen, onLogout }) {
  return (
    <div style={{...darkBg}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 36px",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:100,background:"rgba(10,6,18,0.95)",backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
          <span style={{color:"#fff",fontWeight:700,fontSize:16}}>PathForge</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>Hi, {currentUser?.name} 👋</span>
          {isAdmin && (
            <button onClick={onAdminOpen} style={{background:"rgba(250,204,21,0.1)",color:"#facc15",border:"1px solid rgba(250,204,21,0.25)",borderRadius:6,padding:"7px 14px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer",fontWeight:700}}>⚙️ Admin Panel</button>
          )}
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"7px 16px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>Log Out</button>
        </div>
      </nav>
      <div style={{padding:"48px 56px"}}>
        <h2 style={{color:"#fff",fontSize:26,fontWeight:700,marginBottom:8}}>Choose Your Career Path</h2>
        <p style={{color:"rgba(255,255,255,0.38)",fontSize:14,marginBottom:40}}>Select a career — then tell us what you already know so we can build your personalised roadmap.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
          {engine.getAllCareers().map(c => (
            <button key={c.name} onClick={()=>onSelectCareer(c.name)}
              style={{background:`${c.color}08`,border:`1px solid ${c.color}33`,borderRadius:14,padding:"28px 24px",cursor:"pointer",textAlign:"left",transition:"all 0.2s",fontFamily:"'Georgia',serif"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${c.color}14`;e.currentTarget.style.borderColor=`${c.color}66`;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${c.color}08`;e.currentTarget.style.borderColor=`${c.color}33`;e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:36,marginBottom:14}}>{c.icon}</div>
              <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:6}}>{c.name}</div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,marginBottom:18,lineHeight:1.5}}>{c.description}</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:18}}>
                {c.stages.slice(0,3).map(st=>(
                  <span key={st} style={{background:`${c.color}18`,color:c.accent,fontSize:11,padding:"3px 10px",borderRadius:20,letterSpacing:"0.04em"}}>{st}</span>
                ))}
              </div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:c.color,color:"#fff",fontSize:12,padding:"8px 18px",borderRadius:6,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:700}}>
                Start Path →
              </div>
            </button>
          ))}
        </div>
      </div>
      <ChatBot/>
    </div>
  );
}

export default CareerSelectionPage;
