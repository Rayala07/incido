import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate } from 'motion';
import useAuth from "../../auth/hook/useAuth";
import projectService from '../services/projectService';
import Navbar from "../../components/shared/Navbar";
import CreateProjectModal from "../components/CreateProjectModal";

const truncateDescription = (desc) => {
  const words = desc.split(' ');
  if (words.length <= 8) return desc;
  return words.slice(0, 8).join(' ') + '...';
};

const ProjectCard = ({ project, onClick }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // max 8deg tilt
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 8;

    animate(cardRef.current, {
      rotateX,
      rotateY,
      translateZ: "12px",
      scale: 1.02,
    }, {
      duration: 0.1,
      easing: "ease-out"
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    animate(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: "0px",
      scale: 1,
    }, {
      duration: 0.4,
      easing: "ease-out"
    });
  };

  return (
    <div style={{ perspective: "1000px" }}>
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group bg-[var(--bg-card)] border border-[var(--border-col)] hover:border-[var(--accent)] hover:shadow-[0_0_0_1px_var(--accent)] p-7 rounded-none flex flex-col h-full cursor-pointer transform-gpu will-change-transform transition-colors duration-300"
        style={{ transformStyle: "preserve-3d" }}
        onClick={onClick}
      >
        <div className="mb-5">
          <h3 className="font-display font-bold text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-tight transition-colors duration-300">
            {project.name}
          </h3>
        </div>
        <p className="font-sans text-[0.85rem] text-[var(--text-muted)] leading-relaxed flex-1 whitespace-pre-wrap">
          {truncateDescription(project.description)}
        </p>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Fetch all projects when the page loads.
   */
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await projectService.getAllProjects();
      if (data.success) {
        setProjects(data.projects || []);
      } else {
        setError(data.message || "Failed to load projects.");
      }
    } catch (err) {
      setError("An error occurred while fetching projects.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /**
   * Handle the newly created project from the modal.
   * We prepend it to the state so it shows up instantly without reloading.
   */
  const handleCreateProject = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col relative">
      <Navbar />
      
      <main className="flex-1 w-full px-6 md:px-12 lg:px-16 py-10">
        <div className="w-full flex flex-col gap-10">
          
          {/* Header Row */}
          <div className="flex justify-between items-center w-full">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight">
              Projects
            </h1>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-9 px-6 bg-accent text-[var(--accent-text)] font-mono text-[0.72rem] font-medium uppercase tracking-[0.15em] border-none rounded-none cursor-pointer transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0"
              >
                + Create Project
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-[rgba(239,68,68,0.08)] border border-[#EF4444] px-4 py-3 font-mono text-[0.7rem] text-[#EF4444] uppercase tracking-wider">
              {error}
            </div>
          )}

          {/* Grid / Loading / Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-col)] p-7 h-48 animate-pulse flex flex-col justify-between">
                  <div className="w-3/4 h-6 bg-[var(--border-col)]" />
                  <div className="w-full h-16 bg-[var(--border-col)] opacity-50" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center border border-dashed border-[var(--border-col)]">
              <span className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">
                No Projects Found
              </span>
              <p className="font-sans text-[0.85rem] text-[var(--text-secondary)] text-center max-w-sm">
                You don't have any projects yet. Click the "+ Create Project" button to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onClick={() => navigate(`/projects/${project._id}`)}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateProject} 
      />
    </div>
  );
};

export default ProjectsPage;
