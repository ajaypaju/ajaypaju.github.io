// Single source of truth for every piece of text on the site.
// Edit content here; components only read from this file.
// Rule: only real facts. Never add skills, metrics or projects that aren't true.

export type SectionId =
  | 'hero'
  | 'metrics'
  | 'what-i-do'
  | 'ai'
  | 'architecture'
  | 'experience'
  | 'skills'
  | 'awards'
  | 'contact'

export interface SectionMeta {
  id: SectionId
  /** Short label for the nav and command palette. */
  navLabel: string
  /** Visible section heading. */
  heading: string
  /** Placeholder line shown until the section is built. */
  placeholder: string
}

export interface Link {
  label: string
  href: string
}

export type MetricId = 'organizations' | 'years' | 'latency' | 'report-speed'

export interface Metric {
  id: MetricId
  /** Display value, e.g. "500+". */
  value: string
  label: string
  /** Label in the metrics strip, when it differs from `label`. */
  caption?: string
  /** For animated before → after metrics. */
  from?: string
  to?: string
}

export interface Role {
  title: string
  /** "Mon YYYY"; durations are computed from these at runtime. */
  start: string
  /** "Mon YYYY" or "Present". */
  end: string
  highlights: string[]
  /** Tech tags shown under the bullets, drawn from them. */
  tags: string[]
}

export interface Company {
  name: string
  location: string
  /** Newest role first. */
  roles: Role[]
  /** Marker shown on the timeline between the two roles. */
  promotion?: string
}

export interface Award {
  title: string
  /** Omitted when not known; never guessed. */
  year?: string
  note?: string
  /** Subtle mint highlight. */
  highlight?: boolean
}

export interface SkillGroup {
  group: string
  items: string[]
}

export type TranscriptKind = 'shell' | 'prompt' | 'call' | 'ok'

/** One terminal line. The prefix ($, >, →, ✓) comes from `kind`; don't repeat it in `text`. */
export interface TranscriptLine {
  kind: TranscriptKind
  text: string
}

export type FlowIcon = 'terminal' | 'shield' | 'server' | 'bot'

export interface FlowStep {
  node: string
  caption: string
  icon: FlowIcon
  lines: TranscriptLine[]
}

export interface PromptToTask {
  heading: string
  intro: string
  /** Shown on the terminal: the transcript is a demo of the flow, not real customer data. */
  exampleLabel: string
  terminalTitle: string
  steps: FlowStep[]
  takeaways: { title: string; text: string }[]
  ui: {
    replay: string
    /** Prefix of each step dot's accessible name, e.g. "Jump to step 2: MCP Server". */
    jumpTo: string
    stepsLabel: string
  }
}

export type ArchNodeId =
  | 'client'
  | 'cloudflare'
  | 'web'
  | 'app'
  | 'redis'
  | 'queue'
  | 'mysql'
  | 'mongo'
  | 's3'
  | 'ai'
  | 'integrations'
  | 'monitoring'
  | 'git'
  | 'ci'
  | 'build'
  | 'deploy'

export interface ArchNode {
  label: string
  /** Short second line on the node; keep it brief, the details panel has the full text. */
  sub?: string
  detail: string
}

export interface Architecture {
  heading: string
  intro: string
  views: { request: string; deploy: string }
  nodes: Record<ArchNodeId, ArchNode>
  /** Labels shown at each hop of "Trace a request". */
  hops: { edge: string; web: string; app: string; data: string; response: string }
  /** Visually hidden ordered lists describing each flow. */
  srRequest: string[]
  srDeploy: string[]
  ui: {
    viewsLabel: string
    trace: string
    tracing: string
    prompt: string
    detailsLabel: string
  }
}

export interface TerminalCommand {
  /** As typed, e.g. "theme" or "cat"; `usage` adds the arguments shown in help. */
  name: string
  usage?: string
  aliases?: string[]
  description: string
}

export interface TerminalContent {
  prompt: string
  title: string
  welcome: string
  inputLabel: string
  /** Read after the visible "esc" on the close button. */
  close: string
  commands: TerminalCommand[]
  /** "{cmd}" is replaced with what was typed. */
  notFound: string
  /** Tappable commands above the input. */
  chips: string[]
  cvDownloading: string
  openUsage: string
  themeSet: string
  catBinary: string
  catMissing: string
  /** The two easter eggs. */
  sudoPassword: string
  sudoGranted: string
  hireSubject: string
  hireBody: string
  rmrf: string
}

