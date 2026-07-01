import { useState, useEffect } from 'react';

function SkillCard({ skill, careerColor, isDone, isExpanded, onToggleDone, onToggleExpand }) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [resourceColors, setResourceColors] = useState({});
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const handleExpand = onToggleExpand || (() => setLocalExpanded(e => !e));

  useEffect(() => {
    fetch('/api/resource-types')
      .then(r => r.json())
      .then(types => {
        const colorMap = {};
        types.forEach(t => colorMap[t.name] = t.color);
        setResourceColors(colorMap);
      })
      .catch(e => {
        console.warn('Failed to load resource types, using fallback');
        // Fallback
        setResourceColors({
          'Course': '#3b82f6',
          'Article': '#10b981',
          'Video': '#f59e0b',
          'Book': '#8b5cf6',
          'Docs': '#06b6d4',
          'Tutorial': '#ec4899',
          'Tool': '#f97316',
          'Challenges': '#ef4444',
          'OpenSource': '#22d3ee',
        });
      });
  }, []);

  return (
    <div style={{background:isDone?"rgba(250,204,21,0.04)":"rgba(255,255,255,0.02)",border:`1px solid ${isDone?"rgba(250,204,21,0.2)":"rgba(255,255,255,0.07)"}`,borderRadius:9,overflow:"hidden",transition:"all 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer"}} onClick={handleExpand}>
        {onToggleDone && (
          <div
            onClick={e => { e.stopPropagation(); onToggleDone(); }}
            style={{width:20,height:20,borderRadius:5,border:`2px solid ${isDone?"#facc15":"rgba(255,255,255,0.16)"}`,background:isDone?"#facc15":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s"}}>
            {isDone && <span style={{color:"#000",fontSize:12,fontWeight:700}}>✓</span>}
          </div>
        )}
        <span style={{color:isDone?"rgba(255,255,255,0.28)":"#fff",fontSize:14,fontWeight:600,flex:1,textDecoration:isDone?"line-through":"none"}}>{skill.name}</span>
        <div style={{display:"flex",gap:3,alignItems:"center"}}>
          {Array.from({length:5}).map((_,i) => (
            <div key={i} style={{width:15,height:3,borderRadius:2,background:i < Math.round(skill.weight/2) ? careerColor : "rgba(255,255,255,0.08)"}}/>
          ))}
          <span style={{color:"rgba(255,255,255,0.22)",fontSize:11,marginLeft:3}}>weight:{skill.weight}</span>
        </div>
        <span style={{color:"rgba(255,255,255,0.28)",fontSize:12,marginLeft:8}}>
          {(skill.resources||[]).length} res.{" "}
          <span style={{display:"inline-block",transform:expanded?"rotate(180deg)":"none",transition:"transform 0.2s"}}>↓</span>
        </span>
      </div>

      {expanded && (
        <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"12px 16px 16px",background:"rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.1em"}}>Learning Resources</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {(skill.resources||[]).length === 0 && (
              <p style={{color:"rgba(255,255,255,0.25)",fontSize:13,margin:0}}>No resources listed.</p>
            )}
            {(skill.resources||[]).map((res, ri) => (
              <div key={ri} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"9px 13px"}}>
                <span style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>{res.name}</span>
                <span style={{background:resourceColors[res.type]||"#6366f1",color:"#fff",fontSize:11,borderRadius:4,padding:"3px 9px",fontWeight:700}}>{res.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillCard;
