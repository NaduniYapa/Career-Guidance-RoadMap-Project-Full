'use client';

import Badge from './Badge';

function AppNavBar({ activeTab, setActiveTab, roadmap, progressPct, currentUser, isProfessional, isAdmin, onAdminOpen, onLogout }) {
  return (
    <nav style={{background:"linear-gradient(90deg,#4c1d95,#6d28d9,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",height:54,position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 24px rgba(124,58,237,0.45)"}}>
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        <div style={{width:26,height:26,background:"rgba(255,255,255,0.15)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginRight:16}}>⚡</div>
        {["roadmap","explore","discussion"].map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{background:activeTab===tab?"rgba(255,255,255,0.15)":"none",border:"none",color:activeTab===tab?"#fff":"rgba(255,255,255,0.5)",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:activeTab===tab?700:400,padding:"6px 14px",borderRadius:6,transition:"all 0.2s"}}>
            {tab==="roadmap"?"My Roadmap":tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        {roadmap && (
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:130,height:4,background:"rgba(255,255,255,0.18)",borderRadius:8,overflow:"hidden"}}>
              <div style={{width:`${roadmap.weightCoverage ?? progressPct}%`,height:"100%",background:"#facc15",borderRadius:8,transition:"width 0.4s ease"}}/>
            </div>
            <span style={{color:"#facc15",fontSize:12,fontWeight:700,minWidth:32}}>{roadmap.weightCoverage ?? progressPct}%</span>
          </div>
        )}
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {isProfessional && <Badge text="PRO" color="#22d3ee"/>}
          {isAdmin && (
            <button onClick={onAdminOpen} style={{background:"rgba(250,204,21,0.15)",color:"#facc15",border:"1px solid rgba(250,204,21,0.3)",borderRadius:5,padding:"5px 12px",fontFamily:"'Georgia',serif",fontSize:11,cursor:"pointer",fontWeight:700}}>⚙️ Admin</button>
          )}
          <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>{currentUser?.name}</span>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:5,padding:"5px 12px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer"}}>↩</button>
        </div>
      </div>
    </nav>
  );
}

export default AppNavBar;