export interface PaletteContent {
  label: string
  placeholder: string
  empty: string
  groups: { navigate: string; actions: string; links: string }
  actions: { downloadCv: string; copyEmail: string; openTerminal: string; toggleTheme: string }
  shortcutMac: string
  shortcutOther: string
  open: string
}

export interface Capability {
  title: string
  description: string
}

export interface ResponsiveImage {
  /** Path prefix under public/; files are `${path}-${width}.${ext}`. */
  path: string
  widths: number[]
  /** Intrinsic size of the largest file (sets the aspect ratio). */
  width: number
  height: number
}

export interface Photo {
  alt: string
  /** Desktop hero cutout (transparent background), AVIF + WebP at every width. */
  cutout: ResponsiveImage
  /** 1:1 avatar, AVIF + WebP. */
  avatar: ResponsiveImage
  /** Short stack line on the desktop hero chip, e.g. "Laravel · Node.js · AWS · AI". */
  heroStack: string[]
}

/** Fields of `cat ajay.ts` (terminal, formerly the hero code card) that aren't derived from other facts. */
export interface CodeCard {
  fileName: string
  variable: string
  focus: string[]
  stack: string[]
  status: string
}

export interface Education {
  degree: string
  institution: string
  year: number
}

export interface Profile {
  /** <title>, meta description and sharing/SEO data; injected into index.html at build time. */
  meta: {
    title: string
    description: string
    /** Canonical URL of the site, with a trailing slash. */
    url: string
    /** Browser UI colors per theme (match --bg in index.css). */
    themeColor: { dark: string; light: string }
    /** Open Graph / Twitter card image (public/, 1200×630; generated by scripts/generate-assets.mjs). */
    ogImage: string
    ogImageAlt: string
    /** Third line on the Open Graph image. */
    ogTagline: string
    /** JSON-LD Person: postal address and main skills (all from `skills`). */
    address: { locality: string; region: string; country: string }
    knowsAbout: string[]
  }
  name: string
  title: string
  /** One-line value proposition for the hero. */
  tagline: string
  /** Lines the hero cycles through (typed, paused, deleted). `title` is shown instead under reduced motion. */
  heroRoles: string[]
  /** When true, the hero shows a small "Open to new roles" pill. */
  openToWork: boolean
  location: string
  email: string
  links: {
    linkedin: Link
    github: Link
  }
  /** Path under public/. */
  cvPath: string
  summary: string
  metrics: Metric[]
  experience: Company[]
  skills: SkillGroup[]
  /** "What I do" cards; also the terminal `capabilities` command (alias `projects`). */
  capabilities: Capability[]
  codeCard: CodeCard
  photo: Photo
  promptToTask: PromptToTask
  architecture: Architecture
  terminal: TerminalContent
  palette: PaletteContent
  awards: Award[]
  education: Education[]
  sections: SectionMeta[]
  /** Interface micro-copy. */
  ui: {
    skipLink: string
    downloadCv: string
    contact: string
    openTerminal: string
    openToWork: string
    yearsShort: string
    orgsShort: string
    /** Labels on the latency before/after bars in the metrics strip. */
    metricBefore: string
    metricAfter: string
    statusPrefix: string
    leadingEngineering: string
    bootHost: string
    bootSkipHint: string
    skillsViewLabel: string
    skillsGrid: string
    skillsJson: string
    skillsFile: string
    copy: string
    copied: string
    copyFailed: string
    emailCopied: string
    /** Read after the visible theme name on the toggle; "{next}" is the other theme. */
    themeToggleHint: string
    /** Logged once to the DevTools console; "{email}" is replaced. */
    devGreeting: string
    contactCommand: string
    emailMe: string
    currentRole: string

  }
}

