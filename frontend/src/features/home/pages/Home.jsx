import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { animate } from "motion";
import {
  RiBrainLine,
  RiFileList3Line,
  RiGroupLine,
  RiShieldCheckLine,
  RiFolderShieldLine,
  RiArrowRightLine,
} from "@remixicon/react";
import Navbar from "../../../shared/components/Navbar";

// ──────────────────────────────────────────────────────────────
// HERO SECTION
// ──────────────────────────────────────────────────────────────
const HeroSection = () => {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const subheadRef = useRef(null);
  const ctaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Staggered headline entrance
    const lines = [line1Ref.current, line2Ref.current, line3Ref.current];
    lines.forEach((line, i) => {
      if (!line) return;
      animate(
        line,
        { opacity: [0, 1], y: [40, 0] },
        { delay: i * 0.12, type: "spring", stiffness: 80, damping: 15 }
      );
    });

    // Subheadline entrance
    if (subheadRef.current) {
      animate(
        subheadRef.current,
        { opacity: [0, 1], y: [20, 0] },
        { delay: 0.4, duration: 0.5, ease: "easeOut" }
      );
    }

    // CTA Button entrance
    if (ctaRef.current) {
      animate(
        ctaRef.current,
        { opacity: [0, 1], scale: [0.95, 1] },
        { delay: 0.55, type: "spring", stiffness: 200, damping: 18 }
      );
    }
  }, []);

  const handleCtaEnter = () => {
    if (!ctaRef.current) return;
    animate(
      ctaRef.current,
      { scale: 1.05, y: -2 },
      { type: "spring", stiffness: 400, damping: 20 }
    );
  };

  const handleCtaLeave = () => {
    if (!ctaRef.current) return;
    animate(
      ctaRef.current,
      { scale: 1, y: 0 },
      { type: "spring", stiffness: 300, damping: 20 }
    );
  };

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-[var(--bg-base)]">
      {/* Background visual enhancement */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>
      <div className="grain-overlay opacity-10" />

      <div className="relative z-10 max-w-5xl px-6 flex flex-col items-center text-center">
        <h1 className="font-display font-semibold text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tight text-[var(--text-primary)] uppercase flex flex-col gap-2">
          <span ref={line1Ref} className="block" style={{ opacity: 0 }}>Respond faster.</span>
          <span ref={line2Ref} className="block text-[var(--text-secondary)]" style={{ opacity: 0 }}>Resolve smarter.</span>
          <span ref={line3Ref} className="block text-[var(--accent)]" style={{ opacity: 0 }}>Never repeat it twice.</span>
        </h1>

        <p
          ref={subheadRef}
          className="mt-10 font-mono text-[clamp(0.7rem,1.5vw,0.85rem)] uppercase tracking-[0.15em] text-[var(--text-muted)] max-w-2xl leading-relaxed"
          style={{ opacity: 0 }}
        >
          AI-powered incident response, postmortem intelligence, and team coordination.
        </p>

        <div className="mt-12 flex items-center justify-center">
          <button
            ref={ctaRef}
            onMouseEnter={handleCtaEnter}
            onMouseLeave={handleCtaLeave}
            onClick={() => navigate("/dashboard")}
            style={{ opacity: 0 }}
            className="flex items-center gap-3 bg-[var(--accent)] text-[var(--accent-text)] h-12 px-8 font-mono text-[0.8rem] uppercase tracking-widest font-medium border-none cursor-pointer transform-gpu will-change-transform hover:shadow-lg hover:shadow-blue-500/30 transition-shadow duration-300"
          >
            <span>Go to Dashboard</span>
            <RiArrowRightLine size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────
// FEATURE HIGHLIGHTS
// ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc }) => {
  const cardRef = useRef(null);
  const iconRef = useRef(null);

  const handleEnter = () => {
    if (!cardRef.current || !iconRef.current) return;
    animate(
      cardRef.current,
      { y: -6, scale: 1.02 },
      { type: "spring", stiffness: 350, damping: 22 }
    );
    animate(
      iconRef.current,
      { scale: 1.18, y: -3 },
      { type: "spring", stiffness: 400, damping: 18 }
    );
  };

  const handleLeave = () => {
    if (!cardRef.current || !iconRef.current) return;
    animate(
      cardRef.current,
      { y: 0, scale: 1 },
      { type: "spring", stiffness: 300, damping: 20 }
    );
    animate(
      iconRef.current,
      { scale: 1, y: 0 },
      { type: "spring", stiffness: 300, damping: 20 }
    );
  };

  return (
    <div style={{ perspective: "800px" }} className="w-full h-full">
      <div
        ref={cardRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="border border-[var(--border-col)] bg-[var(--bg-card)] p-8 flex flex-col h-full transform-gpu will-change-transform cursor-default"
      >
        <div
          ref={iconRef}
          className="w-12 h-12 flex items-center justify-center bg-[var(--accent-subtle)] mb-6 transform-gpu will-change-transform"
        >
          <Icon size={20} className="text-[var(--accent)]" />
        </div>
        <h3 className="font-sans font-bold text-[1.1rem] text-[var(--text-primary)] mb-2">
          {title}
        </h3>
        <p className="font-sans text-[0.85rem] text-[var(--text-secondary)] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: RiBrainLine,
      title: "Incident Intelligence",
      desc: "AI instantly scans for past similar incidents to save your team critical debugging hours.",
    },
    {
      icon: RiFileList3Line,
      title: "Postmortem Reports",
      desc: "Comprehensive postmortem reports automatically generated from the full timeline data.",
    },
    {
      icon: RiGroupLine,
      title: "Role-Based Access",
      desc: "Scoped, secure views built specifically for Admins, Team Leaders, and Members.",
    },
    {
      icon: RiShieldCheckLine,
      title: "AI Action Badges",
      desc: "AI-analyzed recommendations for permanent fixes to prevent future downtime.",
    },
    {
      icon: RiFolderShieldLine,
      title: "Project-Based Context",
      desc: "Incidents are securely scoped under projects with assigned, responsible teams.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-[var(--bg-base)] border-t border-[var(--border-col)]">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Row 1: 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {features.slice(0, 3).map((feat, idx) => (
            <FeatureCard key={idx} icon={feat.icon} title={feat.title} desc={feat.desc} />
          ))}
        </div>
        {/* Row 2: 2 cards centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          {features.slice(3, 5).map((feat, idx) => (
            <FeatureCard key={idx} icon={feat.icon} title={feat.title} desc={feat.desc} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────
// HOW IT WORKS
// ──────────────────────────────────────────────────────────────
const HowItWorksSection = () => {
  const containerRef = useRef(null);
  const stepRefs = useRef([]);
  const connectorRefs = useRef([]);

  useEffect(() => {
    const stepElements = stepRefs.current.filter(Boolean);
    const connectorElements = connectorRefs.current.filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepElements.indexOf(entry.target);
            if (index !== -1) {
              // Animate step
              animate(
                entry.target,
                { opacity: [0, 1], y: [30, 0] },
                { delay: index * 0.12, duration: 0.5, type: "spring", stiffness: 100, damping: 16 }
              );

              // Animate connector line before it if it exists
              if (index > 0 && connectorElements[index - 1]) {
                animate(
                  connectorElements[index - 1],
                  { scaleX: [0, 1] },
                  { delay: index * 0.12 + 0.1, duration: 0.4, ease: "easeOut" }
                );
              }
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    stepElements.forEach((el) => {
      if (el) {
        el.style.opacity = "0";
        observer.observe(el);
      }
    });

    connectorElements.forEach((el) => {
      if (el) el.style.transform = "scaleX(0)";
    });

    return () => observer.disconnect();
  }, []);

  const steps = [
    { num: "01", title: "Create Project", desc: "Define your scope and assign leadership." },
    { num: "02", title: "Raise Incident", desc: "File an issue. AI checks the memory bank." },
    { num: "03", title: "Timeline Log", desc: "Team responds and logs structured updates." },
    { num: "04", title: "Postmortem", desc: "AI generates the final report and action badges." },
  ];

  return (
    <section className="py-32 px-6 bg-[var(--bg-card)] border-t border-[var(--border-col)] overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        
        <div className="mb-20">
          <h2 className="font-display font-semibold text-[2rem] text-[var(--text-primary)] uppercase">
            The Lifecycle
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-0 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 relative flex flex-col md:flex-row">
              {/* Connector line (not for the last item) */}
              {idx < steps.length - 1 && (
                <div
                  ref={(el) => (connectorRefs.current[idx] = el)}
                  className="hidden md:block absolute top-6 left-12 right-0 h-px bg-[var(--border-col)] z-0"
                  style={{ transformOrigin: "left", transform: "scaleX(0)" }}
                />
              )}

              {/* Step Card */}
              <div
                ref={(el) => (stepRefs.current[idx] = el)}
                className="group flow-step relative z-10 flex flex-col md:pr-8 w-full"
                style={{ opacity: 0 }}
              >
                <div className="w-12 h-12 bg-[var(--bg-base)] border border-[var(--border-col)] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)]">
                  <span className="font-mono text-[0.8rem] text-[var(--accent)] font-bold transition-colors duration-300 group-hover:text-blue-400">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-sans font-bold text-[1rem] text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="font-sans text-[0.85rem] text-[var(--text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────
// FOOTER STRIP
// ──────────────────────────────────────────────────────────────
const FooterStrip = () => {
  return (
    <footer className="bg-[var(--bg-base)] border-t border-[var(--border-col)] py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-7 border border-dashed border-[var(--border-col)] rounded-none shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
              [Logo]
            </span>
          </div>
          <span className="font-mono text-[0.65rem] text-[var(--text-primary)] uppercase tracking-widest font-bold">
            Incido
          </span>
        </div>
        
        <div>
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-muted)]">
            Built for engineers who ship at 3am.
          </span>
        </div>
      </div>
    </footer>
  );
};

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
const Home = () => {
  return (
    <div className="w-full min-h-screen bg-[var(--bg-base)] overflow-x-hidden selection:bg-[var(--accent)] selection:text-[var(--accent-text)]">
      <div className="absolute top-0 w-full z-50">
        <Navbar />
      </div>
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      
      <FooterStrip />
    </div>
  );
};

export default Home;