import { engine } from '@/engine';
import Badge from '../Badge.jsx';

function ExploreTab({ selectedCareer, onSelectCareer }) {
  return (
    <div style={{flex:1,padding:"48px 56px"}}>
      <h2 style={{color:"#fff",fontSize:24,fontWeight:700,marginBottom:8}}>Explore Career Paths</h2>
      <p style={{color:"rgba(255,255,255,0.38)",fontSize:14,marginBottom:36}}>Switch to a different career or reassess your skills.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
        {engine.getAllCareers().map(c => {
          const isActive = c.name === selectedCareer;
          return (
            <div key={c.name} style={{background:isActive?`${c.color}10`:"rgba(255,255,255,0.025)",border:`1px solid ${isActive?c.color:c.color+"33"}`,borderRadius:14,padding:"24px",transition:"all 0.2s"}}>
              <div style={{fontSize:30,marginBottom:12}}>{c.icon}</div>
              <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:4}}>{c.name}</div>
              {isActive && <Badge text="CURRENT PATH" color={c.color}/>}
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,marginTop:8,marginBottom:18}}>{c.skills.length} skills · {c.stages.length} stages</div>
              {onSelectCareer && (
                <button
                  onClick={() => onSelectCareer(c.name)}
                  style={{background:isActive?"rgba(255,255,255,0.08)":c.color,color:"#fff",border:"none",borderRadius:7,padding:"9px 18px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:700,width:"100%"}}>
                  {isActive ? "Reassess Skills" : "Start Path →"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExploreTab;