const promptToTask: PromptToTask = {
  heading: 'Prompt → Task',
  intro:
    'How I connected an AI coding assistant to a production SaaS platform: one plain-language prompt in, a task created and completed by an AI bot user.',
  exampleLabel: 'Illustrative example',
  terminalTitle: 'claude — demo',
  steps: [
    {
      node: 'Claude Code',
      caption: 'A plain-language prompt.',
      icon: 'terminal',
      lines: [
        { kind: 'shell', text: 'claude' },
        {
          kind: 'prompt',
          text: 'Create a task "Generate weekly client report", assign it to the reporting bot, due Friday',
        },
      ],
    },
    {
      node: 'MCP Server',
      caption: 'Role-based access check.',
      icon: 'shield',
      lines: [
        { kind: 'call', text: 'mcp tools/call: create_task' },
        { kind: 'ok', text: 'role check passed: user can create tasks in this workspace' },
      ],
    },
    {
      node: 'Platform API',
      caption: 'The task is created.',
      icon: 'server',
      lines: [
        { kind: 'call', text: 'POST /api/tasks' },
        { kind: 'ok', text: '201 Created: "Generate weekly client report"' },
      ],
    },
    {
      node: 'AI Bot User',
      caption: 'A bot teammate picks it up and completes it.',
      icon: 'bot',
      lines: [
        { kind: 'call', text: 'report-bot picked up the task' },
        { kind: 'ok', text: 'task completed' },
      ],
    },
  ],
  takeaways: [
    { title: 'Permissions enforced', text: 'The MCP server scopes every action to the user’s role.' },
    { title: 'Prompts become real work', text: 'Plain language turns into tasks inside the platform.' },
    {
      title: 'AI as a teammate',
      text: 'Bot users are assigned tasks like anyone else and complete automated work.',
    },
  ],
  ui: {
    replay: 'Replay',
    jumpTo: 'Jump to step',
    stepsLabel: 'Walkthrough steps',
  },
}

const CI_DETAIL = 'CI/CD deployment workflows, including on-premise deployments.'

const architecture: Architecture = {
  heading: 'How a request flows',
  intro:
    'The production path I design, run and monitor, from the user’s browser through Cloudflare to servers on AWS and back. Simplified and generic; no confidential internals.',
  views: { request: 'Request flow', deploy: 'Deploy flow' },
  nodes: {
    client: {
      label: 'Client',
      sub: 'web · app · API',
      detail: 'Browsers, mobile apps and API clients from 500+ organizations.',
    },
    cloudflare: { label: 'Cloudflare', sub: 'edge', detail: 'Request flow and traffic routing at the edge.' },
    web: { label: 'Nginx', detail: 'Configure and harden Nginx: version hiding and blocked access to configuration files.' },
    app: {
      label: 'App servers',
      sub: 'AWS EC2',
      detail: 'Laravel, Node.js and NestJS REST APIs: multi-tenancy and RBAC. Docker.',
    },
    redis: {
      label: 'Redis cache',
      detail: 'Caching that helped cut reporting latency from ~900\u00a0ms to ~300\u00a0ms.',
    },
    queue: { label: 'Queue workers', detail: 'Queue-based background jobs and data-aggregation pipelines.' },
    mysql: { label: 'MySQL', sub: 'AWS RDS', detail: 'Schema design and query optimization.' },
    mongo: { label: 'MongoDB', detail: 'Schemas for backend and reporting workloads.' },
    s3: { label: 'AWS S3', detail: 'File storage.' },
    ai: { label: 'AI services', sub: 'LLM APIs · MCP', detail: 'LLM chat, a role-based MCP server and AI bot users.' },
    integrations: {
      label: 'Integrations',
      sub: 'payments · SSO',
      detail: 'Stripe, Razorpay, webhooks, OAuth2 SSO, email/SMS.',
    },
    monitoring: { label: 'Monitoring', detail: 'Monitoring and incident resolution for production.' },
    git: { label: 'git push', detail: 'Code pushed to GitLab triggers the CI/CD pipeline.' },
    ci: { label: 'GitLab CI/CD', detail: CI_DETAIL },
    build: { label: 'Build', detail: CI_DETAIL },
    deploy: { label: 'Deploy', sub: 'EC2 · on-premise', detail: CI_DETAIL },
  },
  hops: {
    edge: 'edge routing',
    web: 'web server',
    app: 'app logic',
    data: 'cache / database',
    response: 'response',
  },
  srRequest: [
    'A client (browser, mobile app or API client) sends a request.',
    'Cloudflare routes it at the edge.',
    'The web server passes it to the app servers on AWS EC2.',
    'The app servers read and write Redis, queue workers, MySQL on AWS RDS, MongoDB and AWS S3, and call AI services and integrations when needed.',
    'The response travels back along the same path to the client. Monitoring covers every server-side step.',
  ],
  srDeploy: [
    'A git push starts the pipeline.',
    'GitLab CI/CD runs it.',
    'The build is produced.',
    'It is deployed to servers on AWS EC2 or on-premise.',
    'Monitoring watches the release in production.',
  ],
  ui: {
    viewsLabel: 'Diagram view',
    trace: 'Trace a request',
    tracing: 'Tracing…',
    prompt: 'Select a node to see what I do there.',
    detailsLabel: 'Node details',
  },
}

