'use client';

import { useState, useEffect } from 'react';
import { engine } from '@/engine';
import { inputBase } from '@/constants';
import { apiClient } from '@/lib/api-client';

function AdminPanel({ onBack }) {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [phases, setPhases] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [newProf, setNewProf] = useState({ username:'', name:'', email:'', title:'', org:'', specialty:'Software Engineer', avatar:'👨‍💻', password:'' });
  const [skillForm, setSkillForm] = useState({ career:'Software Engineer', name:'', stage:'Foundation', weight:5, resourceName:'', resourceType:'Course' });
  const [msg, setMsg] = useState('');

  // Load users from DB on mount
  useEffect(() => {
    apiClient.get('/admin/users').then(r => setUsers(r.users || [])).catch(() => {});
    
    fetch('/api/learning-phases')
      .then(r => r.json())
      .then(p => setPhases(p.map(ph => ph.name)))
      .catch(() => setPhases(['Foundation', 'Core Technical', 'Tools', 'Projects', 'Soft Skills', 'Job Preparation']));

    fetch('/api/resource-types')
      .then(r => r.json())
      .then(types => setResourceTypes(types.map(t => t.name)))
      .catch(() => setResourceTypes(['Course', 'Article', 'Video', 'Book', 'Docs', 'Tutorial', 'Tool', 'Challenges', 'OpenSource']));
  }, []);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const addProfessional = async () => {
    if (!newProf.username || !newProf.name || !newProf.email || !newProf.password) { showMsg('⚠️ Fill all required fields.'); return; }
    try {
      await apiClient.post('/admin/users', { ...newProf, role: 'professional' });
      const r = await apiClient.get('/admin/users');
      setUsers(r.users || []);
      setNewProf({ username:'', name:'', email:'', title:'', org:'', specialty:'Software Engineer', avatar:'👨‍💻', password:'' });
      showMsg('✅ Professional account created!');
    } catch(e) { showMsg(`⚠️ ${e.message}`); }
  };

  const addSkill = () => {
    if (!skillForm.name) { showMsg('⚠️ Enter a skill name.'); return; }
    const resources = skillForm.resourceName ? [{ name: skillForm.resourceName, type: skillForm.resourceType }] : [];
    engine.addSkillToCareer(skillForm.career, { name: skillForm.name, stage: skillForm.stage, weight: parseInt(skillForm.weight), resources });
    setSkillForm(p => ({ ...p, name:'', resourceName:'' }));
    showMsg(`✅ Skill "${skillForm.name}" added to ${skillForm.career}!`);
  };

  const deleteUser = async (userId) => {
    try {
      await apiClient.delete(`/admin/users?userId=${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showMsg('✅ User removed.');
    } catch(e) { showMsg(`⚠️ ${e.message}`); }
  };

  const professionals = users.filter(u => u.role === 'professional');
  const regularUsers  = users.filter(u => u.role === 'student');

  return (
    <div style={{minHeight:"100vh",background:"#0a0612",fontFamily:"'Georgia',serif"}}>
      <div style={{background:"linear-gradient(90deg,#1e0a3c,#3b1270)",padding:"16px 36px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(168,85,247,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:24}}>⚙️</span>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:18}}>Admin Dashboard</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>PathForge Control Center</div>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"8px 18px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>← Back to Home</button>
        )}
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:16,padding:"24px 36px 0"}}>
        {[
          { label:"Total Users",   value: users.length,          icon:"👥", color:"#a855f7" },
          { label:"Professionals", value: professionals.length,  icon:"🎓", color:"#22d3ee" },
          { label:"Career Paths",  value: engine.getCareerNames().length, icon:"🗺️", color:"#f97316" },
          { label:"Students",      value: regularUsers.length,   icon:"📚", color:"#10b981" },
        ].map(s => (
          <div key={s.label} style={{flex:1,background:"rgba(255,255,255,0.03)",border:`1px solid ${s.color}30`,borderRadius:12,padding:"18px 20px"}}>
            <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
            <div style={{color:s.color,fontSize:26,fontWeight:700}}>{s.value}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,padding:"24px 36px 0"}}>
        {[["users","👥 Users & Professionals"],["add_prof","➕ Add Professional"],["add_skill","📚 Add Skill"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"#7c3aed":"rgba(255,255,255,0.04)",color:tab===t?"#fff":"rgba(255,255,255,0.5)",border:`1px solid ${tab===t?"#7c3aed":"rgba(255,255,255,0.1)"}`,borderRadius:"8px 8px 0 0",padding:"10px 20px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:tab===t?700:400}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{margin:"0 36px",border:"1px solid rgba(168,85,247,0.2)",borderRadius:"0 12px 12px 12px",background:"rgba(255,255,255,0.02)",padding:28}}>
        {msg && <div style={{background:msg.startsWith("✅")?"rgba(16,185,129,0.1)":"rgba(249,115,22,0.1)",border:`1px solid ${msg.startsWith("✅")?"rgba(16,185,129,0.3)":"rgba(249,115,22,0.3)"}`,borderRadius:8,padding:"12px 16px",marginBottom:20,color:msg.startsWith("✅")?"#34d399":"#fb923c",fontSize:14}}>{msg}</div>}

        {tab==="users" && (
          <div>
            <h3 style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:16}}>Professional Accounts ({professionals.length})</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
              {professionals.map(u => (
                <div key={u.id} style={{background:"rgba(34,211,238,0.05)",border:"1px solid rgba(34,211,238,0.2)",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <span style={{fontSize:26}}>{u.avatar || "👨‍💻"}</span>
                    <div>
                      <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{u.name} <span style={{color:"rgba(255,255,255,0.3)",fontWeight:400,fontSize:12}}>@{u.username}</span></div>
                      <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>{u.title} · {u.org}</div>
                      <div style={{color:"#22d3ee",fontSize:11,marginTop:2}}>Specialty: {u.specialty}</div>
                    </div>
                  </div>
                  <button onClick={()=>deleteUser(u.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.25)",borderRadius:6,padding:"7px 14px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer"}}>Remove</button>
                </div>
              ))}
              {professionals.length===0 && <p style={{color:"rgba(255,255,255,0.3)",fontSize:14}}>No professional accounts yet. Add one →</p>}
            </div>
            <h3 style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:16}}>Regular Users ({regularUsers.length})</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {regularUsers.map(u => (
                <div key={u.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <span style={{color:"#fff",fontWeight:600,fontSize:14}}>{u.name} </span>
                    <span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>@{u.username}</span>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>{u.email}</span>
                    <button onClick={()=>deleteUser(u.id)} style={{background:"rgba(239,68,68,0.08)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)",borderRadius:5,padding:"5px 12px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer"}}>Remove</button>
                  </div>
                </div>
              ))}
              {regularUsers.length===0 && <p style={{color:"rgba(255,255,255,0.3)",fontSize:14}}>No regular users registered yet.</p>}
            </div>
          </div>
        )}

        {tab==="add_prof" && (
          <div style={{maxWidth:560}}>
            <h3 style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:6}}>Create Professional Account</h3>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:24}}>Professionals can reply to student forum posts.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              {[["Username *","username","text","e.g. dr.smith"],["Password *","password","password",""],["Full Name *","name","text","Dr. Jane Smith"],["Email *","email","email",""],["Job Title","title","text","Senior Engineer"],["Organisation","org","text","Company / University"]].map(([label,key,type,ph])=>(
                <div key={key}><label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>{label}</label><input type={type} value={newProf[key]} onChange={e=>setNewProf(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={inputBase}/></div>
              ))}
              <div>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Specialty</label>
                <select value={newProf.specialty} onChange={e=>setNewProf(p=>({...p,specialty:e.target.value}))} style={inputBase}>
                  {engine.getCareerNames().map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Avatar</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["👨‍💻","👩‍💻","👨‍🏫","👩‍🏫","👨‍🔬","👩‍🔬","👨‍💼","👩‍💼"].map(emoji=>(
                    <button key={emoji} onClick={()=>setNewProf(p=>({...p,avatar:emoji}))} style={{fontSize:22,background:newProf.avatar===emoji?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.05)",border:`2px solid ${newProf.avatar===emoji?"#a855f7":"transparent"}`,borderRadius:8,padding:6,cursor:"pointer"}}>{emoji}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={addProfessional} style={{background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,padding:"12px 28px",fontFamily:"'Georgia',serif",fontSize:14,cursor:"pointer",fontWeight:700,boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
              Create Professional Account →
            </button>
          </div>
        )}

        {tab==="add_skill" && (
          <div style={{maxWidth:560}}>
            <h3 style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:6}}>Add Skill to Career Roadmap</h3>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:24}}>Extend any career path with new skills. Changes apply immediately.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Career Path</label>
                <select value={skillForm.career} onChange={e=>setSkillForm(p=>({...p,career:e.target.value}))} style={inputBase}>
                  {engine.getCareerNames().map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Stage</label>
                <select value={skillForm.stage} onChange={e=>setSkillForm(p=>({...p,stage:e.target.value}))} style={inputBase}>
                  {phases.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Skill Name *</label>
                <input value={skillForm.name} onChange={e=>setSkillForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Kubernetes, Prompt Engineering..." style={inputBase}/>
              </div>
              <div>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Weight (1–10)</label>
                <input type="number" min={1} max={10} value={skillForm.weight} onChange={e=>setSkillForm(p=>({...p,weight:parseInt(e.target.value)||5}))} style={inputBase}/>
              </div>
              <div>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Resource Type</label>
                <select value={skillForm.resourceType} onChange={e=>setSkillForm(p=>({...p,resourceType:e.target.value}))} style={inputBase}>
                  {resourceTypes.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={{color:"rgba(255,255,255,0.5)",fontSize:12,display:"block",marginBottom:5}}>Resource Name (optional)</label>
                <input value={skillForm.resourceName} onChange={e=>setSkillForm(p=>({...p,resourceName:e.target.value}))} placeholder="e.g. Official Kubernetes Docs" style={inputBase}/>
              </div>
            </div>
            <button onClick={addSkill} style={{background:"linear-gradient(90deg,#7c3aed,#a855f7)",color:"#fff",border:"none",borderRadius:8,padding:"12px 28px",fontFamily:"'Georgia',serif",fontSize:14,cursor:"pointer",fontWeight:700,boxShadow:"0 4px 20px rgba(124,58,237,0.35)"}}>
              Add Skill to Roadmap →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
