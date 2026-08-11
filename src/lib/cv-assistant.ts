import type { CvData, Education, Experience, Project, SkillGroup } from "@/lib/cv-types";

type ParsedSections = Partial<Record<"summary" | "skills" | "experience" | "projects" | "education" | "languages" | "profile", string[]>>;

type TechEntry = {
  canonical: string;
  aliases: string[];
  categories: Array<"frontend" | "backend" | "shared">;
};

type JobFocus = "frontend" | "backend" | "fullstack" | "generic";
export type JobFocusPreset = "frontend" | "backend" | "fullstack";

const DEFAULT_BACKEND_STACK = ["Node.js", "NestJS", "SQL", "PostgreSQL", "AWS"] as const;
const DEFAULT_FRONTEND_STACK = ["TypeScript", "React", "Next.js", "Tailwind CSS"] as const;
const DEFAULT_FULLSTACK_STACK = ["TypeScript", "Next.js", "NestJS", "SQL", "PostgreSQL", "AWS"] as const;

const DEFAULT_BACKEND_RELEVANT_TECHS = [
  "TypeScript",
  "Docker",
  "MongoDB",
  "NoSQL",
  ...DEFAULT_BACKEND_STACK,
] as const;

const DEFAULT_FRONTEND_RELEVANT_TECHS = [
  "JavaScript",
  "Zustand",
  "React Query",
  "Figma",
  ...DEFAULT_FRONTEND_STACK,
] as const;