const terminal: TerminalContent = {
  prompt: 'ajay@portfolio:~$',
  title: 'ajay@portfolio: ~',
  welcome: "Welcome. Type 'help' to see commands.",
  inputLabel: 'Terminal command',
  close: 'Close terminal',
  commands: [
    { name: 'help', description: 'list commands' },
    { name: 'whoami', description: 'name, title and location' },
    { name: 'about', description: 'a short summary' },
    { name: 'experience', description: 'roles, dates and durations' },
    { name: 'skills', usage: '[--json]', description: 'skills by group, or as skills.json' },
    { name: 'capabilities', aliases: ['projects'], description: 'what I do' },
    { name: 'awards', description: 'awards and education' },
    { name: 'contact', description: 'email, LinkedIn, GitHub, location' },
    { name: 'cv', description: 'download my CV' },
    { name: 'ls', description: 'list files' },
    { name: 'cat', usage: '<file>', description: 'print a file, e.g. cat ajay.ts' },
    { name: 'open', usage: '<section>', aliases: ['cd'], description: 'close the terminal and go to a section' },
    { name: 'theme', usage: '[dark|light]', description: 'switch or toggle the theme' },
    { name: 'history', description: 'commands you have run' },
    { name: 'clear', description: 'clear the screen (Ctrl+L)' },
    { name: 'exit', description: 'close the terminal (Esc)' },
  ],
  notFound: "command not found: {cmd}. Type 'help'.",
  chips: ['help', 'whoami', 'skills', 'contact', 'cat ajay.ts'],
  cvDownloading: 'Downloading Ajay_P_CV.pdf…',
  openUsage: 'usage: open <section>. Sections:',
  themeSet: 'theme: {theme}',
  catBinary: 'cat: cv.pdf: binary file. Try `cv`.',
  catMissing: 'cat: {file}: no such file. Try `ls`.',
  sudoPassword: '[sudo] password for recruiter: ********',
  sudoGranted: 'Access granted. Opening email…',
  hireSubject: "Let's talk about a role",
  hireBody: 'Hi Ajay,\n\nI came across your portfolio and would like to talk about a role on our team.\n\nBest,\n',
  rmrf: 'Nice try. This portfolio runs in production.',
}

const palette: PaletteContent = {
  label: 'Command palette',
  placeholder: 'Search sections and actions…',
  empty: 'No results',
  groups: { navigate: 'Navigate', actions: 'Actions', links: 'Links' },
  actions: {
    downloadCv: 'Download CV',
    copyEmail: 'Copy email',
    openTerminal: 'Open terminal',
    toggleTheme: 'Toggle theme',
  },
  shortcutMac: '⌘K',
  shortcutOther: 'Ctrl K',
  open: 'Open command palette',
}

