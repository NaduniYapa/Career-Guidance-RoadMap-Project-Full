'use client';

import { useState } from 'react';
import { engine } from '@/engine';
import { inputBase } from '@/constants';
import Badge from './Badge';

function DiscussionPanel({
  currentUser, isProfessional, forumPosts, setForumPosts,
  newQuestion, setNewQuestion, newQuestionCareer, setNewQuestionCareer,
  taggedMentor, setTaggedMentor, replyTexts, setReplyTexts,
  expandedPost, setExpandedPost, submitForumQuestion, submitReply,
  allProfessionals, specialtyMentors
}) {
  const [discView, setDiscView] = useState('directory');
  const [selectedDirectoryCareer, setSelectedDirectoryCareer] = useState(null);
  const [hoveredMentor, setHoveredMentor] = useState(null);

  const mentorsForCareer = selectedDirectoryCareer
    ? specialtyMentors(selectedDirectoryCareer)
    : (allProfessionals || []);

  // CHANGED: look up tagged mentor from the professionals prop array instead of userRepo
  const selectedMentorObj = taggedMentor
    ? ((allProfessionals || []).find(([u]) => u === taggedMentor)?.[1] || null)
    : null;

  const startAsk = (career, mentorUsername) => {
    setNewQuestionCareer(career || newQuestionCareer);
    setTaggedMentor(mentorUsername || null);
    setDiscView('ask');
  };

  return (
    <div style={{flex:1, padding:"0", display:"flex", flexDirection:"column"}}>
      {/* Sub-nav */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 56px", background:"rgba(0,0,0,0.2)", display:"flex", alignItems:"center", gap:4}}>
        {[
          { key:"directory", label:"👥 Mentor Directory" },
          { key:"ask",       label:"✏️ Ask a Question" },
          { key:"posts",     label:`💬 Forum (${(forumPosts || []).length})` },
        ].map(tab => (
          <button key={tab.key} onClick={()=>setDiscView(tab.key)} style={{
            background:"none", border:"none", color:discView===tab.key?"#fff":"rgba(255,255,255,0.4)",
            fontFamily:"'Georgia',serif", fontSize:13, cursor:"pointer", padding:"14px 18px",
            borderBottom:discView===tab.key?"2px solid #a855f7":"2px solid transparent",
            fontWeight:discView===tab.key?700:400, transition:"all 0.2s"
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{padding:"36px 56px", maxWidth:920, flex:1}}>

        {/* MENTOR DIRECTORY */}
        {discView === "directory" && (
          <div>
            <div style={{marginBottom:28}}>
              <h2 style={{color:"#fff", fontSize:22, fontWeight:700, margin:"0 0 6px"}}>Mentor Directory</h2>
              <p style={{color:"rgba(255,255,255,0.38)", fontSize:14, margin:0}}>Browse verified professionals by specialty. Click a mentor to ask them directly.</p>
            </div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:28}}>
              <button onClick={()=>setSelectedDirectoryCareer(null)}
                style={{background:selectedDirectoryCareer===null?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.04)",color:selectedDirectoryCareer===null?"#fff":"rgba(255,255,255,0.45)",border:`1px solid ${selectedDirectoryCareer===null?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"6px 16px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:selectedDirectoryCareer===null?700:400}}>
                All Fields
              </button>
              {engine.getCareerNames().map(name => {
                const c = engine.getCareer(name);
                const count = specialtyMentors(name).length;
                const active = selectedDirectoryCareer === name;
                return (
                  <button key={name} onClick={()=>setSelectedDirectoryCareer(active ? null : name)}
                    style={{background:active?`${c.color}22`:"rgba(255,255,255,0.03)",color:active?c.accent:"rgba(255,255,255,0.45)",border:`1px solid ${active?c.color:c.color+"33"}`,borderRadius:20,padding:"6px 16px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:active?700:400,display:"flex",alignItems:"center",gap:6}}>
                    <span>{c.icon}</span>{name}
                    <span style={{background:active?`${c.color}40`:"rgba(255,255,255,0.08)",color:active?c.accent:"rgba(255,255,255,0.35)",borderRadius:10,padding:"1px 7px",fontSize:11}}>{count}</span>
                  </button>
                );
              })}
            </div>

            {mentorsForCareer.length === 0 ? (
              <div style={{textAlign:"center", padding:"48px 0"}}>
                <div style={{fontSize:40, marginBottom:12}}>👤</div>
                <p style={{color:"rgba(255,255,255,0.3)", fontSize:15}}>No mentors yet in this specialty.</p>
              </div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(270px, 1fr))", gap:16}}>
                {mentorsForCareer.map(([uname, u]) => {
                  const c = engine.getCareer(u.specialty);
                  const repliedCount = forumPosts.filter(p => (p.replies||[]).some(r => r.author_username === uname)).length;
                  const isHovered = hoveredMentor === uname;
                  return (
                    <div key={uname}
                      onMouseEnter={()=>setHoveredMentor(uname)} onMouseLeave={()=>setHoveredMentor(null)}
                      style={{background:isHovered?`${c?.color||"#a855f7"}0d`:"rgba(255,255,255,0.025)",border:`1px solid ${isHovered?(c?.color||"#a855f7")+"55":"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"22px",transition:"all 0.2s",display:"flex",flexDirection:"column",gap:0}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14}}>
                        <div style={{width:52,height:52,borderRadius:"50%",background:`${c?.color||"#a855f7"}18`,border:`2px solid ${c?.color||"#a855f7"}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                          {u.avatar || "👤"}
                        </div>
                        <div style={{display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end"}}>
                          <Badge text={u.specialty} color={c?.color||"#a855f7"} />
                          {repliedCount > 0 && <span style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>{repliedCount} answer{repliedCount>1?"s":""}</span>}
                        </div>
                      </div>
                      <div style={{marginBottom:16, flex:1}}>
                        <div style={{color:"#fff", fontWeight:700, fontSize:15, marginBottom:3}}>{u.name}</div>
                        <div style={{color:"rgba(255,255,255,0.5)", fontSize:13, marginBottom:2}}>{u.title}</div>
                        <div style={{color:"rgba(255,255,255,0.3)", fontSize:12, display:"flex", alignItems:"center", gap:5}}><span>🏢</span>{u.org}</div>
                      </div>
                      <div style={{display:"flex", gap:8}}>
                        <button onClick={()=>startAsk(u.specialty, uname)}
                          style={{flex:1,background:c?.color||"#a855f7",color:"#fff",border:"none",borderRadius:8,padding:"9px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:700}}>
                          Ask {u.name.split(" ").slice(-1)[0]} →
                        </button>
                        <button onClick={()=>{ setSelectedDirectoryCareer(u.specialty); setDiscView("posts"); }}
                          style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer"}}>
                          Posts
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ASK A QUESTION */}
        {discView === "ask" && (
          <div style={{maxWidth:680}}>
            <h2 style={{color:"#fff", fontSize:22, fontWeight:700, margin:"0 0 6px"}}>Ask a Question</h2>
            <p style={{color:"rgba(255,255,255,0.38)", fontSize:14, marginBottom:24}}>Questions are matched to mentors by specialty.</p>

            <div style={{marginBottom:22}}>
              <label style={{color:"rgba(255,255,255,0.45)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:10}}>Step 1 — Choose a Career Area</label>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {engine.getCareerNames().map(n => {
                  const c = engine.getCareer(n);
                  const active = newQuestionCareer === n;
                  return (
                    <button key={n} onClick={()=>{ setNewQuestionCareer(n); setTaggedMentor(null); }}
                      style={{background:active?`${c.color}20`:"rgba(255,255,255,0.04)",border:`2px solid ${active?c.color:c.color+"33"}`,borderRadius:10,padding:"10px 16px",cursor:"pointer",fontFamily:"'Georgia',serif",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{c.icon}</span>
                      <div style={{textAlign:"left"}}>
                        <div style={{color:active?"#fff":"rgba(255,255,255,0.55)",fontSize:13,fontWeight:active?700:400}}>{n}</div>
                        <div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>{specialtyMentors(n).length} mentor{specialtyMentors(n).length!==1?"s":""}</div>
                      </div>
                      {active && <span style={{color:c.color,fontSize:14}}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{marginBottom:22}}>
              <label style={{color:"rgba(255,255,255,0.45)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:6}}>
                Step 2 — Tag a Mentor <span style={{color:"rgba(255,255,255,0.22)",fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:8,fontSize:11}}>optional</span>
              </label>
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                <button onClick={()=>setTaggedMentor(null)}
                  style={{background:taggedMentor===null?"rgba(168,85,247,0.1)":"rgba(255,255,255,0.02)",border:`1px solid ${taggedMentor===null?"rgba(168,85,247,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"12px 16px",cursor:"pointer",fontFamily:"'Georgia',serif",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(168,85,247,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📢</div>
                  <div style={{textAlign:"left",flex:1}}>
                    <div style={{color:taggedMentor===null?"#fff":"rgba(255,255,255,0.6)",fontWeight:taggedMentor===null?700:400,fontSize:13}}>Broadcast to all {newQuestionCareer} mentors</div>
                    <div style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>{specialtyMentors(newQuestionCareer).length} mentor{specialtyMentors(newQuestionCareer).length!==1?"s":""} will be notified</div>
                  </div>
                  {taggedMentor===null && <span style={{color:"#a855f7",fontSize:16}}>✓</span>}
                </button>
                {specialtyMentors(newQuestionCareer).map(([uname, u]) => {
                  const c = engine.getCareer(u.specialty);
                  const isTagged = taggedMentor === uname;
                  return (
                    <button key={uname} onClick={()=>setTaggedMentor(isTagged ? null : uname)}
                      style={{background:isTagged?"rgba(34,211,238,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${isTagged?"rgba(34,211,238,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"12px 16px",cursor:"pointer",fontFamily:"'Georgia',serif",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:`${c?.color||"#22d3ee"}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{u.avatar||"👤"}</div>
                      <div style={{textAlign:"left",flex:1}}>
                        <div style={{color:isTagged?"#22d3ee":"#fff",fontWeight:isTagged?700:600,fontSize:13}}>{u.name}</div>
                        <div style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>{u.title} · {u.org}</div>
                      </div>
                      {isTagged && <span style={{color:"#22d3ee",fontSize:16}}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {taggedMentor && selectedMentorObj && (
                <div style={{marginTop:12,background:"rgba(34,211,238,0.06)",border:"1px solid rgba(34,211,238,0.22)",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,fontSize:13}}>
                  <span style={{fontSize:18}}>{selectedMentorObj.avatar||"👤"}</span>
                  <span style={{color:"rgba(255,255,255,0.55)"}}>📌 Notifying <span style={{color:"#22d3ee",fontWeight:700}}>{selectedMentorObj.name}</span> directly</span>
                  <button onClick={()=>setTaggedMentor(null)} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:12}}>✕</button>
                </div>
              )}
            </div>

            <div style={{marginBottom:20}}>
              <label style={{color:"rgba(255,255,255,0.45)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>
                Step 3 — Your Question
                <span style={{color:"rgba(255,255,255,0.25)",fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:8,fontSize:11}}>
                  {newQuestion.trim().length}/10 min characters
                </span>
              </label>
              <textarea value={newQuestion} onChange={e=>setNewQuestion(e.target.value)} rows={4}
                placeholder="Be specific — the more detail you give, the better the guidance you'll get."
                style={{...inputBase,resize:"vertical",borderColor:newQuestion.trim().length > 0 && newQuestion.trim().length < 10 ? "rgba(239,68,68,0.3)" : undefined}}/>
              {newQuestion.trim().length > 0 && newQuestion.trim().length < 10 && (
                <div style={{color:"rgba(239,68,68,0.7)",fontSize:12,marginTop:6}}>Question must be at least 10 characters</div>
              )}
            </div>

            <div style={{display:"flex", gap:12, alignItems:"center"}}>
              <button onClick={()=>{ submitForumQuestion(); setDiscView("posts"); }} disabled={newQuestion.trim().length < 10}
                style={{background:newQuestion.trim().length >= 10?"linear-gradient(90deg,#6d28d9,#a855f7)":"rgba(124,58,237,0.18)",color:"#fff",border:"none",borderRadius:9,padding:"12px 28px",fontFamily:"'Georgia',serif",fontSize:14,cursor:newQuestion.trim().length >= 10?"pointer":"default",fontWeight:700,boxShadow:newQuestion.trim().length >= 10?"0 4px 20px rgba(168,85,247,0.4)":"none"}}>
                {taggedMentor && selectedMentorObj ? `Ask ${selectedMentorObj.name.split(" ").slice(-1)[0]} →` : "Post to Mentors →"}
              </button>
              <button onClick={()=>setDiscView("directory")} style={{background:"none",color:"rgba(255,255,255,0.35)",border:"none",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer"}}>← Back</button>
            </div>
          </div>
        )}

        {/* FORUM POSTS */}
        {discView === "posts" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
              <div>
                <h2 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"0 0 6px"}}>Forum Posts</h2>
                <p style={{color:"rgba(255,255,255,0.38)",fontSize:14,margin:0}}>All student questions and professional replies</p>
              </div>
              {!isProfessional && (
                <button onClick={()=>setDiscView("ask")} style={{background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:700}}>+ Ask a Question</button>
              )}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {forumPosts.map(post => {
                const isOpen = expandedPost === post.id;
                // CHANGED: look up tagged mentor name from professionals prop
                const taggedMentorInfo = post.tagged_mentor
                  ? (allProfessionals.find(([u]) => u === post.tagged_mentor)?.[1] || null)
                  : null;
                const replies = post.replies || [];
                return (
                  <div key={post.id} style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${isOpen?"rgba(168,85,247,0.25)":"rgba(255,255,255,0.08)"}`,borderRadius:12,overflow:"hidden",transition:"border-color 0.2s"}}>
                    <div style={{padding:"18px 20px",cursor:"pointer"}} onClick={()=>setExpandedPost(isOpen?null:post.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(168,85,247,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#a855f7"}}>{(post.author_name||post.authorName||"?").charAt(0)}</div>
                          <div>
                            <span style={{color:"#fff",fontWeight:700,fontSize:13}}>{post.author_name||post.authorName}</span>
                            <span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}> · {post.created_at ? new Date(post.created_at).toLocaleDateString() : post.time}</span>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
                          <Badge text={post.career} color={engine.getCareer(post.career)?.color||"#a855f7"}/>
                          {taggedMentorInfo && (
                            <span style={{background:"rgba(34,211,238,0.1)",color:"#22d3ee",fontSize:11,padding:"3px 9px",borderRadius:20,border:"1px solid rgba(34,211,238,0.25)"}}>
                              📌 {taggedMentorInfo.name.split(" ").slice(-1)[0]}
                            </span>
                          )}
                          <span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>{replies.length} {replies.length===1?"reply":"replies"}</span>
                          <span style={{color:"rgba(255,255,255,0.25)",fontSize:12,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",display:"inline-block"}}>↓</span>
                        </div>
                      </div>
                      <p style={{color:"rgba(255,255,255,0.72)",fontSize:14,margin:0,lineHeight:1.6}}>{post.question}</p>
                    </div>

                    {isOpen && (
                      <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"16px 20px 20px",background:"rgba(0,0,0,0.18)"}}>
                        {replies.length > 0 && (
                          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                            {replies.map((reply, ri) => (
                              <div key={ri} style={{background:reply.is_professional||reply.isProfessional?"rgba(34,211,238,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${reply.is_professional||reply.isProfessional?"rgba(34,211,238,0.2)":"rgba(255,255,255,0.06)"}`,borderRadius:9,padding:"13px 16px"}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                    <span style={{color:reply.is_professional||reply.isProfessional?"#22d3ee":"rgba(255,255,255,0.55)",fontWeight:700,fontSize:13}}>{reply.author_name||reply.authorName}</span>
                                    {(reply.is_professional||reply.isProfessional) && <Badge text="PROFESSIONAL" color="#22d3ee"/>}
                                  </div>
                                  <span style={{color:"rgba(255,255,255,0.25)",fontSize:12}}>{reply.created_at ? new Date(reply.created_at).toLocaleDateString() : reply.time}</span>
                                </div>
                                <p style={{color:"rgba(255,255,255,0.65)",fontSize:13,margin:0,lineHeight:1.6}}>{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {replies.length === 0 && <p style={{color:"rgba(255,255,255,0.2)",fontSize:13,marginBottom:14}}>No replies yet.</p>}

                        {isProfessional && (
                          <div>
                            <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginBottom:8}}>Reply as <span style={{color:"#22d3ee",fontWeight:700}}>{currentUser.name}</span></div>
                            <textarea value={replyTexts[post.id]||""} onChange={e=>setReplyTexts(p=>({...p,[post.id]:e.target.value}))} rows={3}
                              placeholder="Share your professional insight..." style={{...inputBase,resize:"vertical",marginBottom:10}}/>
                            <button onClick={()=>submitReply(post.id)} disabled={!(replyTexts[post.id]||"").trim()}
                              style={{background:(replyTexts[post.id]||"").trim()?"#0e7490":"rgba(14,116,144,0.22)",color:"#fff",border:"none",borderRadius:7,padding:"9px 22px",fontFamily:"'Georgia',serif",fontSize:13,cursor:(replyTexts[post.id]||"").trim()?"pointer":"default",fontWeight:700}}>
                              Post Reply ✓
                            </button>
                          </div>
                        )}
                        {!isProfessional && (
                          <div style={{background:"rgba(168,85,247,0.05)",border:"1px solid rgba(168,85,247,0.15)",borderRadius:8,padding:"11px 16px",fontSize:13,color:"rgba(255,255,255,0.35)"}}>
                            💬 Only verified professionals can reply to questions.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussionPanel;
