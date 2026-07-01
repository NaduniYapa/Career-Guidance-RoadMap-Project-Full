import RoadmapStageSection from './RoadmapStageSection.jsx';
import { useState, useEffect } from 'react';
import { SkeletonRoadmap } from '../LoadingSpinner';

function RoadmapTab({ roadmap, currentUser, completedSkills = {}, expandedSkill, onToggleCompleted, onToggleExpand, onEditSkills, onChangePath, onBrowseCareers }) {
  const [phaseIcons, setPhaseIcons] = useState({});
  const [isLoadingPhases, setIsLoadingPhases] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    setIsLoadingPhases(true);
    fetch('/api/learning-phases', { signal: controller.signal })
      .then(r => {
        clearTimeout(timeoutId);
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(p => {
        if (Array.isArray(p) && p.length > 0) {
          const iconMap = {};
          p.forEach(ph => iconMap[ph.name] = ph.icon);
          setPhaseIcons(iconMap);
        } else {
          throw new Error('Invalid response');
        }
        setIsLoadingPhases(false);
      })
      .catch(e => {
        clearTimeout(timeoutId);
        console.warn('Failed to load phases, using fallback:', e.message);
        setPhaseIcons({
          'Foundation': '🌱',
          'Core Technical': '🔧',
          'Tools': '🛠️',
          'Projects': '🚀',
          'Soft Skills': '💼',
          'Job Preparation': '🎯'
        });
        setIsLoadingPhases(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);
  // Show skeleton loader while phases are loading
  if (isLoadingPhases && roadmap) {
    return <SkeletonRoadmap />;
  }

  if (!roadmap) {
    return (
      <div style={{flex:1,padding:"36px 56px",textAlign:"center",paddingTop:80}}>
        <div style={{fontSize:52,marginBottom:20}}>🗺️</div>
        <h2 style={{color:"#fff",fontSize:22,marginBottom:12}}>No roadmap generated yet</h2>
        <p style={{color:"rgba(255,255,255,0.38)",marginBottom:28}}>Pick a career path and complete the skill assessment to get started.</p>
        {onBrowseCareers && <button onClick={onBrowseCareers} style={{background:"#7c3aed",color:"#fff",border:"none",borderRadius:7,padding:"12px 28px",fontSize:14,fontFamily:"'Georgia',serif",cursor:"pointer",fontWeight:700}}>Browse Careers</button>}
      </div>
    );
  }

  const career = roadmap.career || {
    name: 'Career',
    icon: '🧭',
    color: '#7c3aed',
    accent: '#a855f7',
  };
  const stages = roadmap.stages || [];
  const skippedSkills = roadmap.skippedSkills || [];
  const progressPct = roadmap.progressPercent ?? 0;
  const weightCoverage = roadmap.weightCoverage ?? 0;

  // Count skills completed on the roadmap (ticked off, not just assessed)
  const totalSkillsOnRoadmap = stages.reduce((sum, stage) => sum + (stage.skills?.length || 0), 0);
  const doneOnRoadmap = stages.reduce((sum, stage) =>
    sum + (stage.skills || []).filter(s => completedSkills[s.name]).length, 0);
  const totalRemaining = totalSkillsOnRoadmap - doneOnRoadmap;

  // Filter completed skills out of each stage; hide stages that become empty
  const visibleStages = stages
    .map(stage => ({ ...stage, skills: (stage.skills || []).filter(s => !completedSkills[s.name]) }))
    .filter(stage => stage.skills.length > 0);

  return (
    <div style={{flex:1,padding:"36px 56px"}}>
      {/* Summary bar - Enhanced */}
      <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"24px 28px",marginBottom:28,boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:24}}>
          {/* Left: Career info */}
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:64,height:64,borderRadius:16,background:`linear-gradient(135deg, ${career.color}22, ${career.accent}22)`,border:`2px solid ${career.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>
              {career.icon}
            </div>
            <div>
              <div style={{color:"#fff",fontSize:22,fontWeight:700,marginBottom:4}}>{career.name} Roadmap</div>
              <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:"#10b981"}}>✓</span> {doneOnRoadmap}/{totalSkillsOnRoadmap} completed
                </span>
                {skippedSkills.length > 0 && (
                  <span style={{color:"rgba(255,255,255,0.4)",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:"#fbbf24"}}>⊘</span> {skippedSkills.length} skipped
                  </span>
                )}
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:career.accent}}>→</span> {totalRemaining} remaining
                </span>
              </div>
            </div>
          </div>

          {/* Right: Progress stats and actions */}
          <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
            {/* Completion Progress */}
            <div style={{textAlign:"center"}}>
              <div style={{color:"#10b981",fontSize:24,fontWeight:700}}>{progressPct}%</div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:2}}>Completion</div>
            </div>

            {/* Weight Coverage */}
            <div style={{textAlign:"center"}}>
              <div style={{color:career.accent,fontSize:24,fontWeight:700}}>{weightCoverage}%</div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:2}}>Mastery</div>
            </div>

            {/* Progress bar */}
            <div style={{minWidth:200}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>Progress</span>
                <span style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:600}}>{doneOnRoadmap}/{totalSkillsOnRoadmap}</span>
              </div>
              <div style={{width:"100%",height:8,background:"rgba(255,255,255,0.08)",borderRadius:10,overflow:"hidden",position:"relative"}}>
                <div style={{width:`${progressPct}%`,height:"100%",background:`linear-gradient(90deg,${career.color},${career.accent})`,borderRadius:10,transition:"width 0.5s ease",position:"relative"}}>
                  <div style={{position:"absolute",right:0,top:0,bottom:0,width:4,background:"rgba(255,255,255,0.3)"}}/>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",gap:10}}>
              {onEditSkills && (
                <button onClick={onEditSkills} style={{background:"rgba(168,85,247,0.15)",color:"#c084fc",border:"1px solid rgba(168,85,247,0.3)",borderRadius:8,padding:"9px 16px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer",fontWeight:600,transition:"all 0.2s",display:"flex",alignItems:"center",gap:6}}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(168,85,247,0.15)"}>
                  <span>✏️</span> Edit Skills
                </button>
              )}
              {onChangePath && (
                <button onClick={onChangePath} style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 16px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer",transition:"all 0.2s"}}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                  Change Path
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Already-have banner */}
      {skippedSkills.length > 0 && (
        <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:10,padding:"14px 20px",marginBottom:24,display:"flex",gap:12}}>
          <span style={{fontSize:18,marginTop:2}}>✅</span>
          <div>
            <div style={{color:"#10b981",fontSize:13,fontWeight:700,marginBottom:8}}>Already have ({skippedSkills.length})</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {skippedSkills.map(s=>(
                <span key={s} style={{background:"rgba(16,185,129,0.08)",color:"#34d399",fontSize:12,padding:"3px 10px",borderRadius:4,textDecoration:"line-through",opacity:0.7}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {visibleStages.length === 0 && (
        <div style={{textAlign:"center",padding:"60px 0"}}>
          <div style={{fontSize:52,marginBottom:16}}>🏆</div>
          <h3 style={{color:"#fff",fontSize:20,marginBottom:8}}>You already have all required skills!</h3>
          <p style={{color:"rgba(255,255,255,0.4)"}}>Explore another career or a deeper specialisation.</p>
        </div>
      )}

      <div style={{maxWidth:880}}>
        {visibleStages.map((stage, idx) => (
          <RoadmapStageSection
            key={stage.stageName}
            stage={{...stage, icon: phaseIcons[stage.stageName] || '📌'}}
            stageIndex={idx}
            isLast={idx === visibleStages.length - 1}
            careerColor={career.color}
            completedSkills={completedSkills}
            expandedSkill={expandedSkill}
            onToggleCompleted={onToggleCompleted}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </div>
    </div>
  );
}

export default RoadmapTab;