const TECH_CATALOG: TechEntry[] = [
  { canonical: "React", aliases: ["react", "react.js", "reactjs", "hooks", "context api"], categories: ["frontend"] },
  {
    canonical: "Next.js",
    aliases: ["next", "nextjs", "next.js", "ssr", "ssg", "app router", "server actions"],
    categories: ["frontend", "shared"],
  },
  { canonical: "MeteorJS", aliases: ["meteor", "meteorjs", "meteor.js"], categories: ["backend"] },
  { canonical: "NestJS", aliases: ["nestjs", "nest", "nest.js"], categories: ["backend"] },
  { canonical: "TypeScript", aliases: ["typescript", "ts"], categories: ["shared"] },
  { canonical: "JavaScript", aliases: ["javascript", "js", "es6", "ecmascript"], categories: ["shared"] },
  { canonical: "HTML5", aliases: ["html", "html5", "semantic html"], categories: ["frontend"] },
  { canonical: "CSS3", aliases: ["css", "css3", "flexbox", "grid", "animations"], categories: ["frontend"] },
  {
    canonical: "Tailwind CSS",
    aliases: ["tailwind", "tailwindcss", "tailwind css"],
    categories: ["frontend"],
  },
  { canonical: "Node.js", aliases: ["node", "nodejs", "node.js", "express", "fastify"], categories: ["backend"] },
  { canonical: "MongoDB", aliases: ["mongo", "mongodb", "mongoose"], categories: ["backend"] },
  { canonical: "NoSQL", aliases: ["nosql", "redis", "dynamodb", "cassandra"], categories: ["backend"] },
  { canonical: "SQL", aliases: ["sql", "mysql", "mariadb", "oracle", "sqlite"], categories: ["backend", "shared"] },
  { canonical: "PostgreSQL", aliases: ["postgres", "postgresql", "pg"], categories: ["backend"] },
  { canonical: "Docker", aliases: ["docker", "containers", "kubernetes", "k8s"], categories: ["backend", "shared"] },
  { canonical: "AWS", aliases: ["aws", "amazon web services", "cloud"], categories: ["backend", "shared"] },
  { canonical: "AWS Lambda", aliases: ["lambda", "serverless"], categories: ["backend"] },
  { canonical: "S3", aliases: ["s3", "storage"], categories: ["backend"] },
  { canonical: "SQS", aliases: ["sqs", "queues", "messaging"], categories: ["backend"] },
  { canonical: "EKS", aliases: ["eks", "orchestration"], categories: ["backend"] },
  { canonical: "Azure", aliases: ["azure", "microsoft cloud"], categories: ["backend", "shared"] },
  { canonical: "Google Cloud", aliases: ["gcp", "google cloud platform"], categories: ["backend", "shared"] },
  { canonical: "Vercel", aliases: ["vercel"], categories: ["frontend", "shared"] },
  { canonical: "Git", aliases: ["git", "github", "gitlab", "bitbucket"], categories: ["shared"] },
  { canonical: "REST API", aliases: ["rest", "api", "json api"], categories: ["backend"] },
  { canonical: "GraphQL", aliases: ["graphql", "apollo", "relay"], categories: ["backend", "shared"] },
  {
    canonical: "Responsive Design",
    aliases: ["responsive", "mobile first"],
    categories: ["frontend"],
  },
  { canonical: "Figma", aliases: ["figma", "adobe xd", "sketch"], categories: ["frontend"] },
  { canonical: "Redux", aliases: ["redux", "redux toolkit", "rtk", "flux"], categories: ["frontend"] },
  { canonical: "Zustand", aliases: ["zustand"], categories: ["frontend"] },
  { canonical: "Recoil", aliases: ["recoil"], categories: ["frontend"] },
  { canonical: "MobX", aliases: ["mobx"], categories: ["frontend"] },
  { canonical: "React Query", aliases: ["react query", "tanstack query"], categories: ["frontend", "shared"] },
  { canonical: "SWR", aliases: ["swr"], categories: ["frontend", "shared"] },
  { canonical: "Axios", aliases: ["axios"], categories: ["shared"] },
  { canonical: "Vite", aliases: ["vite", "webpack", "babel", "rollup", "esbuild", "parcel", "turbopack"], categories: ["frontend", "shared"] },
  { canonical: "Jest", aliases: ["jest", "vitest", "testing library", "enzyme"], categories: ["shared"] },
  { canonical: "Playwright", aliases: ["playwright", "cypress", "puppeteer", "selenium"], categories: ["shared"] },
  { canonical: "Storybook", aliases: ["storybook"], categories: ["frontend"] },
  { canonical: "CI/CD", aliases: ["ci/cd", "github actions", "jenkins", "circleci", "travis", "bitbucket pipelines", "gitlab ci"], categories: ["backend", "shared"] },
  { canonical: "Terraform", aliases: ["terraform", "iac", "infrastructure as code"], categories: ["backend"] },
  { canonical: "CloudFormation", aliases: ["cloudformation"], categories: ["backend"] },
  { canonical: "Kubernetes", aliases: ["kubernetes", "k8s", "helm"], categories: ["backend", "shared"] },
  { canonical: "Java", aliases: ["java", "spring", "spring boot", "hibernate", "maven", "gradle"], categories: ["backend"] },
  { canonical: "Kotlin", aliases: ["kotlin", "android"], categories: ["backend", "shared"] },
  { canonical: "Python", aliases: ["python", "django", "flask", "fastapi", "pandas", "numpy", "pytorch", "tensorflow"], categories: ["backend"] },
  { canonical: "Go", aliases: ["go", "golang", "gin", "echo"], categories: ["backend"] },
  { canonical: "Rust", aliases: ["rust", "actix", "rocket", "cargo"], categories: ["backend", "shared"] },
  { canonical: "C#", aliases: ["c#", ".net", "dotnet", "asp.net", "entity framework"], categories: ["backend"] },
  { canonical: "Ruby", aliases: ["ruby", "rails", "ruby on rails"], categories: ["backend"] },
  { canonical: "PHP", aliases: ["php", "laravel", "symfony", "wordpress", "drupal"], categories: ["backend"] },
  { canonical: "Microservices", aliases: ["microservices", "soa", "event-driven", "grpc", "rabbitmq", "kafka"], categories: ["backend"] },
  { canonical: "GraphQL", aliases: ["graphql", "apollo", "relay", "hasura"], categories: ["backend", "shared"] },
  { canonical: "WebSockets", aliases: ["websockets", "socket.io"], categories: ["backend", "shared"] },
  { canonical: "OAuth2", aliases: ["oauth", "oauth2", "jwt", "auth0", "firebase auth", "okta"], categories: ["backend", "shared"] },
  { canonical: "Unit Testing", aliases: ["unit testing", "tdd", "bdd"], categories: ["shared"] },
  { canonical: "Agile", aliases: ["agile", "scrum", "kanban", "jira", "trello", "confluence"], categories: ["shared"] },
  { canonical: "OpenAPI", aliases: ["openapi", "swagger"], categories: ["backend", "shared"] },
  { canonical: "Elasticsearch", aliases: ["elasticsearch", "elk", "kibana", "logstash"], categories: ["backend"] },
  { canonical: "Firebase", aliases: ["firebase", "firestore"], categories: ["backend", "shared"] },
  { canonical: "Supabase", aliases: ["supabase"], categories: ["backend", "shared"] },
  { canonical: "Material UI", aliases: ["mui", "material ui"], categories: ["frontend"] },
  { canonical: "Chakra UI", aliases: ["chakra", "chakra ui"], categories: ["frontend"] },
  { canonical: "Ant Design", aliases: ["antd", "ant design"], categories: ["frontend"] },
  { canonical: "Angular", aliases: ["angular"], categories: ["frontend"] },
  { canonical: "Vue.js", aliases: ["vue", "vuejs", "vue.js", "nuxt"], categories: ["frontend"] },
  { canonical: "Svelte", aliases: ["svelte", "sveltekit"], categories: ["frontend"] },
];