export const profile: Profile = {
  meta: {
    title: 'Ajay P · Technical Lead · Full-Stack Engineer',
    description:
      'Ajay P, Technical Lead and Full-Stack Engineer. Designs and builds scalable web platforms, including a multi-tenant SaaS used by 500+ organizations, and integrates AI that automates real work.',
    url: 'https://ajaypaju.github.io/',
    themeColor: { dark: '#0a0b0d', light: '#f7f8fa' },
    ogImage: 'og-image.png',
    ogImageAlt: 'Ajay P, Technical Lead and Full-Stack Engineer',
    ogTagline: 'Systems · Cloud & DevOps · AI automation',
    address: { locality: 'Calicut', region: 'Kerala', country: 'IN' },
    knowsAbout: [
      'System design',
      'Multi-tenant SaaS',
      'Laravel',
      'PHP',
      'Node.js',
      'NestJS',
      'REST APIs',
      'AWS',
      'Cloudflare',
      'Docker',
      'MySQL',
      'MongoDB',
      'Redis',
      'LLM API integration',
      'MCP servers',
      'Claude Code',
    ],
  },
  name: 'Ajay P',
  title: 'Technical Lead · Full-Stack Engineer',
  tagline:
    'I design and build scalable web platforms, and integrate AI that automates real work.',
  heroRoles: [
    'Technical Lead',
    'Full-Stack Engineer',
    'System Design & Architecture',
    'AI Integration & Automation',
    'Cloud & DevOps',
  ],
  openToWork: false,
  location: 'Calicut, Kerala, India',
  email: 'ajaypaju008@gmail.com',
  links: {
    linkedin: { label: 'LinkedIn', href: 'https://linkedin.com/in/ajaypofficial' },
    github: { label: 'GitHub', href: 'https://github.com/ajaypaju' },
  },
  cvPath: '/Ajay_P_CV.pdf',

  summary:
    'Technical Lead with 5+ years designing, building and running production systems, including a multi-tenant SaaS platform used by 500+ organizations. I own architecture, cloud infrastructure on AWS and Cloudflare, application security and production reliability, and lead AI integration and automation.',

  metrics: [
    { id: 'organizations', value: '500+', label: 'organizations', caption: 'organizations served' },
    { id: 'years', value: '5+', label: 'years building production software' },
    { id: 'latency', value: '~300\u00a0ms', label: 'reporting API latency', caption: 'reporting latency', from: '~900\u00a0ms', to: '~300\u00a0ms' },
    { id: 'report-speed', value: '60%', label: 'faster report generation' },
  ],

  experience: [
    {
      name: 'Infinite Open Source Solutions LLP',
      location: 'Calicut, Kerala',
      roles: [
        {
          title: 'Technical Lead',
          start: 'Apr 2026',
          end: 'Present',
          highlights: [
            'Own backend architecture, technical delivery and production reliability for the platform.',
            'Built a role-based MCP server that exposes the platform’s data and actions to AI clients, scoped to each user’s role and permissions.',
            'Connected Claude Code to the platform so a plain-language prompt creates tasks automatically.',
            'Introduced AI bot users: agent accounts that are assigned tasks like any team member and carry out automated work.',
            'Built LLM-powered chat workflows for in-product help and assisted automation.',
            'Manage production servers and infrastructure on AWS (EC2, RDS, S3) and Cloudflare: request flow and traffic routing, Nginx, Docker, monitoring and deployment workflows, including on-premise deployments.',
            'Led remediation of every finding from an enterprise client’s OWASP-based penetration test, including high-severity issues: login rate limiting, session and cache controls, secure cookies, formula injection in data exports, open redirects, error disclosure and Nginx hardening.',
            'Mentor junior developers, review pull requests, set engineering standards, coordinate releases with Product and QA.',
          ],
          tags: ['AWS', 'Cloudflare', 'Nginx', 'Docker', 'OWASP', 'MCP', 'Claude Code', 'LLM APIs', 'Laravel', 'Node.js'],
        },
        {
          title: 'Software Engineer',
          start: 'Oct 2021',
          end: 'Mar 2026',
          highlights: [
            'Built Laravel REST APIs and frontend modules for time tracking, project management, leave workflows, screenshot capture, activity logging and reporting.',
            'Cut reporting API latency from ~900\u00a0ms to ~300\u00a0ms and improved report generation speed 60% through MySQL query optimization and Redis caching.',
            'Designed and optimized MySQL and MongoDB schemas for backend and reporting workloads.',
            'Integrated Stripe, Razorpay, AWS S3, email/SMS, webhooks and OAuth2 SSO.',
            'Implemented RBAC with Laravel policies and middleware; built queue-based background jobs and data-aggregation pipelines.',
            'Shipped features through CI/CD workflows, code reviews and release support.',
          ],
          tags: ['PHP', 'Laravel', 'MySQL', 'MongoDB', 'Redis', 'Stripe', 'Razorpay', 'OAuth2'],
        },
      ],
      promotion: 'Promoted to Technical Lead',
    },
  ],

  skills: [
    {
      group: 'AI & Automation',
      items: ['LLM API integration', 'MCP servers', 'Claude Code', 'AI agents and bot users', 'Prompt engineering'],
    },
    {
      group: 'Backend',
      items: ['PHP', 'Laravel (9–13)', 'Node.js', 'NestJS', 'REST APIs', 'Queues and background jobs'],
    },
    { group: 'Frontend', items: ['React', 'TypeScript (this website)', 'HTML', 'CSS', 'JavaScript'] },
    {
      group: 'Cloud & DevOps',
      items: [
        'AWS (EC2, S3, RDS)',
        'Cloudflare',
        'Server management',
        'Nginx',
        'Docker',
        'GitLab CI/CD',
        'GitHub',
        'Linux',
        'Monitoring',
      ],
    },
    { group: 'Databases', items: ['MySQL', 'MongoDB', 'Redis'] },
    {
      group: 'Architecture & Security',
      items: [
        'Multi-tenant SaaS',
        'Caching',
        'Webhooks',
        'System design',
        'OAuth2 SSO',
        'RBAC',
        'OWASP Top 10',
        'VAPT remediation',
        'Rate limiting',
        'Security headers',
      ],
    },
  ],

  capabilities: [
    {
      title: 'System Design & Architecture',
      description: 'Architecture decisions and new backend modules for a multi-tenant SaaS serving 500+ organizations.',
    },
    {
      title: 'SaaS Engineering',
      description: 'Multi-tenancy, RBAC, queue-based background jobs, payments with Stripe and Razorpay, OAuth2 SSO.',
    },
    {
      title: 'AI Integration & Automation',
      description:
        'LLM-powered chat, a role-based MCP server, a Claude Code integration that turns prompts into tasks, and AI bot users that complete assigned work.',
    },
    {
      title: 'Full-Stack Development',
      description: 'REST APIs and frontend modules with Laravel, Node.js and NestJS.',
    },
    {
      title: 'Security & Reliability',
      description:
        'Led remediation of an OWASP-based penetration test: rate limiting, session and cache controls, secure cookies and Nginx hardening. Production monitoring and incident resolution.',
    },
    {
      title: 'Cloud & DevOps',
      description:
        'Run production servers on AWS and Cloudflare: request flow, web servers, Docker, GitLab CI/CD, monitoring and on-premise deployments.',
    },
  ],

  promptToTask,
  architecture,
  terminal,
  palette,

  photo: {
    alt: 'Ajay P',
    cutout: { path: '/images/ajay-cutout', widths: [600, 1200], width: 1200, height: 2055 },
    avatar: { path: '/images/ajay-avatar', widths: [192, 384], width: 384, height: 384 },
    heroStack: ['Laravel', 'Node.js', 'AWS', 'AI'],
  },

  codeCard: {
    fileName: 'ajay.ts',
    variable: 'ajay',
    focus: ['System design', 'Backend & APIs', 'AI automation', 'Full-stack', 'Cloud & DevOps'],
    stack: ['Laravel', 'Node.js', 'NestJS', 'React', 'AWS'],
    status: 'shipping',
  },

  awards: [
    { title: 'Winner, company-wide AI Prompt Engineering Challenge', highlight: true },
    { title: 'Best R&D Team Performer', year: '2023–2025' },
    { title: 'Best Programmer Award', year: '2022' },
  ],

  education: [
    {
      degree: 'B.Sc. Computer Science',
      institution: 'People’s Co-operative Arts and Science College, Kasaragod',
      year: 2020,
    },
  ],

  sections: [
    {
      id: 'hero',
      navLabel: 'Home',
      heading: 'Ajay P',
      placeholder: '',
    },
    {
      id: 'metrics',
      navLabel: 'Impact',
      heading: 'Impact in numbers',
      placeholder: 'Animated metrics strip goes here.',
    },
    {
      id: 'what-i-do',
      navLabel: 'What I do',
      heading: 'What I do',
      placeholder: '',
    },
    {
      id: 'ai',
      navLabel: 'AI',
      heading: promptToTask.heading,
      placeholder: '',
    },
    {
      id: 'architecture',
      navLabel: 'Architecture',
      heading: architecture.heading,
      placeholder: '',
    },
    {
      id: 'experience',
      navLabel: 'Experience',
      heading: 'Experience',
      placeholder: 'Experience timeline goes here.',
    },
    {
      id: 'skills',
      navLabel: 'Skills',
      heading: 'Skills',
      placeholder: 'Grouped skills grid with a “view as JSON” toggle goes here.',
    },
    {
      id: 'awards',
      navLabel: 'Awards',
      heading: 'Awards & education',
      placeholder: 'Awards and education go here.',
    },
    {
      id: 'contact',
      navLabel: 'Contact',
      heading: 'Get in touch',
      placeholder: 'Terminal-styled contact block goes here.',
    },
  ],

  ui: {
    skipLink: 'Skip to content',
    downloadCv: 'Download CV',
    contact: 'Contact',
    openTerminal: 'Open Terminal',
    openToWork: 'Open to new roles',
    yearsShort: 'yrs',
    orgsShort: 'orgs',
    metricBefore: 'before',
    metricAfter: 'after',
    statusPrefix: 'Currently:',
    leadingEngineering: 'leading engineering for a platform serving',
    bootHost: 'ajay.dev',
    bootSkipHint: 'press any key to skip',
    skillsViewLabel: 'Skills view',
    skillsGrid: 'Grid',
    skillsJson: 'JSON',
    skillsFile: 'skills.json',
    copy: 'copy',
    copied: 'Copied',
    copyFailed: 'Failed',
    emailCopied: 'Email copied',
    themeToggleHint: ' theme, switch to {next}',
    devGreeting: 'Hey, fellow developer. Press ` to open the terminal, or ⌘K for commands. Email: {email}',
    contactCommand: 'ajay --contact',
    emailMe: 'Email me',
    currentRole: 'current',

  },
}

