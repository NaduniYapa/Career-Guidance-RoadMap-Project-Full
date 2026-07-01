import { engine } from '@/engine';
import { inputBase } from '@/constants';
import ChatBot from '../ChatBot.jsx';
import { useState, useEffect } from 'react';

function AssessmentPage({ selectedCareer, assessedSkills, setAssessedSkills, isEditMode, onConfirm, onBack }) {
  const c = engine.getCareer(selectedCareer);
  const checkedCount = Object.values(assessedSkills).filter(Boolean).length;
  const [phases, setPhases] = useState([]);
  const [phaseIcons, setPhaseIcons] = useState({});

  useEffect(() => {
    fetch('/api/learning-phases')
      .then(r => r.json())
      .then(p => {
        setPhases(p.map(ph => ph.name));
        const iconMap = {};
        p.forEach(ph => iconMap[ph.name] = ph.icon);
        setPhaseIcons(iconMap);
      })
      .catch(e => {
        console.warn('Failed to load phases, using fallback');
        // Fallback to hardcoded
        const fallbackPhases = ['Foundation', 'Core Technical', 'Tools', 'Projects', 'Soft Skills', 'Job Preparation'];
        setPhases(fallbackPhases);
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
    <div style={{minHeight:"100vh",background:"#0a0612",fontFamily:"'Georgia',serif"}}>
      <div style={{background:"linear-gradient(90deg,#4c1d95,#7c3aed)",padding:"18px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(0,0,0,0.4)"}}>
        <div>
          <div style={{color:"rgba(255,255,255,0.55)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>
            {isEditMode ? "Edit Your Skills" : "Step 1 — Skill Assessment"}
          </div>
          <div style={{color:"#fff",fontSize:18,fontWeight:700}}>{c.icon} {selectedCareer}</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>{checkedCount} selected</span>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>
            {isEditMode ? "← Cancel" : "← Change"}
          </button>
        </div>
      </div>

      <div style={{padding:"32px 56px",maxWidth:880}}>
        {isEditMode ? (
          <div style={{background:"rgba(168,85,247,0.07)",border:"1px solid rgba(168,85,247,0.28)",borderRadius:10,padding:"16px 20px",marginBottom:36,display:"flex",gap:14}}>
            <span style={{fontSize:22}}>✏️</span>
            <div>
              <div style={{color:"#c084fc",fontSize:14,fontWeight:700,marginBottom:4}}>Editing your skill selections</div>
              <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,lineHeight:1.65}}>
                Toggle any skills you missed. Your roadmap will update when you click <strong style={{color:"rgba(255,255,255,0.7)"}}>Update Roadmap</strong>.
              </div>
            </div>
          </div>
        ) : (
          <div style={{background:"rgba(250,204,21,0.06)",border:"1px solid rgba(250,204,21,0.2)",borderRadius:10,padding:"16px 20px",marginBottom:36,display:"flex",gap:14}}>
            <span style={{fontSize:22}}>💡</span>
            <div>
              <div style={{color:"#facc15",fontSize:14,fontWeight:700,marginBottom:4}}>Check everything you already know</div>
              <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,lineHeight:1.65}}>
                The engine filters out skills you have and sorts what remains by weight (priority). Skills with <strong style={{color:"rgba(255,255,255,0.7)"}}>w:10 are most foundational</strong>.
              </div>
            </div>
          </div>
        )}

        {phases.map(stageName => {
          const stageSkills = c.getSkillsByStage(stageName);
          if (!stageSkills.length) return null;
          const stageChecked = stageSkills.filter(s=>assessedSkills[s.name]).length;
          return (
            <div key={stageName} style={{marginBottom:32}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:18}}>{phaseIcons[stageName] || '📌'}</span>
                <span style={{color:"#fff",fontSize:15,fontWeight:700}}>{stageName}</span>
                <span style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.35)",fontSize:12,padding:"2px 10px",borderRadius:4}}>{stageChecked}/{stageSkills.length} known</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                {stageSkills.sort((a,b)=>b.weight-a.weight).map(skill => {
                  const isKnown = !!assessedSkills[skill.name];
                  return (
                    <button key={skill.name}
                      onClick={()=>setAssessedSkills(p=>({...p,[skill.name]:!p[skill.name]}))}
                      style={{background:isKnown?`${c.color}15`:"rgba(255,255,255,0.025)",border:`1px solid ${isKnown?c.color:"rgba(255,255,255,0.07)"}`,borderRadius:8,padding:"12px 14px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10,transition:"all 0.15s",fontFamily:"'Georgia',serif"}}>
                      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isKnown?c.color:"rgba(255,255,255,0.2)"}`,background:isKnown?c.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                        {isKnown && <span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{color:isKnown?"#fff":"rgba(255,255,255,0.6)",fontSize:13,fontWeight:600,marginBottom:4}}>{skill.name}</div>
                        <div style={{display:"flex",gap:2,alignItems:"center"}}>
                          {Array.from({length:5}).map((_,i)=>(
                            <div key={i} style={{width:13,height:3,borderRadius:2,background:i<Math.round(skill.weight/2)?c.color:"rgba(255,255,255,0.09)"}}/>
                          ))}
                          <span style={{color:"rgba(255,255,255,0.25)",fontSize:10,marginLeft:3}}>w:{skill.weight}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{position:"sticky",bottom:0,background:"linear-gradient(to top,#0a0612 55%,transparent)",padding:"24px 0 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{color:"rgba(255,255,255,0.35)",fontSize:14}}>{checkedCount} known · {c.skills.length-checkedCount} to learn</span>
          <button onClick={onConfirm} style={{background:"linear-gradient(90deg,#7c3aed,#a855f7)",color:"#fff",border:"none",borderRadius:9,padding:"13px 36px",fontFamily:"'Georgia',serif",fontSize:15,cursor:"pointer",fontWeight:700,boxShadow:"0 4px 28px rgba(168,85,247,0.45)"}}>
            {isEditMode ? "Update Roadmap →" : "Generate My Roadmap →"}
          </button>
        </div>
      </div>
      <ChatBot/>
    </div>
  );
}

export default AssessmentPage;
