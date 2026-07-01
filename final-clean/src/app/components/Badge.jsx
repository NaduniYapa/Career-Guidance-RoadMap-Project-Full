export const Pill = ({ children, active, color = "#a855f7", onClick }) => (
  <button onClick={onClick} style={{background:active?color:"rgba(255,255,255,0.05)",color:active?"#fff":"rgba(255,255,255,0.5)",border:`1px solid ${active?color:"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"6px 16px",fontSize:13,cursor:"pointer",fontFamily:"'Georgia',serif",fontWeight:active?700:400,transition:"all 0.2s"}}>
    {children}
  </button>
);

const Badge = ({ text, color = "#a855f7" }) => (
  <span style={{background:`${color}20`,color,fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:700,letterSpacing:"0.05em",border:`1px solid ${color}40`}}>{text}</span>
);

export default Badge;
