import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import incidentService from "../../incidents/services/incidentService";
import projectService from "../../projects/services/projectService";
import authService from "../../auth/services/authService";
import { RiArrowRightLine, RiLoader4Line } from "@remixicon/react";
import Navbar from "../../../shared/components/Navbar";

const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const StatBox = ({ label, count, sub, valueColor = "text-white" }) => (
  <div className="bg-[#0A0A0A] border border-[var(--border-col)] rounded-[2px] p-6 flex flex-col justify-between h-[130px] transition-all hover:border-[var(--text-muted)]">
    <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</span>
    <div>
      <div className={`text-4xl font-display font-medium ${valueColor}`}>{count}</div>
      <div className="text-[0.7rem] font-mono uppercase tracking-wider text-[var(--text-muted)] mt-1">{sub}</div>
    </div>
  </div>
);

const SeverityBadge = ({ severity }) => {
  const colors = {
    low: "bg-blue-900/10 text-blue-400 border-blue-900/30",
    medium: "bg-amber-900/10 text-amber-400 border-amber-900/30",
    high: "bg-orange-900/10 text-orange-400 border-orange-900/30",
    critical: "bg-red-900/10 text-red-400 border-red-900/30",
  };
  const colorClass = colors[severity] || colors.medium;
  const num = severity === 'critical' ? '1' : severity === 'high' ? '2' : severity === 'medium' ? '3' : '4';
  return (
    <span className={`px-2 py-0.5 text-[0.6rem] font-mono uppercase border rounded-[1px] ${colorClass}`}>
      SEV-{num}
    </span>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  // Platform-level role: only 'admin' or 'responder'
  const platformRole = user?.role || "responder";
  
  const [incidents, setIncidents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("scrollbar-hide");
    return () => document.body.classList.remove("scrollbar-hide");
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [incRes, projRes] = await Promise.all([
          incidentService.getAllIncidents(),
          projectService.getAllProjects(),
        ]);
        setIncidents(incRes.incidents || []);
        setProjects(projRes.projects || []);

        if (platformRole === 'admin') {
          const usrRes = await authService.getAllUsers();
          setUsers(usrRes.users || []);
        }
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user, platformRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <RiLoader4Line className="animate-spin text-[var(--text-muted)]" size={32} />
        </div>
      </div>
    );
  }

  // Derive effective display role from live project membership.
  // A user is shown the "leader" view if they lead at least one project,
  // regardless of their platform role. Admins always see the admin view.
  const isLeaderOfAny = projects.some(p =>
    p.members?.some(m => m.user?._id === user?._id && m.role === "leader")
  );

  const role = platformRole === "admin"
    ? "admin"
    : isLeaderOfAny
    ? "leader"
    : "responder";

  // --- STATS CALCULATION ---
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  let activeCount = 0;
  let resolvedCount = 0;
  let totalResMs = 0;
  let resolvedForAvg = 0;

  incidents.forEach(inc => {
    const isAssigned = inc.members?.some(m => m._id === user?._id) || inc.leader?._id === user?._id;
    
    if (inc.status !== 'resolved') {
      if (role === 'responder') {
        if (isAssigned) activeCount++;
      } else {
        activeCount++;
      }
    } else {
      const resolvedAt = inc.resolvedAt ? new Date(inc.resolvedAt) : new Date(inc.updatedAt);
      if (resolvedAt >= oneWeekAgo) {
        if (role === 'responder') {
           if (isAssigned) resolvedCount++;
        } else {
           resolvedCount++;
        }
        const created = new Date(inc.createdAt);
        totalResMs += (resolvedAt.getTime() - created.getTime());
        resolvedForAvg++;
      }
    }
  });

  const avgMin = resolvedForAvg > 0 ? Math.round(totalResMs / resolvedForAvg / 60000) : 0;

  // --- FILTERED LISTS ---
  const activeIncidentsList = incidents.filter(i => {
    if (i.status === 'resolved') return false;
    if (role === 'responder') return i.members?.some(m => m._id === user?._id) || i.leader?._id === user?._id;
    return true;
  });

  const displayProjects = projects;

  // --- RENDERING CONFIG ---
  const config = {
    admin: {
      alert: "ADMINISTRATIVE ACCESS — VIEWING GLOBAL NUMBERS ACROSS ALL TEAMS",
      activeTitle: "ACTIVE INCIDENTS",
      projTitle: "ALL PROJECTS"
    },
    leader: {
      alert: "LEADER VIEW — SCOPED TO MANAGED PROJECTS",
      activeTitle: "ACTIVE INCIDENTS",
      projTitle: "PROJECTS YOU LEAD"
    },
    responder: {
      alert: "RESPONDER WORKSPACE — INDIVIDUAL SCOPE",
      activeTitle: "ASSIGNED TO ME",
      projTitle: "MY PROJECTS"
    }
  };
  
  const ui = config[role] || config.responder;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-white/20 flex flex-col scrollbar-hide">
      <Navbar />
      
      <main className="flex-1 w-full px-6 py-12 lg:py-16">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-[1px] w-8 bg-accent" />
             <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white mb-4 tracking-tight">
            Hello {user?.username}
          </h1>
          <p className="text-[var(--text-muted)] font-mono text-[0.75rem] uppercase tracking-[0.15em]">
            ROLE: <span className="text-white">{role}</span>. EMAIL: <span className="text-white">{user?.email}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatBox 
            label={role === 'member' ? "ASSIGNED" : "ACTIVE"} 
            count={activeCount} 
            sub={role === 'admin' ? "Global incidents" : role === 'leader' ? "In your projects" : "Needs attention"} 
            valueColor="text-red-400"
          />
          <StatBox 
            label="RESOLVED" 
            count={resolvedCount} 
            sub={role === 'member' ? "By you this month" : `Avg ${avgMin} min MTTR`} 
            valueColor="text-green-400"
          />
          {role === 'admin' && (
            <StatBox 
              label="USERS" 
              count={users.length} 
              sub={`Across ${projects.length} nodes`} 
              valueColor="text-blue-400"
            />
          )}
        </div>

        {/* Alert Banner */}
        <div className="bg-[#1E293B]/20 border border-blue-900/30 text-blue-400 px-6 py-4 rounded-[2px] text-[0.7rem] font-mono uppercase tracking-[0.1em] mb-16 flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          {ui.alert}
        </div>

        {/* Active Incidents List */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-8 border-b border-[var(--border-col)] pb-4">
            <div>
              <h2 className="text-[0.75rem] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">
                {ui.activeTitle}
              </h2>
              <div className="h-[2px] w-12 bg-white" />
            </div>
            {role !== 'member' && (
              <Link to="/incidents" className="text-[0.7rem] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-white flex items-center gap-2 transition-all">
                View All <RiArrowRightLine size={14} />
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {activeIncidentsList.length === 0 ? (
              <div className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)] py-8 border border-dashed border-[var(--border-col)] text-center rounded-[2px]">
                No active incidents detected.
              </div>
            ) : (
              activeIncidentsList.slice(0, 5).map(inc => (
                <Link key={inc._id} to={`/incidents/${inc._id}`} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#0A0A0A] border border-[var(--border-col)] rounded-[2px] hover:border-[var(--text-muted)] transition-all gap-4 group">
                  <div className="flex items-center gap-6">
                    <SeverityBadge severity={inc.severity} />
                    <span className="font-medium text-[1rem] text-white group-hover:text-accent transition-colors">{inc.title}</span>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                    {role === 'member' && <span className="text-[0.7rem] font-mono uppercase tracking-wider text-[var(--text-muted)] hidden md:block">{inc.projectId?.name}</span>}
                    <span className="text-[0.7rem] font-mono uppercase text-[var(--text-muted)]">{timeAgo(inc.createdAt)}</span>
                    <span className={`px-3 py-1 text-[0.6rem] uppercase font-mono tracking-widest rounded-[1px] border ${
                      inc.status === 'open' ? 'bg-red-900/10 text-red-400 border-red-900/20' : 
                      inc.status === 'active' ? 'bg-amber-900/10 text-amber-400 border-amber-900/20' : 
                      'bg-blue-900/10 text-blue-400 border-blue-900/20'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-8 border-b border-[var(--border-col)] pb-4">
            <div>
              <h2 className="text-[0.75rem] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">
                {ui.projTitle}
              </h2>
              <div className="h-[2px] w-12 bg-white" />
            </div>
            {role === 'admin' && (
              <Link to="/projects" className="text-[0.7rem] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-white flex items-center gap-2 transition-all">
                Manage <RiArrowRightLine size={14} />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.length === 0 ? (
              <div className="col-span-full font-mono text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)] py-8 border border-dashed border-[var(--border-col)] text-center rounded-[2px]">
                No projects registered.
              </div>
            ) : (
              displayProjects.slice(0, 6).map(proj => {
                const projIncs = incidents.filter(i => i.projectId?._id === proj._id);
                const pActive = projIncs.filter(i => i.status !== 'resolved').length;
                const pResolved = projIncs.filter(i => i.status === 'resolved').length;
                
                return (
                  <Link key={proj._id} to={`/projects/${proj._id}`} className="block p-8 bg-[#0A0A0A] border border-[var(--border-col)] rounded-[2px] hover:border-[var(--text-muted)] transition-all">
                    <h3 className="font-semibold text-white text-[1.1rem] mb-2">{proj.name}</h3>
                    <p className="text-[0.7rem] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-6">
                      {role === 'member' ? (
                          `Joined ${new Date(proj.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })}`
                      ) : (
                          `LDR: ${proj.members?.find(m => m.role === 'leader')?.user?.username || '---'} · ${proj.members?.length || 0} OPS`
                      )}
                    </p>
                    <div className="flex items-center gap-4 text-[0.7rem] font-mono uppercase tracking-widest">
                      <span className="text-white"><span className="text-red-400">{pActive}</span> ACTIVE</span>
                      <span className="text-[var(--text-muted)]">/</span>
                      <span className="text-white"><span className="text-green-400">{pResolved}</span> RESOLVED</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Users List (Admin Only) */}
        {role === 'admin' && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-8 border-b border-[var(--border-col)] pb-4">
              <div>
                <h2 className="text-[0.75rem] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">
                  RECENT USERS
                </h2>
                <div className="h-[2px] w-12 bg-white" />
              </div>
              <Link to="#" className="text-[0.7rem] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-white flex items-center gap-2 transition-all">
                User Admin <RiArrowRightLine size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.slice(0, 6).map(u => (
                <div key={u._id} className="flex items-center justify-between p-6 bg-[#0A0A0A] border border-[var(--border-col)] rounded-[2px] hover:border-[var(--text-muted)] transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-[2px] bg-[#1A1A1A] flex items-center justify-center text-[0.8rem] text-white font-mono border border-[var(--border-col)] shrink-0">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-white text-[1rem] truncate max-w-[120px] sm:max-w-[200px]">{u.username}</span>
                      <span className="text-[0.65rem] font-mono uppercase tracking-wider text-[var(--text-muted)] hidden sm:block truncate max-w-[150px]">{u.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-3 py-1 text-[0.6rem] font-mono uppercase tracking-[0.2em] rounded-[1px] border ${
                      u.role === 'admin' ? 'bg-red-900/10 text-red-400 border-red-900/20' :
                      u.role === 'leader' ? 'bg-amber-900/10 text-amber-400 border-amber-900/20' :
                      'bg-blue-900/10 text-blue-400 border-blue-900/20'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DashboardPage;

