import SkillCard from './SkillCard.jsx';

function RoadmapStageSection({ stage, stageIndex, isLast, careerColor, completedSkills = {}, expandedSkill, onToggleCompleted, onToggleExpand }) {
  return (
    <div style={{display:"flex",gap:0}}>
      {/* Timeline spine */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:62,flexShrink:0}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"#facc15",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#000",flexShrink:0,zIndex:1,boxShadow:"0 0 0 5px rgba(250,204,21,0.1)"}}>
          {stageIndex + 1}
        </div>
        {!isLast && <div style={{width:2,flex:1,minHeight:24,background:"rgba(250,204,21,0.15)"}}/>}
      </div>

      {/* Stage content */}
      <div style={{flex:1,paddingLeft:20,paddingBottom:36}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#facc15",color:"#000",fontWeight:700,fontSize:13,borderRadius:6,padding:"7px 16px",marginBottom:16}}>
          <span>{stage.icon || '📌'}</span>
          {stage.stageName}
          <span style={{background:"rgba(0,0,0,0.12)",borderRadius:4,padding:"2px 8px",fontSize:11}}>
            {(stage.skills||[]).length} left
          </span>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {(stage.skills||[]).map(skill => {
            const expKey = `${stage.stageName}-${skill.name}`;
            return (
              <SkillCard
                key={skill.name}
                skill={skill}
                careerColor={careerColor}
                isDone={!!(completedSkills[skill.name])}
                isExpanded={expandedSkill === expKey}
                onToggleDone={onToggleCompleted ? () => onToggleCompleted(skill.name) : undefined}
                onToggleExpand={onToggleExpand ? () => onToggleExpand(expKey) : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RoadmapStageSection;
