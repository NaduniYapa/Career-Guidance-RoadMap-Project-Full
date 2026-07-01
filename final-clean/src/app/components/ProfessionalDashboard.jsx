'use client';

import { useState } from 'react';
import { engine } from '@/engine';
import { inputBase } from '@/constants';
import Badge from './Badge';
import ChatBot from './ChatBot';
import { apiClient } from '@/lib/api-client';

function ProfessionalDashboard({ currentUser, notifications, setNotifications, forumPosts, setForumPosts, replyTexts, setReplyTexts, expandedPost, setExpandedPost, submitReply, handleLogout }) {
  const [profTab, setProfTab] = useState('notifications');

  const mySpecialty     = currentUser?.specialty || null;
  const myNotifications = notifications.filter(n => n.career === mySpecialty || n.tagged_mentor === currentUser.username);
  const unreadCount     = myNotifications.filter(n => !n.read).length;
  const myPosts         = forumPosts.filter(p => p.career === mySpecialty || p.tagged_mentor === currentUser.username);

  const markRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };
  const markAllRead = () => myNotifications.filter(n=>!n.read).forEach(n => markRead(n.id));

  return (
    <div style={{minHeight:"100vh", background:"#060d14", fontFamily:"'Georgia',serif"}}>
      <nav style={{background:"linear-gradient(90deg,#0c4a6e,#0e7490,#0891b2)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", height:56, position:"sticky", top:0, zIndex:200, boxShadow:"0 2px 24px rgba(8,145,178,0.45)"}}>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{currentUser.avatar||"👤"}</div>
          <div>
            <div style={{color:"#fff", fontWeight:700, fontSize:15}}>{currentUser.name}</div>
            <div style={{color:"rgba(255,255,255,0.45)", fontSize:11}}>{currentUser.title} · {currentUser.org}</div>
          </div>
          <Badge text="VERIFIED PROFESSIONAL" color="#22d3ee" />
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <button onClick={()=>setProfTab("notifications")} style={{background:profTab==="notifications"?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.06)",color:"#fff",border:"none",borderRadius:7,padding:"8px 18px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontWeight:profTab==="notifications"?700:400}}>
            🔔 Notifications
            {unreadCount > 0 && <span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:800,borderRadius:10,padding:"2px 7px"}}>{unreadCount}</span>}
          </button>
          <button onClick={()=>setProfTab("forum")} style={{background:profTab==="forum"?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.06)",color:"#fff",border:"none",borderRadius:7,padding:"8px 18px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:profTab==="forum"?700:400}}>
            💬 All Questions
          </button>
          <button onClick={handleLogout} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.45)",border:"none",borderRadius:6,padding:"7px 14px",fontFamily:"'Georgia',serif",fontSize:12,cursor:"pointer",marginLeft:8}}>↩ Log Out</button>
        </div>
      </nav>

      <div style={{padding:"36px 52px", maxWidth:900}}>
        <div style={{display:"flex", gap:14, marginBottom:32}}>
          {[
            { label:"Unread",             value:unreadCount,                                                                                    icon:"🔔", color:"#22d3ee" },
            { label:"Questions to answer",value:myPosts.filter(p=>(p.replies||[]).length===0).length,                                          icon:"⚡", color:"#f59e0b" },
            { label:"Already replied",    value:myPosts.filter(p=>(p.replies||[]).some(r=>r.author_username===currentUser.username)).length,    icon:"✅", color:"#10b981" },
            { label:"Your specialty",     value:mySpecialty||"All",                                                                            icon:"🎓", color:"#a855f7", wide:true },
          ].map(s=>(
            <div key={s.label} style={{flex:s.wide?2:1,background:"rgba(255,255,255,0.03)",border:`1px solid ${s.color}25`,borderRadius:12,padding:"16px 18px"}}>
              <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
              <div style={{color:s.color,fontSize:s.wide?14:22,fontWeight:700}}>{s.value}</div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {profTab === "notifications" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div>
                <h2 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"0 0 4px"}}>🔔 Notifications</h2>
                <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:0}}>Questions matched to your specialty: <span style={{color:"#22d3ee",fontWeight:700}}>{mySpecialty}</span></p>
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{background:"rgba(34,211,238,0.08)",color:"#22d3ee",border:"1px solid rgba(34,211,238,0.2)",borderRadius:7,padding:"8px 16px",fontFamily:"'Georgia',serif",fontSize:13,cursor:"pointer",fontWeight:700}}>✓ Mark all read</button>
              )}
            </div>
            {myNotifications.length === 0 && (
              <div style={{textAlign:"center",padding:"70px 0"}}>
                <div style={{fontSize:52,marginBottom:16}}>🔕</div>
                <p style={{color:"rgba(255,255,255,0.3)",fontSize:15}}>No notifications yet.</p>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {myNotifications.map(notif => {
                const post = forumPosts.find(p => p.id === notif.post_id);
                return (
                  <div key={notif.id}
                    onClick={()=>{ markRead(notif.id); setProfTab("forum"); setExpandedPost(notif.post_id); }}
                    style={{background:notif.read?"rgba(255,255,255,0.02)":"rgba(34,211,238,0.06)",border:`1px solid ${notif.read?"rgba(255,255,255,0.07)":"rgba(34,211,238,0.28)"}`,borderRadius:12,padding:"18px 20px",cursor:"pointer",transition:"all 0.2s",position:"relative"}}>
                    {!notif.read && <div style={{position:"absolute",top:18,left:18,width:8,height:8,borderRadius:"50%",background:"#22d3ee"}} />}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,paddingLeft:notif.read?0:18}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{fontSize:18}}>❓</span>
                        <div>
                          <span style={{color:"#fff",fontWeight:700,fontSize:14}}>New question in </span>
                          <Badge text={notif.career} color={engine.getCareer(notif.career)?.color||"#22d3ee"} />
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:"rgba(255,255,255,0.28)",fontSize:12}}>{notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ""}</span>
                        {post && (post.replies||[]).length===0 && <Badge text="⚡ Needs reply" color="#f59e0b" />}
                        {post && (post.replies||[]).some(r=>r.author_username===currentUser.username) && <Badge text="✓ Replied" color="#10b981" />}
                      </div>
                    </div>
                    <p style={{color:"rgba(255,255,255,0.72)",fontSize:14,margin:"0 0 10px",lineHeight:1.55,paddingLeft:notif.read?28:46,fontStyle:"italic"}}>"{notif.question}"</p>
                    <div style={{paddingLeft:notif.read?28:46,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(168,85,247,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#a855f7"}}>{(notif.author_name||"?").charAt(0)}</div>
                      <span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>Asked by <span style={{color:"rgba(255,255,255,0.65)"}}>{notif.author_name}</span></span>
                      <span style={{color:"#22d3ee",fontSize:12,marginLeft:"auto",fontWeight:600}}>Click to reply →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profTab === "forum" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div>
                <h2 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"0 0 4px"}}>💬 Student Questions</h2>
                <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:0}}>All questions in your specialty</p>
              </div>
              <Badge text={`✓ ${currentUser.title}`} color="#22d3ee" />
            </div>
            {myPosts.length === 0 && <p style={{color:"rgba(255,255,255,0.3)",fontSize:14}}>No questions yet in your specialty area.</p>}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {myPosts.map(post => {
                const isOpen = expandedPost === post.id;
                const replies = post.replies || [];
                const alreadyReplied = replies.some(r => r.author_username === currentUser.username);
                return (
                  <div key={post.id} style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${isOpen?"rgba(34,211,238,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:12,overflow:"hidden"}}>
                    <div style={{padding:"18px 20px",cursor:"pointer"}} onClick={()=>setExpandedPost(isOpen?null:post.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(168,85,247,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#a855f7"}}>{(post.author_name||"?").charAt(0)}</div>
                          <div>
                            <span style={{color:"#fff",fontWeight:700,fontSize:13}}>{post.author_name}</span>
                            <span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}> · {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:7,alignItems:"center"}}>
                          {alreadyReplied && <Badge text="✓ Replied" color="#10b981" />}
                          {!alreadyReplied && replies.length===0 && <Badge text="⚡ Needs reply" color="#f59e0b" />}
                          <Badge text={post.career} color={engine.getCareer(post.career)?.color||"#a855f7"} />
                          <span style={{color:"rgba(255,255,255,0.3)",fontSize:12,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",display:"inline-block"}}>↓</span>
                        </div>
                      </div>
                      <p style={{color:"rgba(255,255,255,0.75)",fontSize:14,margin:0,lineHeight:1.55}}>{post.question}</p>
                    </div>
                    {isOpen && (
                      <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"16px 20px 20px",background:"rgba(0,0,0,0.2)"}}>
                        {replies.map((reply,ri) => (
                          <div key={ri} style={{background:reply.is_professional?"rgba(34,211,238,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${reply.is_professional?"rgba(34,211,238,0.2)":"rgba(255,255,255,0.06)"}`,borderRadius:9,padding:"12px 16px",marginBottom:9}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                                <span style={{color:reply.is_professional?"#22d3ee":"rgba(255,255,255,0.55)",fontWeight:700,fontSize:13}}>{reply.author_name}</span>
                                {reply.is_professional && <Badge text="PROFESSIONAL" color="#22d3ee" />}
                              </div>
                              <span style={{color:"rgba(255,255,255,0.25)",fontSize:12}}>{reply.created_at ? new Date(reply.created_at).toLocaleDateString() : ""}</span>
                            </div>
                            <p style={{color:"rgba(255,255,255,0.65)",fontSize:13,margin:0,lineHeight:1.6}}>{reply.text}</p>
                          </div>
                        ))}
                        {replies.length===0 && <p style={{color:"rgba(255,255,255,0.2)",fontSize:13,marginBottom:14}}>No replies yet — be the first to help!</p>}
                        <div>
                          <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginBottom:8}}>Reply as <span style={{color:"#22d3ee",fontWeight:700}}>{currentUser.name}</span> <Badge text="PROFESSIONAL" color="#22d3ee" /></div>
                          <textarea value={replyTexts[post.id]||""} onChange={e=>setReplyTexts(p=>({...p,[post.id]:e.target.value}))} rows={3}
                            placeholder="Share your professional insight..." style={{...inputBase,resize:"vertical",marginBottom:10}}/>
                          <button onClick={()=>submitReply(post.id)} disabled={!(replyTexts[post.id]||"").trim()}
                            style={{background:(replyTexts[post.id]||"").trim()?"#0e7490":"rgba(14,116,144,0.25)",color:"#fff",border:"none",borderRadius:7,padding:"10px 24px",fontFamily:"'Georgia',serif",fontSize:13,cursor:(replyTexts[post.id]||"").trim()?"pointer":"default",fontWeight:700}}>
                            Post Reply ✓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <ChatBot />
    </div>
  );
}

export default ProfessionalDashboard;