export const sectionById = (id: SectionId): SectionMeta => {
  const s = profile.sections.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown section: ${id}`)
  return s
}

export const metricById = (id: MetricId): Metric => {
  const m = profile.metrics.find((x) => x.id === id)
  if (!m) throw new Error(`Unknown metric: ${id}`)
  return m
}

// Derived lines: composed from the facts above so they never drift from them.

const organizations = metricById('organizations')
const latency = metricById('latency')
const years = metricById('years')
const currentRole = profile.experience[0].roles[0]

/** Hero status line: "Currently: leading engineering for a platform serving 500+ organizations". */
export const heroStatus = `${profile.ui.statusPrefix} ${profile.ui.leadingEngineering} ${organizations.value} ${organizations.label}`

/** Glass chips beside the desktop hero cutout. */
export const photoChips = {
  stack: profile.photo.heroStack.join(' · '),
  stats: `${years.value} ${profile.ui.yearsShort} · ${organizations.value} ${profile.ui.orgsShort}`,
}

/** `const ajay = { ... }` for the terminal's `cat ajay.ts`, in display order. */
export const codeCardEntries: [key: string, value: string | string[]][] = [
  ['role', currentRole.title],
  ['experience', `${years.value} years`],
  ['focus', profile.codeCard.focus],
  ['stack', profile.codeCard.stack],
  ['scale', `${organizations.value} ${organizations.label}`],
  ['status', profile.codeCard.status],
]

export interface BootLine {
  kind: 'prompt' | 'ok' | 'plain'
  text: string
}

export const bootLines: BootLine[] = [
  { kind: 'prompt', text: `booting ${profile.ui.bootHost}` },
  { kind: 'ok', text: `loading profile: ${profile.name}, ${currentRole.title}` },
  { kind: 'ok', text: `tenants online: ${organizations.value} ${organizations.label}` },
  { kind: 'ok', text: `redis cache warm: reporting latency ${latency.from} → ${latency.to}` },
  { kind: 'ok', text: 'mcp server: role-based access enabled' },
  { kind: 'plain', text: 'ready.' },
]