const SECTION_ALIASES = {
  summary: ["professional summary", "summary", "profile", "perfil", "resumen", "about me"],
  skills: ["technical skills", "skills", "habilidades", "stack", "tech stack", "competencias"],
  experience: ["professional experience", "experience", "experiencia", "work experience", "employment"],
  projects: ["projects", "key projects", "proyectos", "project experience"],
  education: ["education", "educacion", "formacion", "academic background"],
  languages: ["languages", "idiomas", "language"],
  profile: ["strengths", "highlights", "fortalezas", "soft skills", "profile highlights"],
} as const;

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueItems(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function mergeUnique(items: string[], extra: readonly string[]) {
  return uniqueItems([...items, ...extra]);
}

function getTechEntry(technology: string) {
  return TECH_CATALOG.find((entry) => entry.canonical === technology);
}

function findTechnologies(text: string) {
  const normalized = normalizeText(text);

  return TECH_CATALOG.filter((entry) =>
    entry.aliases.some((alias) => normalized.includes(normalizeText(alias))),
  ).map((entry) => entry.canonical);
}

function collectKnownTechnologies(cvData: CvData) {
  const rawTexts = [
    cvData.title,
    cvData.summary,
    cvData.languages,
    cvData.closingStatement,
    ...cvData.skillGroups.flatMap((group) => [group.title, ...group.items]),
    ...cvData.experience.flatMap((item) => [
      item.role,
      item.company,
      item.location,
      item.period,
      ...item.bullets,
    ]),
    ...cvData.projects.flatMap((item) => [item.name, item.context, item.description, ...item.stack]),
    ...cvData.education.flatMap((item) => [item.institution, item.details]),
    ...cvData.profileHighlights,
  ];

  return uniqueItems(rawTexts.flatMap((text) => findTechnologies(text)));
}

function scoreTextAgainstTechnologies(text: string, technologies: string[]) {
  const normalized = normalizeText(text);

  return technologies.reduce((score, technology) => {
    const entry = TECH_CATALOG.find((item) => item.canonical === technology);
    if (!entry) {
      return score;
    }

    const matches = entry.aliases.some((alias) => normalized.includes(normalizeText(alias)));
    return matches ? score + 1 : score;
  }, 0);
}

function getJobFocus(jobText: string): JobFocus {
  const normalized = normalizeText(jobText);
  const explicitFrontendTerms = [
    "frontend",
    "front-end",
    "front end",
    "front end developer",
    "front-end developer",
    "front-end engineer",
    "ui",
    "ux",
    "html",
    "css",
    "tailwind",
    "figma",
    "maquetacion",
    "interfaces",
    "diseno responsive",
  ];
  const explicitBackendTerms = [
    "backend",
    "back-end",
    "back end",
    "backend developer",
    "back-end developer",
    "back-end engineer",
    "api",
    "server",
    "node",
    "nest",
    "database",
    "postgres",
    "sql",
    "mongodb",
    "mongo",
    "nosql",
    "microservices",
    "lambdas",
    "sqs",
    "s3",
    "eks",
    "erp",
    "legacy code",
    "conciliacion bancaria",
    "medios de pago",
  ];

  const frontendSignalCount = explicitFrontendTerms.filter((term) =>
    normalized.includes(normalizeText(term)),
  ).length;
  const backendSignalCount = explicitBackendTerms.filter((term) =>
    normalized.includes(normalizeText(term)),
  ).length;
  const mentionsFullStack =
    normalized.includes("full stack") || normalized.includes("fullstack");
  const detectedTechs = findTechnologies(jobText);
  const frontendTechCount = detectedTechs.filter((tech) => {
    const entry = getTechEntry(tech);
    return entry?.categories.includes("frontend");
  }).length;
  const backendTechCount = detectedTechs.filter((tech) => {
    const entry = getTechEntry(tech);
    return entry?.categories.includes("backend");
  }).length;

  if (mentionsFullStack) {
    return "fullstack";
  }

  if (
    backendSignalCount >= 2 &&
    backendSignalCount >= frontendSignalCount + 1 &&
    backendTechCount >= frontendTechCount
  ) {
    return "backend";
  }

  if (
    frontendSignalCount >= 2 &&
    frontendSignalCount >= backendSignalCount + 1 &&
    frontendTechCount >= backendTechCount
  ) {
    return "frontend";
  }

  if (backendTechCount >= frontendTechCount + 2) {
    return "backend";
  }

  if (frontendTechCount >= backendTechCount + 2) {
    return "frontend";
  }

  if (
    backendSignalCount > 0 &&
    frontendSignalCount > 0 &&
    backendTechCount > 0 &&
    frontendTechCount > 0
  ) {
    return "fullstack";
  }

  if (backendSignalCount > frontendSignalCount && backendTechCount >= frontendTechCount) {
    return "backend";
  }

  if (frontendSignalCount > backendSignalCount && frontendTechCount >= backendTechCount) {
    return "frontend";
  }

  return "generic";
}

function isTechAllowedForFocus(technology: string, focus: JobFocus) {
  if (focus === "fullstack" || focus === "generic") {
    return true;
  }

  const entry = getTechEntry(technology);
  if (!entry) {
    return true;
  }

  return entry.categories.includes("shared") || entry.categories.includes(focus);
}

function getTextFocusScore(text: string, focus: JobFocus) {
  if (focus === "fullstack" || focus === "generic") {
    return 1;
  }

  const technologies = findTechnologies(text);
  if (technologies.length === 0) {
    const normalized = normalizeText(text);
    if (focus === "backend") {
      if (normalized.includes("frontend") || normalized.includes("front-end")) {
        return -2;
      }
      if (normalized.includes("backend") || normalized.includes("back-end")) {
        return 2;
      }
    }

    if (focus === "frontend") {
      if (normalized.includes("backend") || normalized.includes("back-end")) {
        return -2;
      }
      if (normalized.includes("frontend") || normalized.includes("front-end")) {
        return 2;
      }
    }

    return 0;
  }

  return technologies.reduce((score, technology) => {
    const entry = getTechEntry(technology);
    if (!entry) {
      return score;
    }

    if (entry.categories.includes(focus) || entry.categories.includes("shared")) {
      return score + 1;
    }

    return score - 2;
  }, 0);
}

function filterTechnologiesByFocus(technologies: string[], focus: JobFocus) {
  return technologies.filter((technology) => isTechAllowedForFocus(technology, focus));
}

function buildRoleFromJobText(
  currentTitle: string,
  jobText: string,
  matchedTechs: string[],
  focusOverride?: JobFocus,
) {
  const focus = focusOverride || getJobFocus(jobText);
  const roleBase =
    focus === "fullstack"
      ? "Desarrollador Full Stack"
      : focus === "backend"
        ? "Desarrollador Back-End"
        : focus === "frontend"
          ? "Desarrollador Front-End"
          : currentTitle;

  let titleTechs: string[] = [];
  if (focus === "frontend") {
    titleTechs = [...DEFAULT_FRONTEND_STACK];
  } else if (focus === "backend") {
    titleTechs = [...DEFAULT_BACKEND_STACK];
  } else if (focus === "fullstack") {
    titleTechs = [...DEFAULT_FULLSTACK_STACK];
  } else {
    titleTechs = matchedTechs.slice(0, 4);
  }

  return [roleBase, ...titleTechs].join(" | ");
}

function ensureRelevantSkillGroup(
  skillGroups: SkillGroup[],
  matchedTechs: string[],
  focus: JobFocus,
) {
  let focusTechs = matchedTechs;
  if (focus === "backend") {
    focusTechs = mergeUnique(matchedTechs, DEFAULT_BACKEND_RELEVANT_TECHS);
  } else if (focus === "frontend") {
    focusTechs = mergeUnique(matchedTechs, DEFAULT_FRONTEND_RELEVANT_TECHS);
  } else if (focus === "fullstack") {
    focusTechs = mergeUnique(matchedTechs, [
      ...DEFAULT_BACKEND_RELEVANT_TECHS,
      ...DEFAULT_FRONTEND_RELEVANT_TECHS,
    ]);
  }

  if (matchedTechs.length === 0) {
    return skillGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => getTextFocusScore(item, focus) >= 0 || isTechAllowedForFocus(item, focus),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }

  const existingGroups = skillGroups.filter(
    (group) => normalizeText(group.title) !== normalizeText("Tecnologias relevantes para la vacante"),
  );

  return [
    {
      title: "Tecnologias relevantes para la vacante",
      items: focusTechs,
    },
    ...existingGroups.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !focusTechs.includes(item) &&
          (getTextFocusScore(item, focus) >= 0 || isTechAllowedForFocus(item, focus)),
      ),
    })),
  ].filter((group) => group.items.length > 0);
}

