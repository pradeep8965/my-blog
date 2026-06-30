import { useState, useEffect, useRef } from "react";

// ─── Sample Data ────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Backend", "Node.js", "Laravel", "Microservices", "DevOps"];

const POSTS = [
  {
    id: 1,
    title: "Building a Bulk SMS Gateway with Node.js & SMPP",
    excerpt: "How I architected a high-volume SMS platform capable of processing millions of messages using Moleculer.js microservices, Redis queues, and the SMPP protocol.",
    content: `When tasked with building a system that needed to handle millions of SMS messages daily, I quickly realized a monolithic architecture wouldn't cut it. Here's how I designed the Bulk SMS Gateway from scratch using Node.js and the SMPP protocol.\n\n**The Architecture**\n\nThe system is built around a microservices architecture using Moleculer.js. Each service has a single responsibility:\n\n- **SMPP Server** – Manages client connections and message intake\n- **Validator Service** – Validates incoming SMS data for format and compliance\n- **HLR Service** – Retrieves MCC/MNC codes via external vendors\n- **Routing Service** – Selects optimal vendor and pricing per message\n- **Send SMS Service** – Delivers messages and handles DLR responses\n- **Billing Service** – Tracks usage and calculates costs in real time\n\n**Redis as the Backbone**\n\nRedis serves dual purposes: a high-speed queue for message buffering and a caching layer for routing rules and vendor configs. This eliminated database bottlenecks during traffic spikes.\n\n**Lessons Learned**\n\nFault tolerance is not optional at this scale. Every service must handle failures gracefully and retry intelligently. Implementing dead-letter queues in Redis saved us from silently losing messages during vendor outages.`,
    category: "Microservices",
    date: "June 10, 2025",
    readTime: "6 min read",
    tags: ["Node.js", "SMPP", "Redis", "Moleculer.js"],
  },
  {
    id: 2,
    title: "Microservices vs Monolith: A Practical Backend Perspective",
    excerpt: "After building both, here's my honest take on when microservices actually make sense — and when they're overkill for your project.",
    content: `Two years of working with both architectures has given me a clear opinion on this debate. Let me share what I've learned in production environments.\n\n**When Monoliths Win**\n\nIf your team is small and the domain isn't well-understood yet, a monolith lets you move fast. There's no network latency between services, no distributed tracing setup, no service discovery overhead. For a Laravel app serving a small client — a monolith is often the right call.\n\n**When Microservices Win**\n\nOnce you hit scale or need independent deployability, microservices shine. In my SMS gateway project, separating the routing logic from the delivery logic meant I could update pricing algorithms without touching the SMPP layer. That kind of isolation is priceless at volume.\n\n**The Middle Ground**\n\nStart as a modular monolith. Design clean internal boundaries. Extract services only when the pain of sharing a process outweighs the cost of network communication. This is almost always the right sequence.\n\n**Bottom Line**\n\nDon't choose microservices for the architecture diagram. Choose them for the operational benefits they provide — and only when you're ready to manage that complexity.`,
    category: "Backend",
    date: "May 22, 2025",
    readTime: "5 min read",
    tags: ["Architecture", "Microservices", "Backend"],
  },
  {
    id: 3,
    title: "Redis Queues in Node.js: Beyond Simple Caching",
    excerpt: "Most developers use Redis only for caching. Here's how I used it as a high-performance message queue and buffer system in a production SMS platform.",
    content: `Redis is almost always introduced as a caching tool. But in my work on the SMS gateway platform, Redis became the heart of our entire message pipeline.\n\n**The Queue Architecture**\n\nEvery incoming SMS is pushed to a Redis list. Consumer workers (running as separate Moleculer.js services) pop from these lists and process messages. This decouples intake from delivery entirely.\n\n**Buffering for Rate Limiting**\n\nDifferent SMS vendors have different throughput limits. Redis sorted sets allowed us to schedule delayed message delivery — messages would be buffered and released at the exact rate each vendor could handle. This prevented vendor-side throttling errors.\n\n**Reliability Patterns**\n\nUsing RPOPLPUSH (now LMOVE), we implemented reliable queues where a message is only removed from the source list after successful processing. If a worker crashes mid-processing, the message stays in a processing list and gets recovered.\n\n**Key Takeaway**\n\nWhen you need sub-millisecond enqueue/dequeue with persistence guarantees and no separate broker infrastructure, Redis queues are hard to beat.`,
    category: "Node.js",
    date: "April 14, 2025",
    readTime: "4 min read",
    tags: ["Redis", "Node.js", "Queues", "Performance"],
  },
  {
    id: 4,
    title: "Building a Role-Based CRM in Laravel: 7 Roles, One Codebase",
    excerpt: "A deep dive into designing and implementing a complex role-based access control system in Laravel for an After-Sales CRM serving 7 distinct user types.",
    content: `Role-based access control sounds simple until you have 7 distinct user types with overlapping and conflicting permissions. Here's how I architected it cleanly in Laravel.\n\n**The Roles**\n\nSuper Admin → Admin → Customer Care → Warehouse → Service Center → Technician → Customer. Each role has a unique workflow and view of the system.\n\n**Implementation Strategy**\n\nI used Laravel's built-in Gates and Policies, extended with a custom middleware layer. Each route group is guarded by role middleware. Within views, Blade directives handle conditional rendering.\n\n**The Workflow Engine**\n\nThe most complex part was the job lifecycle — a complaint moves through: Logged → Assigned → Analyzed → Parts Requested → Technician Dispatched → Resolved → Closed. Each transition has validation rules and triggers notifications.\n\n**Warranty Logic**\n\nFree replacement under warranty, paid service otherwise. This logic is centralized in a single service class to avoid duplication across controllers.\n\n**What I'd Do Differently**\n\nI'd extract the role/permission system into a proper database-driven setup (like Spatie's Laravel Permission) from day one. Hard-coded role checks become a maintenance burden faster than you'd expect.`,
    category: "Laravel",
    date: "March 3, 2025",
    readTime: "7 min read",
    tags: ["Laravel", "PHP", "CRM", "RBAC"],
  },
  {
    id: 5,
    title: "Dockerizing Node.js Microservices: A Production Checklist",
    excerpt: "Lessons from containerizing a multi-service Node.js application. What worked, what broke in production, and the checklist I now follow every time.",
    content: `After deploying a multi-service Node.js app to production with Docker, I built a checklist that I now follow on every project. Here's what matters most.\n\n**Image Optimization**\n\nAlways use Alpine-based images (node:18-alpine). Multi-stage builds keep final images small — build stage installs devDependencies, production stage copies only what's needed.\n\n**Environment Configuration**\n\nNever bake secrets into images. Use Docker secrets or environment variable injection at runtime. I use a .env.example committed to git and .env injected at deploy time.\n\n**Health Checks**\n\nEvery service should expose a /health endpoint. Docker's HEALTHCHECK instruction uses this to manage container restarts intelligently.\n\n**Networking**\n\nServices communicate over a Docker bridge network by container name. No hardcoded IPs. This is where Moleculer.js shines — its service discovery handles this automatically.\n\n**Logging**\n\nLog to stdout/stderr only. Let Docker (or your orchestrator) handle log aggregation. Avoid writing logs to files inside containers.\n\n**The Checklist**\n\n✓ Alpine base image, ✓ Multi-stage build, ✓ Non-root user, ✓ Health check endpoint, ✓ Secrets via env, ✓ Named volumes for persistence, ✓ Resource limits set`,
    category: "DevOps",
    date: "February 18, 2025",
    readTime: "5 min read",
    tags: ["Docker", "DevOps", "Node.js", "Production"],
  },
  {
    id: 6,
    title: "REST API Design Principles I Wish I Knew Earlier",
    excerpt: "After building dozens of APIs in Node.js and Laravel, here are the design principles that have saved me the most debugging time and client complaints.",
    content: `Good API design is invisible — clients just use it and things work. Bad API design is very visible. Here are the principles I've internalized from building production APIs.\n\n**Versioning from Day One**\n\nAlways prefix your routes with /api/v1/. Even if you never release v2, this prefix signals that the API is versioned and sets client expectations correctly.\n\n**Consistent Response Shape**\n\nEvery response should follow the same envelope: { success, data, message, meta }. Clients shouldn't need to handle different shapes for different endpoints.\n\n**HTTP Status Codes Actually Matter**\n\n200 for success, 201 for created, 400 for client errors, 401 for auth failures, 404 for not found, 422 for validation errors, 500 for server errors. Don't return 200 with an error in the body.\n\n**Pagination Always**\n\nNever return unbounded lists. Always paginate with page/limit or cursor-based pagination. Document the max page size.\n\n**Error Messages for Developers**\n\nYour error messages are read by other developers. Be specific: "phone_number must be exactly 10 digits" not "invalid input".\n\n**Documentation is Part of the API**\n\nAn undocumented API is a broken API. I use Swagger/OpenAPI for every project now.`,
    category: "Backend",
    date: "January 5, 2025",
    readTime: "4 min read",
    tags: ["REST API", "Node.js", "Laravel", "Best Practices"],
  },
];

