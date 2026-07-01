import { useState, useEffect } from 'react';
import { engine } from '@/engine';
import { darkBg } from '@/constants';
import Badge from '../Badge.jsx';
import ChatBot from '../ChatBot.jsx';

function GuestView({ onSignup, onBack }) {
  const [guestCareer, setGuestCareer] = useState(null);
  const [phaseIcons, setPhaseIcons] = useState({});
  const gRoadmap = guestCareer ? engine.generateGuestRoadmap(guestCareer) : null;
  const gCareer  = guestCareer ? engine.getCareer(guestCareer) : null;

  useEffect(() => {
    fetch('/api/learning-phases')
      .then(r => r.json())
      .then(p => {
        const iconMap = {};
        p.forEach(ph => iconMap[ph.name] = ph.icon);
        setPhaseIcons(iconMap);
      })
      .catch(e => {
        console.warn('Failed to load phases, using fallback');
        // Fallback
        setPhaseIcons({
          'Foundation': '🌱',
          'Core Technical': '🔧',
          'Tools': '🛠️',
          'Projects': '🚀',
          'Soft Skills': '💼',
          'Job Preparation': '🎯'
        });
      });
  }, []);

  return (
    <div style={{...darkBg}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 36px",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:100,background:"rgba(10,6,18,0.95)",backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
          <span style={{color:"#fff",fontWeight:700,fontSize:16}}>PathForge</span>
          <Badge text="GUEST" color="#f97316"/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onBack} style={{background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"7px 16px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>← Back</button>
          <button onClick={onSignup} style={{background:"#a855f7",color:"#fff",border:"none",borderRadius:6,padding:"7px 18px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:700}}>Sign Up to Personalize</button>
        </div>
      </nav>

      <div style={{padding:"36px 48px"}}>
        <div style={{background:"rgba(249,115,22,0.07)",border:"1px solid rgba(249,115,22,0.25)",borderRadius:10,padding:"14px 20px",marginBottom:32,display:"flex",gap:14,alignItems:"center"}}>
          <span style={{fontSize:22}}>👀</span>
          <div>
            <div style={{color:"#fb923c",fontSize:14,fontWeight:700}}>Browsing as Guest</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:13}}>
              You can view full career roadmaps, but personalisation is only available to registered users.{" "}
              <span onClick={onSignup} style={{color:"#a855f7",cursor:"pointer",textDecoration:"underline"}}>Sign up free →</span>
            </div>
          </div>
        </div>

        <h2 style={{color:"#fff",fontSize:22,fontWeight:700,marginBottom:8}}>Explore Career Roadmaps</h2>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:28}}>Browse complete roadmaps for any career path below.</p>

        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:36}}>
          {engine.getAllCareers().map(c=>(
            <button key={c.name} onClick={()=>setGuestCareer(c.name)} style={{background:guestCareer===c.name?`${c.color}20`:"rgba(255,255,255,0.04)",border:`1px solid ${guestCareer===c.name?c.color:c.color+"33"}`,borderRadius:10,padding:"12px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"'Georgia',serif",transition:"all 0.2s"}}>
              <span style={{fontSize:20}}>{c.icon}</span>
              <div style={{textAlign:"left"}}>
                <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{c.name}</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>{c.skills.length} skills</div>
              </div>
            </button>
          ))}
        </div>

        {gRoadmap && gCareer && (
          <div style={{maxWidth:860}}>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"18px 22px",marginBottom:28,display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:30}}>{gCareer.icon}</span>
              <div>
                <div style={{color:"#fff",fontSize:18,fontWeight:700}}>{gCareer.name} — Full Roadmap</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>{gCareer.skills.length} skills across {gCareer.stages.length} stages · No personalisation</div>
              </div>
            </div>

            {gRoadmap.stages.map((stage, idx) => (
              <div key={stage.stageName} style={{display:"flex",gap:0,marginBottom:0}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:60,flexShrink:0}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:gCareer.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0,zIndex:1}}>{idx+1}</div>
                  {idx < gRoadmap.stages.length-1 && <div style={{width:2,flex:1,minHeight:24,background:`${gCareer.color}30`}}/>}
                </div>
                <div style={{flex:1,paddingLeft:18,paddingBottom:32}}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${gCareer.color}20`,border:`1px solid ${gCareer.color}40`,color:gCareer.accent,fontWeight:700,fontSize:13,borderRadius:6,padding:"7px 16px",marginBottom:14}}>
                    <span>{phaseIcons[stage.stageName] || '📌'}</span>{stage.stageName}
                    <span style={{background:"rgba(0,0,0,0.2)",borderRadius:4,padding:"2px 7px",fontSize:11}}>{stage.skills.length}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {stage.skills.map(skill=>(
                      <div key={skill.name} style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:gCareer.color,flexShrink:0}}/>
                          <span style={{color:"rgba(255,255,255,0.8)",fontSize:14,fontWeight:600}}>{skill.name}</span>
                        </div>
                        <div style={{display:"flex",gap:3,alignItems:"center"}}>
                          {Array.from({length:5}).map((_,i)=>(
                            <div key={i} style={{width:14,height:3,borderRadius:2,background:i<Math.round(skill.weight/2)?gCareer.color:"rgba(255,255,255,0.08)"}}/>
                          ))}
                          <span style={{color:"rgba(255,255,255,0.25)",fontSize:11,marginLeft:4}}>w:{skill.weight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div style={{background:"linear-gradient(135deg,rgba(168,85,247,0.08),rgba(124,58,237,0.08))",border:"1px solid rgba(168,85,247,0.25)",borderRadius:12,padding:"24px",textAlign:"center",marginTop:16}}>
              <div style={{fontSize:28,marginBottom:10}}>🎯</div>
              <div style={{color:"#fff",fontWeight:700,fontSize:16,marginBottom:6}}>Want a personalised version?</div>
              <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:16}}>Sign up to skip skills you already know and get a roadmap tailored to your starting point.</div>
              <button onClick={onSignup} style={{background:"#a855f7",color:"#fff",border:"none",borderRadius:8,padding:"11px 26px",fontFamily:"'Georgia',serif",fontSize:14,cursor:"pointer",fontWeight:700}}>Create Free Account →</button>
            </div>
          </div>
        )}
      </div>
      <ChatBot/>
    </div>
  );
}

export default GuestView;