function buildSummaryForFocus(
  currentSummary: string,
  focus: JobFocus,
  matchedTechs: string[],
) {
  if (focus === "generic") {
    return matchedTechs.length > 0
      ? `${currentSummary.trim()} Tecnologías alineadas con la vacante: ${matchedTechs
          .slice(0, 6)
          .join(", ")}.`
      : currentSummary;
  }

  let focusTechs = matchedTechs;
  if (focus === "backend") {
    focusTechs = mergeUnique(matchedTechs, DEFAULT_BACKEND_RELEVANT_TECHS);
  } else if (focus === "frontend") {
    focusTechs = mergeUnique(matchedTechs, DEFAULT_FRONTEND_RELEVANT_TECHS);
  } else if (focus === "fullstack") {
    focusTechs = mergeUnique(matchedTechs, [
      ...DEFAULT_BACKEND_RELEVANT_TECHS,
      ...DEFAULT_FRONTEND_RELEVANT_TECHS,
    ]);
  }

  const intro =
    focus === "backend"
      ? `Perfil orientado a Back-End con experiencia en APIs, integraciones, lógica de negocio y servicios. Stack: ${DEFAULT_BACKEND_STACK.join(
          ", ",
        )}.`
      : focus === "frontend"
        ? `Perfil orientado a Front-End con experiencia en interfaces modernas, componentes reutilizables y maquetación responsiva. Stack: ${DEFAULT_FRONTEND_STACK.join(
            ", ",
          )}.`
        : `Perfil Full Stack con experiencia integrando frontend y backend en productos reales. Stack: ${DEFAULT_FULLSTACK_STACK.join(
            ", ",
          )}.`;

  if (focusTechs.length === 0) {
    return intro;
  }

  return `${intro} Tecnologías relevantes: ${focusTechs.slice(0, 8).join(", ")}.`;
}