const SKILLS = [
  { name: "Node.js", level: 90 },
  { name: "Moleculer.js (Microservices)", level: 85 },
  { name: "PHP / Laravel", level: 85 },
  { name: "REST API Design", level: 90 },
  { name: "MySQL", level: 80 },
  { name: "Redis", level: 82 },
  { name: "Docker", level: 75 },
  { name: "React.js", level: 70 },
];

const PROJECTS = [
  {
    title: "Bulk SMS Sender Platform",
    desc: "Scalable microservices-based SMS gateway handling high-volume message processing with SMPP, Redis queues, and intelligent vendor routing.",
    tags: ["Node.js", "Moleculer.js", "Redis", "Docker", "SMPP"],
    highlight: "8 independent microservices",
  },
  {
    title: "After-Sales Service CRM",
    desc: "Full-featured Laravel CRM with 7 role-based access levels managing the complete service lifecycle from complaint to resolution.",
    tags: ["Laravel", "PHP", "MySQL", "RBAC"],
    highlight: "7 user roles, full lifecycle mgmt",
  },
  {
    title: "Telegram Visa & Passport Bot",
    desc: "Automated chatbot for an international airline client handling visa/passport queries with predefined workflows and real-time interaction.",
    tags: ["Node.js", "Telegram API", "Automation"],
    highlight: "Reduced manual workload significantly",
  },
];

