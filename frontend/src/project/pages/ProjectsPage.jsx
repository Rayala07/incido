import { useRef, useState } from 'react';
import { animate } from 'motion';
import Navbar from "../../components/shared/Navbar";
import CreateProjectModal from "../components/CreateProjectModal";

const initialProjects = [
  {
    id: 1,
    title: "Apollo Dashboard",
    description: "A real-time analytics dashboard built for monitoring satellite telemetry data streams across multiple missions.",
    status: "Active",
  },
  {
    id: 2,
    title: "Nebula Design System",
    description: "A comprehensive component library and design token system used across all internal products.",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Orbit API Gateway",
    description: "Centralised API gateway handling authentication, rate limiting, and routing for microservices.",
    status: "Completed",
  },
  {
    id: 4,
    title: "Pulsar Notifications",
    description: "A cross-platform push notification service supporting web, iOS, and Android delivery pipelines.",
    status: "Active",
  },
  {
    id: 5,
    title: "Vega Auth Service",
    description: "OAuth 2.0 and SSO implementation with support for multi-tenant organisations and role-based access.",
    status: "In Progress",
  },
  {
    id: 6,
    title: "Comet File Storage",
    description: "Distributed object storage service with CDN integration, versioning, and automated backup policies.",
    status: "Completed",
  },
];

const truncateDescription = (desc) => {
  const words = desc.split(' ');
  if (words.length <= 8) return desc;
  return words.slice(0, 8).join(' ') + '...';
};

const ProjectCard = ({ project }) => {
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
      >
        <div className="mb-5">
          <h3 className="font-display font-bold text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-tight transition-colors duration-300">
            {project.title}
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
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = (newProject) => {
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    setProjects([{ id: newId, ...newProject }, ...projects]);
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="h-9 px-6 bg-accent text-[var(--accent-text)] font-mono text-[0.72rem] font-medium uppercase tracking-[0.15em] border-none rounded-none cursor-pointer transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0"
            >
              + Create Project
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

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