function buildClosingForFocus(focus: JobFocus, matchedTechs: string[], fallback: string) {
  if (focus === "generic") {
    return matchedTechs.length > 0
      ? `Perfil orientado a la vacante con experiencia comprobable en ${matchedTechs
          .slice(0, 5)
          .join(", ")}.`
      : fallback;
  }

  const focusLabel =
    focus === "backend" ? "Back-End" : focus === "frontend" ? "Front-End" : "Full Stack";

  let focusTechs = matchedTechs;
  if (focus === "backend") {
    focusTechs = mergeUnique(matchedTechs, DEFAULT_BACKEND_RELEVANT_TECHS);
  } else if (focus === "frontend") {
    focusTechs = mergeUnique(matchedTechs, DEFAULT_FRONTEND_RELEVANT_TECHS);
  } else if (focus === "fullstack") {
    focusTechs = mergeUnique(matchedTechs, [
      ...DEFAULT_BACKEND_RELEVANT_TECHS,
      ...DEFAULT_FRONTEND_RELEVANT_TECHS,
    ]);
  }

  return `Perfil ${focusLabel} orientado a la vacante con experiencia comprobable en ${focusTechs
    .slice(0, 6)
    .join(", ")}.`;
}

function filterExperienceByFocus(
  experience: Experience[],
  focus: JobFocus,
  matchedTechs: string[],
) {
  const ranked = experience
    .map((item) => {
      const fullText = [item.role, item.company, item.location, item.period, ...item.bullets].join(" ");
      const focusScore = getTextFocusScore(fullText, focus);
      const techScore = scoreTextAgainstTechnologies(fullText, matchedTechs);
      const filteredBullets = item.bullets.filter((bullet) => {
        const bulletScore = getTextFocusScore(bullet, focus);
        const relevantByTech = scoreTextAgainstTechnologies(bullet, matchedTechs) > 0;
        return bulletScore >= 0 || relevantByTech;
      });

      return {
        ...item,
        bullets: filteredBullets.length > 0 ? filteredBullets : item.bullets.slice(0, 3),
        _score: focusScore * 4 + techScore,
      };
    })
    .filter((item) => item._score >= 0 || focus === "fullstack" || focus === "generic")
    .sort((left, right) => right._score - left._score);

  return ranked.length > 0
    ? ranked.map((item) => {
        const nextItem = { ...item };
        return Object.fromEntries(
          Object.entries(nextItem).filter(([key]) => key !== "_score"),
        ) as Experience;
      })
    : experience;
}

