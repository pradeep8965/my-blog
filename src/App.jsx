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

// ─── Icons ───────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const MenuIcon = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open ? <path d="M18 6 6 18M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
  </svg>
);

// ─── Components ──────────────────────────────────────────────────────────────
function Navbar({ onNavigate, currentPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,10,18,0.92)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <button onClick={() => onNavigate("home")} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#fff", fontSize: 16,
          }}>P</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, fontFamily: "'Segoe UI', sans-serif" }}>
            Pradeep<span style={{ color: "#6C63FF" }}>.</span>dev
          </span>
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {["home", "about"].map(p => (
            <button key={p} onClick={() => { onNavigate(p); setMenuOpen(false); }} style={{
              background: currentPage === p ? "rgba(108,99,255,0.15)" : "none",
              border: "none", cursor: "pointer", color: currentPage === p ? "#6C63FF" : "#aaa",
              fontWeight: 500, fontSize: 14, padding: "6px 16px", borderRadius: 6,
              textTransform: "capitalize", transition: "all 0.2s",
            }}>{p}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero({ onNavigate }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #0a0a12 0%, #0f0f1f 60%, #0a0a12 100%)",
      padding: "90px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "20%", left: "10%", width: 300, height: 300,
        background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)",
      }}/>
      <div style={{
        position: "absolute", top: "10%", right: "8%", width: 200, height: 200,
        background: "radial-gradient(circle, rgba(62,207,207,0.1) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(30px)",
      }}/>
      <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
        <div style={{
          display: "inline-block", background: "rgba(108,99,255,0.12)",
          border: "1px solid rgba(108,99,255,0.3)", borderRadius: 100,
          padding: "6px 18px", marginBottom: 28,
          color: "#9d97ff", fontSize: 13, fontWeight: 600, letterSpacing: 1,
        }}>BACKEND ENGINEERING BLOG</div>
        <h1 style={{
          color: "#fff", fontSize: "clamp(32px, 6vw, 58px)",
          fontWeight: 800, lineHeight: 1.15, margin: "0 0 20px",
          fontFamily: "'Segoe UI', sans-serif",
        }}>
          Deep dives into<br/>
          <span style={{ background: "linear-gradient(90deg, #6C63FF, #3ECFCF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            scalable systems
          </span>
        </h1>
        <p style={{ color: "#888", fontSize: 17, lineHeight: 1.7, margin: "0 0 36px" }}>
          Real-world backend engineering from a developer who's built SMS gateways, microservices, and CRM systems in production. Node.js · Laravel · Redis · Docker.
        </p>
        <button onClick={() => document.getElementById("posts-section").scrollIntoView({ behavior: "smooth" })} style={{
          background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
          border: "none", borderRadius: 10, padding: "14px 32px",
          color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          Read Articles <ArrowIcon />
        </button>
      </div>
    </div>
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
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 12px 40px rgba(108,99,255,0.1)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{
          background: "rgba(108,99,255,0.15)", color: "#9d97ff",
          fontSize: 12, fontWeight: 600, padding: "4px 12px",
          borderRadius: 100, letterSpacing: 0.5,
        }}>{post.category}</span>
        <span style={{ color: "#555", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <ClockIcon /> {post.readTime}
        </span>
      </div>
      <h2 style={{
        color: "#f0f0f8", fontSize: 19, fontWeight: 700, lineHeight: 1.4,
        margin: "0 0 12px", fontFamily: "'Segoe UI', sans-serif",
      }}>{post.title}</h2>
      <p style={{ color: "#777", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>{post.excerpt}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {post.tags.slice(0, 2).map(t => (
            <span key={t} style={{
              background: "rgba(62,207,207,0.08)", color: "#3ECFCF",
              fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 600,
            }}>{t}</span>
          ))}
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
        display: "flex", alignItems: "center", gap: 8, marginBottom: 36,
        fontSize: 13, fontWeight: 500,
      }}><BackIcon /> Back to Blog</button>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{
          background: "rgba(108,99,255,0.15)", color: "#9d97ff",
          fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 100,
        }}>{post.category}</span>
        <span style={{ color: "#555", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
          <ClockIcon /> {post.readTime}
        </span>
        <span style={{ color: "#555", fontSize: 13 }}>{post.date}</span>
      </div>

      <h1 style={{
        color: "#f0f0f8", fontSize: "clamp(24px, 4vw, 38px)",
        fontWeight: 800, lineHeight: 1.3, margin: "0 0 24px",
        fontFamily: "'Segoe UI', sans-serif",
      }}>{post.title}</h1>

      <p style={{
        color: "#9d97ff", fontSize: 17, lineHeight: 1.7,
        margin: "0 0 36px", fontStyle: "italic",
        borderLeft: "3px solid #6C63FF", paddingLeft: 20,
      }}>{post.excerpt}</p>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "32px 0", margin: "0 0 32px",
      }}>
        {post.content.split("\n\n").map((para, i) => {
          if (para.startsWith("**") && para.endsWith("**")) {
            return <h3 key={i} style={{ color: "#f0f0f8", fontSize: 18, fontWeight: 700, margin: "28px 0 12px" }}>{para.replace(/\*\*/g, "")}</h3>;
          }
          const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c0bcff">$1</strong>');
          return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ color: "#999", fontSize: 16, lineHeight: 1.85, margin: "0 0 18px" }} />;
        })}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {post.tags.map(t => (
          <span key={t} style={{
            background: "rgba(62,207,207,0.08)", color: "#3ECFCF",
            fontSize: 12, padding: "5px 14px", borderRadius: 8, fontWeight: 600,
            border: "1px solid rgba(62,207,207,0.2)",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(62,207,207,0.05))",
        border: "1px solid rgba(108,99,255,0.2)",
        borderRadius: 20, padding: "48px 40px", marginBottom: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>P</div>
          <div>
            <h1 style={{ color: "#f0f0f8", fontSize: 28, fontWeight: 800, margin: "0 0 6px" }}>Pradeep Prajapati</h1>
            <p style={{ color: "#6C63FF", fontWeight: 600, margin: 0, fontSize: 15 }}>Full-Stack Developer · Backend Specialist</p>
            <p style={{ color: "#555", fontSize: 13, margin: "4px 0 0" }}>Neemuch, Madhya Pradesh, India</p>
          </div>
        </div>
        <p style={{ color: "#888", lineHeight: 1.8, fontSize: 16, margin: 0 }}>
          Full Stack Developer with 2+ years of experience specializing in backend development. I've built high-volume SMS gateway platforms, microservices architectures, and CRM systems in production. I write about the real challenges of backend engineering — architecture decisions, performance tradeoffs, and practical patterns that work at scale.
        </p>
      </div>

      {[
        { label: "Languages & Frameworks", items: ["Node.js", "Moleculer.js", "React.js", "PHP (Laravel)", "HTML / CSS / Bootstrap"] },
        { label: "Backend & Architecture", items: ["Microservices", "REST API Development", "System Design", "SMPP Protocol", "API Integration"] },
        { label: "Databases & Tools", items: ["MySQL", "Redis", "Docker", "Kannel", "Prisma ORM", "Git"] },
      ].map(section => (
        <div key={section.label} style={{ marginBottom: 32 }}>
          <h3 style={{ color: "#9d97ff", fontSize: 13, fontWeight: 600, letterSpacing: 1, margin: "0 0 14px", textTransform: "uppercase" }}>{section.label}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {section.items.map(item => (
              <span key={item} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#ccc", padding: "7px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
              }}>{item}</span>
            ))}
          </div>
        </div>
      ))}

      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "24px 28px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
      }}>
        <span style={{ color: "#888", fontSize: 14, flex: 1 }}>Want to work together or have a question?</span>
        <a href="mailto:pprajapati8965@gmail.com" style={{
          background: "linear-gradient(135deg, #6C63FF, #3ECFCF)",
          color: "#fff", textDecoration: "none", borderRadius: 8,
          padding: "10px 22px", fontWeight: 700, fontSize: 14,
        }}>Get in Touch</a>
      </div>
    </div>
  );
}

function BlogList({ onSelectPost }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = POSTS.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }} id="posts-section">
      {/* Search */}
      <div style={{ marginBottom: 32, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555" }}><SearchIcon /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles, tags..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
              padding: "12px 16px 12px 44px", color: "#ddd", fontSize: 14,
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            background: activeCategory === cat ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${activeCategory === cat ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: activeCategory === cat ? "#9d97ff" : "#888",
            borderRadius: 100, padding: "7px 18px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, transition: "all 0.2s",
          }}>{cat}</button>
        ))}
      </div>

      {/* Post Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontSize: 16 }}>
          No articles match your search.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {filtered.map(post => <PostCard key={post.id} post={post} onClick={onSelectPost} />)}
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "32px 24px", textAlign: "center",
      background: "rgba(0,0,0,0.3)",
    }}>
      <p style={{ color: "#444", fontSize: 13, margin: 0 }}>
        Built with React · Pradeep Prajapati · {" "}
        <a href="https://www.linkedin.com/in/pradeep-prajapati163/" target="_blank" rel="noreferrer"
          style={{ color: "#6C63FF", textDecoration: "none" }}>LinkedIn</a>
        {" · "}
        <a href="mailto:pprajapati8965@gmail.com"
          style={{ color: "#6C63FF", textDecoration: "none" }}>Email</a>
      </p>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedPost, setSelectedPost] = useState(null);

  const navigate = (p) => { setPage(p); setSelectedPost(null); window.scrollTo(0, 0); };

  const handleSelectPost = (post) => { setSelectedPost(post); setPage("post"); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar onNavigate={navigate} currentPage={page} />
      {page === "home" && <>
        <Hero />
        <BlogList onSelectPost={handleSelectPost} />
      </>}
      {page === "post" && selectedPost && <PostDetail post={selectedPost} onBack={() => navigate("home")} />}
      {page === "about" && <AboutPage />}
      <Footer />
    </div>
  );
}