const TIMELINE = [
  { year: "2023 – Present", title: "Full Stack Developer", org: "Dollor Infotech Pvt Ltd, Neemuch", desc: "Building scalable backend systems, microservices, and SMS infrastructure." },
  { year: "2023 – 2025", title: "Master of Science", org: "Gyanodaya Group of Management & Technology", desc: "Postgraduate studies, 70.92%." },
  { year: "2019 – 2023", title: "Bachelor of Science", org: "Gyanodaya Group of Management & Technology", desc: "Undergraduate studies, 77.58%." },
];

// EDIT THIS: Replace with real testimonials from colleagues/clients when you have them.
const TESTIMONIALS = [
  {
    name: "Add a colleague's name",
    role: "Team Lead, Dollor Infotech",
    quote: "Replace this with a real quote about working with Pradeep - his reliability, technical skill, or problem-solving ability.",
    initial: "?",
  },
  {
    name: "Add a client's name",
    role: "Project Client",
    quote: "Replace this with feedback from a client project, e.g. about the CRM or chatbot work.",
    initial: "?",
  },
];

const GITHUB_USERNAME = "pradeep8965";

// STEP REQUIRED: Replace this with YOUR Formspree endpoint.
// 1. Go to https://formspree.io and sign up free
// 2. Create a new form, it gives you a URL like: https://formspree.io/f/abcd1234
// 3. Paste that URL below
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

// Your WhatsApp number in international format, no + or spaces
const WHATSAPP_NUMBER = "919098925163";

// ─── Icons ───────────────────────────────────────────────────────────────────
const SearchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const ArrowIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>);
const BackIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>);
const ClockIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
const MailIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>);
const PhoneIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const LinkedinIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>);
const SunIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>);
const MoonIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>);
const DownloadIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>);
const StarIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279L0 9.306l8.332-1.151z"/></svg>);

// ─── Theme System ────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0a0a12", bgAlt: "#0f0f1f", cardBg: "rgba(255,255,255,0.03)", cardBgHover: "rgba(108,99,255,0.06)",
    border: "rgba(255,255,255,0.07)", borderHover: "rgba(108,99,255,0.3)", text: "#f0f0f8", textMuted: "#888",
    textDim: "#555", navBg: "rgba(10,10,18,0.95)", inputBg: "rgba(255,255,255,0.04)",
  },
  light: {
    bg: "#f7f7fb", bgAlt: "#ffffff", cardBg: "#ffffff", cardBgHover: "#f0effe",
    border: "rgba(0,0,0,0.08)", borderHover: "rgba(108,99,255,0.4)", text: "#16161f", textMuted: "#555",
    textDim: "#999", navBg: "rgba(255,255,255,0.95)", inputBg: "#ffffff",
  },
};

function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    document.body.style.background = THEMES[theme].bg;
    document.body.style.transition = "background 0.3s ease";
  }, [theme]);
  return [theme, setTheme];
}

// ─── Scroll Reveal Hook ──────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>{children}</div>
  );
}