function filterProjectsByFocus(projects: Project[], focus: JobFocus, matchedTechs: string[]) {
  const ranked = projects
    .map((item) => {
      const fullText = [item.name, item.context, item.description, ...item.stack].join(" ");
      const focusScore = getTextFocusScore(fullText, focus);
      const techScore = scoreTextAgainstTechnologies(fullText, matchedTechs);
      const filteredStack = filterTechnologiesByFocus(item.stack, focus);

      return {
        ...item,
        stack: filteredStack.length > 0 ? filteredStack : item.stack,
        _score: focusScore * 4 + techScore,
      };
    })
    .filter((item) => item._score >= 0 || focus === "fullstack" || focus === "generic")
    .sort((left, right) => right._score - left._score);

  return ranked.length > 0
    ? ranked.map((item) => {
        const nextItem = { ...item };
        return Object.fromEntries(
          Object.entries(nextItem).filter(([key]) => key !== "_score"),
        ) as Project;
      })
    : projects;
}

function filterHighlightsByFocus(highlights: string[], focus: JobFocus) {
  const filtered = highlights.filter((item) => getTextFocusScore(item, focus) >= 0);
  if (filtered.length > 0) {
    return filtered;
  }

  if (focus === "backend") {
    return [
      "Diseno y mantenimiento de APIs y servicios",
      "Integracion de bases de datos e infraestructura",
      "Enfoque en estabilidad, rendimiento y escalabilidad",
    ];
  }

  if (focus === "frontend") {
    return [
      "Interfaces limpias, responsivas y reutilizables",
      "Implementacion cuidada desde diseno hasta produccion",
      "Enfoque en usabilidad, accesibilidad y consistencia visual",
    ];
  }

  return highlights;
}


export function applyJobDescriptionToCv(cvData: CvData, jobText: string) {
  const focus = getJobFocus(jobText);
  const requestedTechs = uniqueItems(findTechnologies(jobText));
  const knownTechs = collectKnownTechnologies(cvData);
  const matchedTechs = filterTechnologiesByFocus(
    requestedTechs.filter((tech) => knownTechs.includes(tech)),
    focus,
  );
  
  const filteredExperience = filterExperienceByFocus(cvData.experience, focus, matchedTechs);
  const filteredProjects = filterProjectsByFocus(cvData.projects, focus, matchedTechs);

  return {
    ...cvData,
    title: buildRoleFromJobText(cvData.title, jobText, matchedTechs),
    summary: buildSummaryForFocus(cvData.summary, focus, matchedTechs),
    skillGroups: ensureRelevantSkillGroup(cvData.skillGroups, matchedTechs, focus),
    experience: filteredExperience,
    projects: filteredProjects,
    profileHighlights: filterHighlightsByFocus(cvData.profileHighlights, focus),
    closingStatement: buildClosingForFocus(focus, matchedTechs, cvData.closingStatement),
  };
}

