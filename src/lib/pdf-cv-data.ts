import type { CvData, Education, Experience, Project, SkillGroup } from "@/lib/cv-types";

const skillGroups: SkillGroup[] = [
  {
    title: "Core Front-End",
    items: [
      "HTML5, CSS3, JavaScript (ES6+)",
      "React.js, Next.js (Server Actions, Route Handlers)",
      "Responsive & cross-browser development",
      "Tailwind CSS, Bootstrap, CSS Grid & Flexbox",
    ],
  },
  {
    title: "HTML Email Development",
    items: [
      "Table-based layouts for email campaigns",
      "Inline styles & email client limitations",
      "Outlook, Gmail, Apple Mail compatibility",
      "Cross-client rendering & testing",
    ],
  },
  {
    title: "Marketing Assets",
    items: [
      "HTML5 banners (static & interactive)",
      "Campaign landing pages",
      "Marketing websites & digital assets",
      "Pixel-perfect implementation from Figma",
    ],
  },
  {
    title: "Tools & Infrastructure",
    items: [
      "Git, GitHub, version control",
      "npm, Webpack, Gulp (build tools)",
      "Node.js, NestJS (basic-intermediate)",
      "Docker, AWS, Vercel, CI/CD pipelines",
    ],
  },
  {
    title: "Nice to Have",
    items: [
      "PHP / Laravel (basic level)",
      "SEO & web performance optimization",
      "Accessibility standards (WCAG)",
    ],
  },
];

const experience: Experience[] = [
  {
    role: "Freelance Back-End Developer",
    company: "Self-employed",
    location: "Remote",
    period: "03/2020 - Present",
    bullets: [
      "Built and maintained REST APIs and backend modules using Node.js and NestJS, following clean architecture and reusable patterns.",
      "Designed and integrated databases (PostgreSQL and MongoDB/NoSQL), including schemas, migrations and query optimization for reliability.",
      "Implemented authentication, validation and error handling for production-ready services, improving stability and maintainability.",
      "Deployed services with Docker on AWS (including Lambda/S3/SQS as needed) and automated CI/CD pipelines via GitHub Actions.",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "MIMS Tech, Corp",
    location: "Remote",
    period: "11/2025 - 01/2026",
    bullets: [
      "Delivered end-to-end features with React, Next.js and Tailwind CSS from Figma specs, focusing on accessibility and responsiveness.",
      "Built and integrated backend endpoints with Node.js/NestJS and PostgreSQL, connecting UI flows to robust APIs and business logic.",
      "Improved performance and reliability through code splitting, modularization, input validation and consistent error handling.",
      "Collaborated in code reviews, documentation and deployments using Docker and AWS, with CI/CD automation via GitHub Actions.",
    ],
  },
];

const projects: Project[] = [
  {
    name: "Solar Energy Company Website",
    context: "MIMS Tech",
    stack: ["Next.js", "NestJS", "Tailwind CSS", "Docker", "AWS"],
    description:
      "Corporate marketing platform with product catalog, online quote module and contact management. Pixel-perfect implementation from Figma. Deployed on AWS with Docker and CI/CD.",
  },
  {
    name: "Hotel Booking Platform",
    context: "",
    stack: ["React", "Zustand", "Tailwind CSS", "Vite"],
    description:
      "Responsive booking app with optimized user flow (30% reduction in booking time). Dynamic components, global state with Zustand and real-time notifications.",
  },
  {
    name: "Notarial Services Platform",
    context: "",
    stack: ["Next.js", "NestJS", "PostgreSQL", "AWS", "Docker"],
    description:
      "Full stack platform with appointment scheduling, accessible forms and REST API. Responsive, cross-browser layout from design specs.",
  },
  {
    name: "Repair Shop Management System",
    context: "",
    stack: ["Node.js", "TypeScript", "Zod", "PostgreSQL"],
    description:
      "Platform automating 80% of manual data entry. Input validation with Zod, JWT auth and structured PostgreSQL schema.",
  },
];

const education: Education[] = [
  {
    institution: "Academlo Bootcamp - Full Stack Web Development",
    details: "TypeScript, React, Node.js | 2021-2025 | Outstanding student",
  },
  {
    institution: "Codo a Codo / Talento Tech - Full Stack Web Dev",
    details: "JavaScript, Node.js | GPA 9/10",
  },
];

const pdfCvData: CvData = {
  fullName: "HENRY JUNIOR ALVAREZ BUSTAMANTE",
  title: "Front-End Developer | HTML5 | CSS3 | JavaScript | React | Next.js",
  email: "henry.alvarez.bustamante@gmail.com",
  phone: "+54 9 11 3765-6318",
  portfolioUrl: "https://henryjunior.dev",
  location: "Buenos Aires, Argentina",
  availability: "Available Remote",
  summary:
    "Front-End Developer with 3+ years of commercial experience building responsive, cross-browser interfaces and marketing-oriented digital assets. Solid expertise in HTML5, CSS3, JavaScript (ES6+) and React/Next.js, with hands-on experience developing HTML emails, HTML5 banners and campaign landing pages. Experienced implementing pixel-perfect designs from Figma and collaborating with international, English-speaking teams. Strong attention to detail, clean code practices and proactive communication.",
  skillGroups,
  experience,
  projects,
  education,
  languages: "Spanish - Native | English - B2 (Technical & conversational)",
  profileHighlights: [
    "Pixel-perfect attention to detail in every layout",
    "Proactive communication with international teams",
    "Honest, experience-backed skill set",
    "Self-driven learner, fast adapter to new tools",
  ],
  closingStatement:
    "Front-End Developer with a strong foundation in HTML emails, banners and marketing-oriented development. Ready to join Viseven Group and contribute to impactful digital transformation projects across the Pharma and Life Sciences industry.",
};

export async function getPdfCvData(): Promise<CvData> {
  return pdfCvData;
}