// ─── Components ──────────────────────────────────────────────────────────────
function Navbar({ onNavigate, currentPage, theme, setTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = THEMES[theme];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = ["home", "projects", "skills", "timeline", "about", "contact"];
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? t.navBg : (theme === "dark" ? "rgba(10,10,18,0.7)" : "rgba(255,255,255,0.7)"),
      backdropFilter: "blur(16px)",
      borderBottom: scrolled ? `1px solid ${t.border}` : "1px solid transparent",
      padding: "0 24px", transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#fff", fontSize: 16,
          }}>P</div>
          <span style={{ color: t.text, fontWeight: 700, fontSize: 17 }}>
            Pradeep<span style={{ color: "#6C63FF" }}>.</span>dev
          </span>
        </button>

        <div className="nav-links" style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {links.map(p => (
            <button key={p} onClick={() => onNavigate(p)} style={{
              background: currentPage === p ? "rgba(108,99,255,0.15)" : "none",
              border: "none", cursor: "pointer", color: currentPage === p ? "#6C63FF" : t.textMuted,
              fontWeight: 500, fontSize: 14, padding: "7px 14px", borderRadius: 8,
              textTransform: "capitalize", transition: "all 0.2s",
            }}>{p}</button>
          ))}
          <a href="/my-blog/resume.pdf" download style={{
            display: "flex", alignItems: "center", gap: 6, background: "rgba(108,99,255,0.12)",
            border: "1px solid rgba(108,99,255,0.3)", borderRadius: 8, padding: "7px 14px",
            color: "#9d97ff", fontSize: 13, fontWeight: 600, textDecoration: "none", marginLeft: 8,
          }}><DownloadIcon /> Resume</a>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
            background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 8,
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            color: t.textMuted, cursor: "pointer", marginLeft: 4,
          }}>{theme === "dark" ? <SunIcon /> : <MoonIcon />}</button>
        </div>

        <div style={{ display: "none", alignItems: "center", gap: 8 }} className="mobile-controls">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
            background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 8,
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            color: t.textMuted, cursor: "pointer",
          }}>{theme === "dark" ? <SunIcon /> : <MoonIcon />}</button>
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} style={{
            background: "none", border: "none", color: t.text, cursor: "pointer",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M18 6 6 18M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ display: "flex", flexDirection: "column", paddingBottom: 16, gap: 4 }}>
          {links.map(p => (
            <button key={p} onClick={() => { onNavigate(p); setMobileOpen(false); }} style={{
              background: currentPage === p ? "rgba(108,99,255,0.15)" : "none",
              border: "none", cursor: "pointer", color: currentPage === p ? "#6C63FF" : t.textMuted,
              fontWeight: 500, fontSize: 15, padding: "12px 16px", borderRadius: 8,
              textTransform: "capitalize", textAlign: "left",
            }}>{p}</button>
          ))}
          <a href="/my-blog/resume.pdf" download style={{
            display: "flex", alignItems: "center", gap: 8, color: "#9d97ff", fontSize: 15, fontWeight: 600,
            padding: "12px 16px", textDecoration: "none",
          }}><DownloadIcon /> Download Resume</a>
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .nav-links { display: none !important; }
          .mobile-controls { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function Hero({ onNavigate }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #0a0a12 0%, #0f0f1f 60%, #0a0a12 100%)",
      padding: "80px 24px 70px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      <div className="blob blob1" style={{
        position: "absolute", top: "15%", left: "8%", width: 320, height: 320,
        background: "radial-gradient(circle, rgba(108,99,255,0.14) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)",
      }}/>
      <div className="blob blob2" style={{
        position: "absolute", top: "5%", right: "5%", width: 220, height: 220,
        background: "radial-gradient(circle, rgba(62,207,207,0.12) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(30px)",
      }}/>

      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
        {/* Profile Photo */}
        <Reveal>
          <div style={{
            width: 120, height: 120, borderRadius: "50%", margin: "0 auto 28px",
            background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
            padding: 3, boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 50px rgba(108,99,255,0.25)",
          }}>
            <img
              src="https://via.placeholder.com/300x300/14141f/6C63FF?text=PP"
              alt="Pradeep Prajapati"
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block", border: "3px solid #0a0a12" }}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{
            display: "inline-block", background: "rgba(108,99,255,0.12)",
            border: "1px solid rgba(108,99,255,0.3)", borderRadius: 100,
            padding: "6px 18px", marginBottom: 24,
            color: "#9d97ff", fontSize: 13, fontWeight: 600, letterSpacing: 1,
          }}>FULL-STACK DEVELOPER · OPEN TO WORK</div>
        </Reveal>

        <Reveal delay={0.2}>
          <h1 style={{
            color: "#fff", fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 800, lineHeight: 1.15, margin: "0 0 18px",
          }}>
            Hi, I'm Pradeep —<br/>
            <span style={{ background: "linear-gradient(90deg, #6C63FF, #3ECFCF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              I build scalable backends
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.3}>
          <p style={{ color: "#888", fontSize: 17, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            2+ years building SMS gateways, microservices, and CRM systems in production. Node.js · Laravel · Redis · Docker.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onNavigate("projects")} style={{
              background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
              border: "none", borderRadius: 10, padding: "13px 28px",
              color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>View Projects <ArrowIcon /></button>
            <button onClick={() => onNavigate("contact")} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "13px 28px", color: "#ddd",
              fontWeight: 700, fontSize: 15, cursor: "pointer",
            }}>Get in Touch</button>
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .blob1 { animation: float 8s ease-in-out infinite; }
        .blob2 { animation: float 10s ease-in-out infinite reverse; }
      `}</style>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub, theme = "dark" }) {
  const t = THEMES[theme];
  return (
    <Reveal>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ color: "#6C63FF", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>{eyebrow}</div>
        <h2 style={{ color: t.text, fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, margin: "0 0 12px" }}>{title}</h2>
        {sub && <p style={{ color: t.textMuted, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>{sub}</p>}
      </div>
    </Reveal>
  );
}

function PostCard({ post, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(post)}
      style={{
        background: hovered ? "rgba(108,99,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(108,99,255,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16, padding: "28px 28px 24px",
        cursor: "pointer", transition: "all 0.25s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(108,99,255,0.12)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ background: "rgba(108,99,255,0.15)", color: "#9d97ff", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 100 }}>{post.category}</span>
        <span style={{ color: "#555", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><ClockIcon /> {post.readTime}</span>
      </div>
      <h3 style={{ color: "#f0f0f8", fontSize: 19, fontWeight: 700, lineHeight: 1.4, margin: "0 0 12px" }}>{post.title}</h3>
      <p style={{ color: "#777", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>{post.excerpt}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {post.tags.slice(0, 2).map(t => (<span key={t} style={{ background: "rgba(62,207,207,0.08)", color: "#3ECFCF", fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>{t}</span>))}
        </div>
        <span style={{ color: "#555", fontSize: 12 }}>{post.date}</span>
      </div>
    </div>
  );
}

function PostDetail({ post, onBack }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <button onClick={onBack} style={{
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        color: "#aaa", borderRadius: 8, padding: "8px 16px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8, marginBottom: 36, fontSize: 13, fontWeight: 500,
      }}><BackIcon /> Back to Blog</button>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ background: "rgba(108,99,255,0.15)", color: "#9d97ff", fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 100 }}>{post.category}</span>
        <span style={{ color: "#555", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><ClockIcon /> {post.readTime}</span>
        <span style={{ color: "#555", fontSize: 13 }}>{post.date}</span>
      </div>

      <h1 style={{ color: "#f0f0f8", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.3, margin: "0 0 24px" }}>{post.title}</h1>
      <p style={{ color: "#9d97ff", fontSize: 17, lineHeight: 1.7, margin: "0 0 36px", fontStyle: "italic", borderLeft: "3px solid #6C63FF", paddingLeft: 20 }}>{post.excerpt}</p>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "32px 0", margin: "0 0 32px" }}>
        {post.content.split("\n\n").map((para, i) => {
          if (para.startsWith("**") && para.endsWith("**")) {
            return <h3 key={i} style={{ color: "#f0f0f8", fontSize: 18, fontWeight: 700, margin: "28px 0 12px" }}>{para.replace(/\*\*/g, "")}</h3>;
          }
          const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c0bcff">$1</strong>');
          return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ color: "#999", fontSize: 16, lineHeight: 1.85, margin: "0 0 18px" }} />;
        })}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {post.tags.map(t => (<span key={t} style={{ background: "rgba(62,207,207,0.08)", color: "#3ECFCF", fontSize: 12, padding: "5px 14px", borderRadius: 8, fontWeight: 600, border: "1px solid rgba(62,207,207,0.2)" }}>{t}</span>))}
      </div>

      <GiscusComments theme="dark" />
    </div>
  );
}

function BlogList({ onSelectPost }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = POSTS.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }} id="posts-section">
      <SectionHeading eyebrow="WRITING" title="Latest Articles" sub="Real-world backend engineering lessons from production systems" />

      <div style={{ marginBottom: 28, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555" }}><SearchIcon /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles, tags..." style={{
            width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10, padding: "12px 16px 12px 44px", color: "#ddd", fontSize: 14, outline: "none", boxSizing: "border-box",
          }}/>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            background: activeCategory === cat ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${activeCategory === cat ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: activeCategory === cat ? "#9d97ff" : "#888", borderRadius: 100, padding: "7px 18px",
            cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
          }}>{cat}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontSize: 16 }}>No articles match your search.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24, marginBottom: 64 }}>
          {filtered.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.05}>
              <PostCard post={post} onClick={onSelectPost} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal><Newsletter theme="dark" /></Reveal>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
      <SectionHeading eyebrow="PORTFOLIO" title="Featured Projects" sub="Production systems I've designed and built end-to-end" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {PROJECTS.map((proj, i) => (
          <Reveal key={proj.title} delay={i * 0.1}>
            <ProjectCard proj={proj} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ proj }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid ${hovered ? "rgba(62,207,207,0.3)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 16, padding: 28, transition: "all 0.25s", transform: hovered ? "translateY(-4px)" : "none",
      boxShadow: hovered ? "0 16px 40px rgba(62,207,207,0.1)" : "none", height: "100%", boxSizing: "border-box",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 18, fontWeight: 800, color: "#fff",
      }}>{proj.title.charAt(0)}</div>
      <h3 style={{ color: "#f0f0f8", fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>{proj.title}</h3>
      <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>{proj.desc}</p>
      <div style={{ color: "#3ECFCF", fontSize: 12, fontWeight: 600, marginBottom: 18 }}>★ {proj.highlight}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {proj.tags.map(t => (<span key={t} style={{ background: "rgba(108,99,255,0.1)", color: "#9d97ff", fontSize: 11, padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>{t}</span>))}
      </div>
    </div>
  );
}

function SkillsSection() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px" }}>
      <SectionHeading eyebrow="EXPERTISE" title="Technical Skills" sub="Tools and technologies I work with daily" />
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {SKILLS.map((skill, i) => (<Reveal key={skill.name} delay={i * 0.06}><SkillBar skill={skill} /></Reveal>))}
      </div>
    </div>
  );
}

function SkillBar({ skill }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#ddd", fontSize: 14, fontWeight: 600 }}>{skill.name}</span>
        <span style={{ color: "#6C63FF", fontSize: 13, fontWeight: 700 }}>{skill.level}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: visible ? `${skill.level}%` : "0%",
          background: "linear-gradient(90deg, #6C63FF, #3ECFCF)", borderRadius: 100,
          transition: "width 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}/>
      </div>
    </div>
  );
}

function TimelineSection() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px" }}>
      <SectionHeading eyebrow="JOURNEY" title="Experience & Education" />
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "linear-gradient(180deg, #6C63FF, rgba(108,99,255,0.1))" }}/>
        {TIMELINE.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.12}>
            <div style={{ position: "relative", paddingLeft: 36, marginBottom: 36 }}>
              <div style={{
                position: "absolute", left: 0, top: 4, width: 16, height: 16, borderRadius: "50%",
                background: "linear-gradient(135deg, #6C63FF, #3ECFCF)", boxShadow: "0 0 0 4px rgba(108,99,255,0.15)",
              }}/>
              <div style={{ color: "#6C63FF", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>{item.year}</div>
              <h3 style={{ color: "#f0f0f8", fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>{item.title}</h3>
              <div style={{ color: "#999", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{item.org}</div>
              <p style={{ color: "#777", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function GitHubStats({ theme }) {
  const t = THEMES[theme];
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
      <SectionHeading eyebrow="OPEN SOURCE" title="GitHub Activity" sub="Live stats pulled directly from my GitHub profile" theme={theme} />
      <Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <img
            src={`https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&theme=${theme === "dark" ? "dark" : "default"}&hide_border=true&bg_color=00000000`}
            alt="GitHub Stats"
            style={{ maxWidth: "100%", borderRadius: 12 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <img
            src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&theme=${theme === "dark" ? "dark" : "default"}&hide_border=true&bg_color=00000000`}
            alt="Top Languages"
            style={{ maxWidth: "100%", borderRadius: 12 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer" style={{
            color: "#6C63FF", textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>View full profile on GitHub →</a>
        </div>
      </Reveal>
    </div>
  );
}

function TestimonialsSection({ theme }) {
  const t = THEMES[theme];
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
      <SectionHeading eyebrow="FEEDBACK" title="What People Say" theme={theme} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {TESTIMONIALS.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.1}>
            <div style={{
              background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 28, height: "100%", boxSizing: "border-box",
            }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 16, color: "#FFB800" }}>
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>
              <p style={{ color: t.textMuted, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 22px", fontStyle: "italic" }}>"{item.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 14,
                }}>{item.initial}</div>
                <div>
                  <div style={{ color: t.text, fontWeight: 700, fontSize: 13.5 }}>{item.name}</div>
                  <div style={{ color: t.textDim, fontSize: 12 }}>{item.role}</div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function Newsletter({ theme }) {
  const t = THEMES[theme];
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Uses the same Formspree endpoint as the contact form to collect newsletter emails.
    if (!FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Newsletter signup", email }),
      }).catch(() => {});
    }
    setSubscribed(true);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(62,207,207,0.06))",
      border: "1px solid rgba(108,99,255,0.2)", borderRadius: 20,
      padding: "40px 32px", maxWidth: 640, margin: "0 auto 0", textAlign: "center",
    }}>
      <h3 style={{ color: t.text, fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Get notified about new articles</h3>
      <p style={{ color: t.textMuted, fontSize: 14, margin: "0 0 22px" }}>No spam, just backend engineering insights when I publish something new.</p>
      {subscribed ? (
        <p style={{ color: "#3ECFCF", fontWeight: 600, margin: 0 }}>✓ Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{
            flex: 1, minWidth: 200, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 10,
            padding: "12px 16px", color: t.text, fontSize: 14, outline: "none",
          }}/>
          <button type="submit" style={{
            background: "linear-gradient(135deg, #6C63FF, #3ECFCF)", border: "none", borderRadius: 10,
            padding: "12px 24px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>Subscribe</button>
        </form>
      )}
    </div>
  );
}

function GiscusComments({ theme }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    // ⚠️ EDIT THESE: Set up Giscus at https://giscus.app using your my-blog GitHub repo,
    // then paste the data-repo-id and data-category-id values it gives you below.
    script.setAttribute("data-repo", `${GITHUB_USERNAME}/my-blog`);
    script.setAttribute("data-repo-id", "R_kgDOTIa9Yg");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOTIa9Ys4DAM2R");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    script.crossOrigin = "anonymous";
    script.async = true;
    ref.current.appendChild(script);
  }, [theme]);
  return (
    <div style={{ maxWidth: 720, margin: "40px auto 0", padding: "0 24px" }}>
      <h3 style={{ color: THEMES[theme].text, fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Comments</h3>
      <div ref={ref} />
      <p style={{ color: THEMES[theme].textDim, fontSize: 12, marginTop: 8 }}>
        Comments power by Giscus — connect it at giscus.app to activate (see code comment).
      </p>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px" }}>
      <SectionHeading eyebrow="ABOUT ME" title="The Developer Behind the Code" />
      <Reveal>
        <div style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(62,207,207,0.05))",
          border: "1px solid rgba(108,99,255,0.2)", borderRadius: 20, padding: "44px 36px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 28, flexWrap: "wrap" }}>
            <img src="https://via.placeholder.com/200x200/14141f/6C63FF?text=PP" alt="Pradeep" style={{
              width: 72, height: 72, borderRadius: 16, objectFit: "cover", flexShrink: 0,
              border: "2px solid rgba(108,99,255,0.3)",
            }}/>
            <div>
              <h3 style={{ color: "#f0f0f8", fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Pradeep Prajapati</h3>
              <p style={{ color: "#6C63FF", fontWeight: 600, margin: 0, fontSize: 15 }}>Full-Stack Developer · Backend Specialist</p>
              <p style={{ color: "#555", fontSize: 13, margin: "4px 0 0" }}>Neemuch, Madhya Pradesh, India</p>
            </div>
          </div>
          <p style={{ color: "#888", lineHeight: 1.8, fontSize: 16, margin: 0 }}>
            Full Stack Developer with 2+ years of experience specializing in backend development. I've built high-volume SMS gateway platforms, microservices architectures, and CRM systems in production. I write about the real challenges of backend engineering — architecture decisions, performance tradeoffs, and practical patterns that work at scale.
          </p>
        </div>
      </Reveal>
      <TestimonialsSection theme="dark" />
      <GitHubStats theme="dark" />
    </div>
  );
}

const WhatsAppIcon = () => (

  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12.001 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.001L2 22l5.143-1.323A9.953 9.953 0 0 0 12.001 22C17.524 22 22 17.523 22 12S17.524 2 12.001 2zm0 18.07a8.04 8.04 0 0 1-4.103-1.122l-.294-.175-3.05.784.82-2.97-.192-.306A8.05 8.05 0 1 1 20.05 12.01 8.06 8.06 0 0 1 12 20.07z"/>
  </svg>
);

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", budget: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
      alert("Formspree isn't connected yet — see the comment at the top of ContactSection in the code.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus("sent");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const buildWhatsappUrl = () => {
    const text = `Hi Pradeep, I'm ${form.name || "[name]"}.\n\nEmail: ${form.email || "-"}\nPhone: ${form.phone || "-"}\nCompany: ${form.company || "-"}\nBudget: ${form.budget || "-"}\nSubject: ${form.subject || "-"}\n\nMessage: ${form.message || "-"}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleWhatsappClick = (e) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      alert("Please fill in at least your name and message first.");
      return;
    }
    // window.location.href works reliably on mobile browsers to hand off to the WhatsApp app,
    // unlike target="_blank" which mobile browsers / in-app browsers often block.
    window.location.href = buildWhatsappUrl();
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px 100px" }}>
      <SectionHeading eyebrow="GET IN TOUCH" title="Let's Work Together" sub="Have a project in mind or just want to say hi? Reach out." />

      <Reveal>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          <a href="mailto:pprajapati8965@gmail.com" style={pillStyle}><MailIcon /> pprajapati8965@gmail.com</a>
          <a href="tel:+919098925163" style={pillStyle}><PhoneIcon /> +91-909-892-5163</a>
          <a href="https://www.linkedin.com/in/pradeep-prajapati163/" target="_blank" rel="noreferrer" style={pillStyle}><LinkedinIcon /> LinkedIn</a>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        {status === "sent" ? (
          <div style={{ textAlign: "center", padding: "40px 24px", background: "rgba(62,207,207,0.06)", border: "1px solid rgba(62,207,207,0.25)", borderRadius: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <h3 style={{ color: "#f0f0f8", margin: "0 0 8px", fontSize: 18 }}>Message sent!</h3>
            <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Thanks for reaching out — I'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-grid">
              <input required value={form.name} onChange={update("name")} placeholder="Your name *" style={inputStyle}/>
              <input required type="email" value={form.email} onChange={update("email")} placeholder="Your email *" style={inputStyle}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-grid">
              <input type="tel" value={form.phone} onChange={update("phone")} placeholder="Phone number (optional)" style={inputStyle}/>
              <input value={form.company} onChange={update("company")} placeholder="Company / Organization (optional)" style={inputStyle}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-grid">
              <select value={form.budget} onChange={update("budget")} style={{ ...inputStyle, color: form.budget ? "#ddd" : "#666" }}>
                <option value="">Budget range (optional)</option>
                <option value="< $500">Under $500</option>
                <option value="$500 - $1500">$500 - $1500</option>
                <option value="$1500 - $5000">$1500 - $5000</option>
                <option value="$5000+">$5000+</option>
                <option value="Just exploring">Just exploring</option>
              </select>
              <input value={form.subject} onChange={update("subject")} placeholder="Subject (optional)" style={inputStyle}/>
            </div>
            <textarea required value={form.message} onChange={update("message")} placeholder="Your message *" rows={5} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}/>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="submit" disabled={status === "sending"} style={{
                flex: 1, minWidth: 180, background: "linear-gradient(135deg, #6C63FF, #3ECFCF)", border: "none", borderRadius: 10,
                padding: "14px 28px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                opacity: status === "sending" ? 0.7 : 1,
              }}>{status === "sending" ? "Sending..." : "Send via Email"}</button>

              <button type="button" onClick={handleWhatsappClick} style={{
                flex: 1, minWidth: 180, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#25D366", border: "none", borderRadius: 10, padding: "14px 28px",
                color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
              }}><WhatsAppIcon /> Send via WhatsApp</button>
            </div>

            {status === "error" && (
              <p style={{ color: "#ff8080", fontSize: 13, textAlign: "center", margin: 0 }}>
                Something went wrong sending the email. Please try WhatsApp instead, or email directly.
              </p>
            )}
          </form>
        )}
      </Reveal>

      <style>{`
        @media (max-width: 540px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const pillStyle = {
  display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 18px",
  color: "#ccc", textDecoration: "none", fontSize: 13.5, fontWeight: 500,
};

const inputStyle = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, padding: "13px 16px", color: "#ddd", fontSize: 14, outline: "none", boxSizing: "border-box",
};

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px", textAlign: "center", background: "rgba(0,0,0,0.3)" }}>
      <p style={{ color: "#444", fontSize: 13, margin: 0 }}>
        Built with React · Pradeep Prajapati · {" "}
        <a href="https://www.linkedin.com/in/pradeep-prajapati163/" target="_blank" rel="noreferrer" style={{ color: "#6C63FF", textDecoration: "none" }}>LinkedIn</a>
        {" · "}
        <a href="mailto:pprajapati8965@gmail.com" style={{ color: "#6C63FF", textDecoration: "none" }}>Email</a>
      </p>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
const PAGE_META = {
  home: { title: "Pradeep Prajapati — Full Stack Developer Blog", desc: "Backend engineering blog by Pradeep Prajapati. Node.js, Laravel, microservices, and real production lessons." },
  projects: { title: "Projects — Pradeep Prajapati", desc: "Featured backend projects: Bulk SMS platform, CRM system, and Telegram automation by Pradeep Prajapati." },
  skills: { title: "Skills — Pradeep Prajapati", desc: "Technical skills of Pradeep Prajapati: Node.js, Laravel, Redis, Docker, and more." },
  timeline: { title: "Experience — Pradeep Prajapati", desc: "Career timeline and education of Pradeep Prajapati, Full Stack Developer." },
  about: { title: "About — Pradeep Prajapati", desc: "Learn more about Pradeep Prajapati, a Full Stack Developer specializing in backend systems." },
  contact: { title: "Contact — Pradeep Prajapati", desc: "Get in touch with Pradeep Prajapati for backend development and freelance work." },
  post: { title: "Article — Pradeep Prajapati", desc: "Backend engineering article by Pradeep Prajapati." },
};

function useSEO(page, post) {
  useEffect(() => {
    const meta = page === "post" && post
      ? { title: `${post.title} — Pradeep Prajapati`, desc: post.excerpt }
      : PAGE_META[page] || PAGE_META.home;
    document.title = meta.title;
    const setTag = (name, content, isProperty) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, name); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    setTag("description", meta.desc);
    setTag("og:title", meta.title, true);
    setTag("og:description", meta.desc, true);
    setTag("og:type", "website", true);
    setTag("twitter:card", "summary", true);
    setTag("twitter:title", meta.title, true);
    setTag("twitter:description", meta.desc, true);
  }, [page, post]);
}

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedPost, setSelectedPost] = useState(null);
  const [theme, setTheme] = useTheme();
  const t = THEMES[theme];

  useSEO(page, selectedPost);

  const navigate = (p) => { setPage(p); setSelectedPost(null); window.scrollTo(0, 0); };
  const handleSelectPost = (post) => { setSelectedPost(post); setPage("post"); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: "background 0.3s ease" }}>
      <Navbar onNavigate={navigate} currentPage={page} theme={theme} setTheme={setTheme} />
      {page === "home" && <>
        <Hero onNavigate={navigate} />
        <BlogList onSelectPost={handleSelectPost} />
      </>}
      {page === "post" && selectedPost && <PostDetail post={selectedPost} onBack={() => navigate("home")} />}
      {page === "projects" && <ProjectsSection />}
      {page === "skills" && <SkillsSection />}
      {page === "timeline" && <TimelineSection />}
      {page === "about" && <AboutPage />}
      {page === "contact" && <ContactSection />}
      <Footer />
    </div>
  );
}