export function applyJobDescriptionToCvWithPreset(
  cvData: CvData,
  jobText: string,
  preset: JobFocusPreset,
) {
  const focus: JobFocus = preset;
  const requestedTechs = uniqueItems(findTechnologies(jobText));
  const knownTechs = collectKnownTechnologies(cvData);
  const matchedTechs = filterTechnologiesByFocus(
    requestedTechs.filter((tech) => knownTechs.includes(tech)),
    focus,
  );

  const filteredExperience = filterExperienceByFocus(cvData.experience, focus, matchedTechs);
  const filteredProjects = filterProjectsByFocus(cvData.projects, focus, matchedTechs);

  return {
    ...cvData,
    title: buildRoleFromJobText(cvData.title, jobText, matchedTechs, focus),
    summary: buildSummaryForFocus(cvData.summary, focus, matchedTechs),
    skillGroups: ensureRelevantSkillGroup(cvData.skillGroups, matchedTechs, focus),
    experience: filteredExperience,
    projects: filteredProjects,
    profileHighlights: filterHighlightsByFocus(cvData.profileHighlights, focus),
    closingStatement: buildClosingForFocus(focus, matchedTechs, cvData.closingStatement),
  };
}

function isLikelyHeading(line: string) {
  const normalized = normalizeText(line);
  return Object.values(SECTION_ALIASES).some((aliases) =>
    aliases.some((alias) => normalized === normalizeText(alias)),
  );
}

function splitIntoSections(text: string) {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd());

  const sections: ParsedSections = {};
  let currentSection: keyof ParsedSections | null = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentSection) {
        sections[currentSection] = [...(sections[currentSection] ?? []), ""];
      }
      return;
    }

    const matchedSection = (Object.entries(SECTION_ALIASES) as Array<
      [keyof ParsedSections, readonly string[]]
    >).find(([, aliases]) =>
      aliases.some((alias) => normalizeText(trimmed) === normalizeText(alias)),
    )?.[0];

    if (matchedSection) {
      currentSection = matchedSection;
      sections[currentSection] = sections[currentSection] ?? [];
      return;
    }

    if (currentSection) {
      sections[currentSection] = [...(sections[currentSection] ?? []), trimmed];
    }
  });

  return { lines, sections };
}

function extractHeader(lines: string[]) {
  const nonEmpty = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isLikelyHeading(line));

  const email = nonEmpty.find((line) => /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(line)) ?? "";
  const phone =
    nonEmpty.find((line) => /(\+?\d[\d\s().-]{7,}\d)/.test(line) && !line.includes("@")) ?? "";
  const portfolioUrl =
    nonEmpty.find(
      (line) =>
        (line.includes("github.com") ||
          line.includes("linkedin.com") ||
          line.includes("portfolio") ||
          line.includes("http")) &&
        !line.includes("@"),
    ) ?? "";

  const firstCandidates = nonEmpty.filter((line) => !line.includes("@")).slice(0, 5);
  // Un nombre real suele tener al menos dos palabras y no ser una tecnologia o cargo
  const fullName =
    firstCandidates.find((line) => {
      const words = line.split(/\s+/).filter((w) => w.length > 1);
      const isTech = findTechnologies(line).length > 0;
      const isCommonHeader = isLikelyHeading(line);
      return words.length >= 2 && words.length <= 4 && !isTech && !isCommonHeader;
    }) ??
    firstCandidates[0] ??
    "";
  const title =
    firstCandidates.find(
      (line) =>
        line !== fullName &&
        !/(\+?\d[\d\s().-]{7,}\d)/.test(line) &&
        !line.includes("@") &&
        !line.includes("http"),
    ) ?? "";
  const location =
    firstCandidates.find(
      (line) =>
        line !== fullName &&
        line !== title &&
        line !== portfolioUrl &&
        !line.includes("@") &&
        !/(\+?\d[\d\s().-]{7,}\d)/.test(line) &&
        (line.includes(",") || line.includes("|")),
    ) ?? "";

  return { fullName, title, email, phone, location, portfolioUrl };
}

function cleanBullet(line: string) {
  return line.replace(/^[-*•]\s*/, "").trim();
}

function parseSkillGroups(lines: string[]) {
  const cleaned = lines
    .map((line) => cleanBullet(line))
    .flatMap((line) => line.split(/[|,]/))
    .map((line) => line.trim())
    .filter((line) => line.length > 1);

  if (cleaned.length === 0) {
    return [] as SkillGroup[];
  }

  const groups: SkillGroup[] = [];
  for (let index = 0; index < cleaned.length; index += 4) {
    groups.push({
      title: groups.length === 0 ? "Core Skills" : `Skills ${groups.length + 1}`,
      items: cleaned.slice(index, index + 4),
    });
  }

  return groups;
}

function parseExperiences(lines: string[]) {
  const blocks = lines.join("\n").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return blocks.slice(0, 3).map((block) => {
    const blockLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const role = blockLines[0] ?? "";
    const companyLine = blockLines[1] ?? "";
    const periodMatch = block.match(
      /((\d{1,2}\/\d{4}|\d{4})\s*[-–]\s*(Present|Actualidad|\d{1,2}\/\d{4}|\d{4}))/i,
    );
    const period = periodMatch?.[0] ?? "";
    const bullets = blockLines
      .slice(2)
      .map((line) => cleanBullet(line))
      .filter(Boolean);

    return {
      role,
      company: companyLine.replace(period, "").replace(/[|•-]+$/, "").trim(),
      location: "",
      period,
      bullets: bullets.length > 0 ? bullets : blockLines.slice(2, 5),
    } satisfies Experience;
  });
}

function parseProjects(lines: string[]) {
  const blocks = lines.join("\n").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return blocks.slice(0, 3).map((block) => {
    const blockLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      name: blockLines[0] ?? "",
      context: "",
      stack: findTechnologies(block).slice(0, 5),
      description: blockLines.slice(1).join(" "),
    } satisfies Project;
  });
}

function parseEducation(lines: string[]) {
  const blocks = lines.join("\n").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return blocks.slice(0, 2).map((block) => {
    const blockLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      institution: blockLines[0] ?? "",
      details: blockLines.slice(1).join(" "),
    } satisfies Education;
  });
}

export function parseUploadedCvText(text: string, fallback: CvData): CvData {
  const { lines, sections } = splitIntoSections(text);
  const header = extractHeader(lines);

  const summary = (sections.summary ?? []).join(" ").trim();
  const skillGroups = parseSkillGroups(sections.skills ?? []);
  const experience = parseExperiences(sections.experience ?? []);
  const projects = parseProjects(sections.projects ?? []);
  const education = parseEducation(sections.education ?? []);
  const languages = (sections.languages ?? []).join(" | ").replace(/\s+\|/g, " |").trim();
  const profileHighlights = (sections.profile ?? [])
    .map((line) => cleanBullet(line))
    .filter(Boolean)
    .slice(0, 4);

  return {
    ...fallback,
    fullName: header.fullName || fallback.fullName,
    title: header.title || fallback.title,
    email: header.email || fallback.email,
    phone: header.phone || fallback.phone,
    portfolioUrl: header.portfolioUrl || fallback.portfolioUrl,
    location: header.location || fallback.location,
    summary: summary || fallback.summary,
    skillGroups: skillGroups.length > 0 ? skillGroups : fallback.skillGroups,
    experience: experience.length > 0 ? experience : fallback.experience,
    projects: projects.length > 0 ? projects : fallback.projects,
    education: education.length > 0 ? education : fallback.education,
    languages: languages || fallback.languages,
    profileHighlights: profileHighlights.length > 0 ? profileHighlights : fallback.profileHighlights,
    closingStatement: fallback.closingStatement,
  };
}
