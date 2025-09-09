import { db } from '../src/lib/db';
import { projectTemplates } from './simple-schema';

export const defaultProjectTemplates = [
  // Dashboard Templates
  {
    name: "React Analytics Dashboard",
    description: "Modern analytics dashboard with interactive charts, real-time data, and responsive design using React and TypeScript",
    category: "dashboard" as const,
    area: "Work",
    technologies: JSON.stringify(["React", "TypeScript", "Next.js", "TailwindCSS", "Chart.js", "PostgreSQL"]),
    estimatedDuration: "3-4 weeks",
    difficulty: "medium" as const,
    taskTemplate: JSON.stringify([
      "Set up Next.js project with TypeScript",
      "Design database schema for analytics data",
      "Implement authentication system",
      "Create data visualization components",
      "Build responsive dashboard layout",
      "Add real-time data updates",
      "Implement filtering and search",
      "Deploy to production"
    ]),
    checklistTemplate: JSON.stringify([
      "Project setup with proper folder structure",
      "Database design and migration scripts",
      "User authentication flow",
      "Chart components (bar, line, pie, etc.)",
      "Responsive grid layout",
      "WebSocket or SSE for real-time updates",
      "Advanced filtering capabilities",
      "Production deployment and monitoring"
    ]),
    prerequisites: JSON.stringify(["JavaScript/TypeScript", "React basics", "Database concepts"]),
    learningObjectives: JSON.stringify(["Advanced React patterns", "Data visualization", "Real-time web apps", "Performance optimization"]),
    popularityScore: 95
  },

  {
    name: "Vue.js Business Intelligence Dashboard",
    description: "Enterprise-grade BI dashboard with Vue.js, featuring advanced analytics, KPI tracking, and beautiful visualizations",
    category: "dashboard" as const,
    area: "Work",
    technologies: JSON.stringify(["Vue.js", "Nuxt.js", "TypeScript", "D3.js", "Vuetify", "Node.js", "MongoDB"]),
    estimatedDuration: "4-5 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Initialize Nuxt.js project with TypeScript",
      "Design MongoDB collections for BI data",
      "Create reusable chart components with D3.js",
      "Implement user role management",
      "Build customizable dashboard widgets",
      "Add data export functionality",
      "Implement caching strategy",
      "Performance optimization and testing"
    ]),
    prerequisites: JSON.stringify(["Vue.js experience", "JavaScript/TypeScript", "NoSQL databases"]),
    learningObjectives: JSON.stringify(["Vue 3 Composition API", "D3.js data visualization", "Enterprise architecture", "Performance optimization"]),
    popularityScore: 78
  },

  // Website Templates
  {
    name: "Modern Portfolio Website",
    description: "Responsive portfolio website showcasing projects, skills, and experience with modern design and smooth animations",
    category: "website" as const,
    area: "Personal",
    technologies: JSON.stringify(["Next.js", "TypeScript", "TailwindCSS", "Framer Motion", "MDX"]),
    estimatedDuration: "2-3 weeks",
    difficulty: "easy" as const,
    taskTemplate: JSON.stringify([
      "Design wireframes and mockups",
      "Set up Next.js with TailwindCSS",
      "Create responsive layout components",
      "Build project showcase section",
      "Add smooth scroll animations",
      "Implement contact form",
      "SEO optimization",
      "Deploy and configure domain"
    ]),
    prerequisites: JSON.stringify(["HTML/CSS", "JavaScript basics", "Design principles"]),
    learningObjectives: JSON.stringify(["Modern web development", "Responsive design", "Animation techniques", "SEO best practices"]),
    popularityScore: 92
  },

  {
    name: "E-commerce Store with Stripe",
    description: "Full-featured e-commerce website with product catalog, shopping cart, payment processing, and admin panel",
    category: "website" as const,
    area: "Work",
    technologies: JSON.stringify(["Next.js", "TypeScript", "Stripe", "Prisma", "PostgreSQL", "TailwindCSS"]),
    estimatedDuration: "6-8 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Database design for products and orders",
      "User authentication and profiles",
      "Product catalog with search/filter",
      "Shopping cart functionality",
      "Stripe payment integration",
      "Order management system",
      "Admin panel for inventory",
      "Email notifications and receipts"
    ]),
    prerequisites: JSON.stringify(["React/Next.js", "Database design", "Payment systems knowledge"]),
    learningObjectives: JSON.stringify(["E-commerce architecture", "Payment processing", "State management", "Security best practices"]),
    popularityScore: 87
  },

  // Mobile App Templates
  {
    name: "React Native Fitness Tracker",
    description: "Cross-platform fitness tracking app with workout logging, progress charts, and social features",
    category: "mobile" as const,
    area: "Health",
    technologies: JSON.stringify(["React Native", "TypeScript", "Expo", "AsyncStorage", "Chart.js"]),
    estimatedDuration: "5-6 weeks",
    difficulty: "medium" as const,
    taskTemplate: JSON.stringify([
      "Set up Expo development environment",
      "Design app navigation structure",
      "Create workout logging interface",
      "Implement data persistence",
      "Build progress visualization",
      "Add user profile management",
      "Integrate device sensors",
      "Test on iOS and Android devices"
    ]),
    prerequisites: JSON.stringify(["React experience", "Mobile development concepts", "JavaScript/TypeScript"]),
    learningObjectives: JSON.stringify(["Mobile UI/UX design", "Cross-platform development", "Device APIs", "App store deployment"]),
    popularityScore: 82
  },

  {
    name: "Flutter Social Media App",
    description: "Feature-rich social media application with real-time messaging, photo sharing, and user interactions",
    category: "mobile" as const,
    area: "Personal",
    technologies: JSON.stringify(["Flutter", "Dart", "Firebase", "Cloud Firestore", "Firebase Auth"]),
    estimatedDuration: "7-8 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Flutter project setup and configuration",
      "Firebase backend integration",
      "User authentication flow",
      "Photo upload and sharing features",
      "Real-time chat implementation",
      "Social features (likes, comments, follows)",
      "Push notifications setup",
      "App store optimization and deployment"
    ]),
    prerequisites: JSON.stringify(["Programming fundamentals", "Mobile app concepts", "Firebase basics"]),
    learningObjectives: JSON.stringify(["Flutter framework", "Firebase integration", "Real-time applications", "Mobile app deployment"]),
    popularityScore: 75
  },

  // Automation Templates
  {
    name: "Email Marketing Automation",
    description: "Automated email marketing system with campaign management, subscriber segmentation, and analytics",
    category: "automation" as const,
    area: "Work",
    technologies: JSON.stringify(["Node.js", "TypeScript", "SendGrid", "MongoDB", "Express.js", "Redis"]),
    estimatedDuration: "4-5 weeks",
    difficulty: "medium" as const,
    taskTemplate: JSON.stringify([
      "Design email campaign data models",
      "Implement subscriber management API",
      "Create email template system",
      "Build campaign scheduling logic",
      "Add segmentation and targeting",
      "Implement tracking and analytics",
      "Create admin dashboard",
      "Set up monitoring and logging"
    ]),
    prerequisites: JSON.stringify(["Node.js experience", "API development", "Database design", "Email systems knowledge"]),
    learningObjectives: JSON.stringify(["Marketing automation", "Email deliverability", "Data analytics", "System architecture"]),
    popularityScore: 73
  },

  {
    name: "Social Media Content Scheduler",
    description: "Multi-platform social media scheduler with content calendar, analytics, and team collaboration features",
    category: "automation" as const,
    area: "Work",
    technologies: JSON.stringify(["Python", "FastAPI", "Celery", "Redis", "PostgreSQL", "React"]),
    estimatedDuration: "5-6 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Set up FastAPI backend with authentication",
      "Integrate social media platform APIs",
      "Build content scheduling system",
      "Implement queue management with Celery",
      "Create analytics dashboard",
      "Add team collaboration features",
      "Build content approval workflow",
      "Deploy with monitoring and scaling"
    ]),
    prerequisites: JSON.stringify(["Python programming", "API development", "Task queues", "Social media APIs"]),
    learningObjectives: JSON.stringify(["API integration", "Asynchronous processing", "Social media automation", "Team workflow systems"]),
    popularityScore: 68
  },

  // Learning Templates
  {
    name: "Interactive Coding Tutorial Platform",
    description: "Educational platform for coding tutorials with interactive exercises, progress tracking, and community features",
    category: "learning" as const,
    area: "Learning",
    technologies: JSON.stringify(["Next.js", "TypeScript", "Monaco Editor", "Supabase", "TailwindCSS"]),
    estimatedDuration: "6-7 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Design learning path data structure",
      "Implement code editor with syntax highlighting",
      "Build exercise evaluation system",
      "Create progress tracking features",
      "Add user authentication and profiles",
      "Implement community discussion features",
      "Build instructor dashboard",
      "Add gamification elements"
    ]),
    prerequisites: JSON.stringify(["Full-stack development", "Educational technology concepts", "Code evaluation systems"]),
    learningObjectives: JSON.stringify(["EdTech platform development", "Code execution systems", "Gamification", "Community features"]),
    popularityScore: 79
  },

  {
    name: "Language Learning Mobile App",
    description: "Gamified language learning application with spaced repetition, pronunciation practice, and progress analytics",
    category: "learning" as const,
    area: "Learning",
    technologies: JSON.stringify(["React Native", "TypeScript", "Expo", "SQLite", "Audio APIs"]),
    estimatedDuration: "8-10 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Design spaced repetition algorithm",
      "Create interactive lesson components",
      "Implement audio recording and playback",
      "Build pronunciation assessment",
      "Add gamification system",
      "Create progress analytics",
      "Implement offline functionality",
      "Add social learning features"
    ]),
    prerequisites: JSON.stringify(["Mobile development", "Algorithm design", "Audio processing", "Educational psychology"]),
    learningObjectives: JSON.stringify(["Learning algorithm implementation", "Audio processing", "Gamification design", "Offline-first architecture"]),
    popularityScore: 71
  },

  // Business Templates
  {
    name: "CRM System for Small Business",
    description: "Customer relationship management system with contact management, sales pipeline, and reporting features",
    category: "business" as const,
    area: "Work",
    technologies: JSON.stringify(["React", "Node.js", "TypeScript", "PostgreSQL", "Express.js", "Chart.js"]),
    estimatedDuration: "6-8 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Design CRM database schema",
      "Build contact management interface",
      "Create sales pipeline visualization",
      "Implement task and activity tracking",
      "Add email integration",
      "Build reporting and analytics",
      "Create user role management",
      "Add data import/export functionality"
    ]),
    prerequisites: JSON.stringify(["Full-stack development", "Business process understanding", "Database design"]),
    learningObjectives: JSON.stringify(["Business application development", "Complex data relationships", "User permission systems", "Business intelligence"]),
    popularityScore: 76
  },

  {
    name: "Project Management Tool",
    description: "Collaborative project management application with task tracking, team communication, and timeline visualization",
    category: "business" as const,
    area: "Work",
    technologies: JSON.stringify(["Vue.js", "Node.js", "TypeScript", "Socket.io", "MongoDB", "Gantt Charts"]),
    estimatedDuration: "7-9 weeks",
    difficulty: "hard" as const,
    taskTemplate: JSON.stringify([
      "Design project and task data models",
      "Build real-time collaboration features",
      "Create Gantt chart visualization",
      "Implement team communication system",
      "Add file sharing and version control",
      "Build time tracking features",
      "Create project reporting dashboard",
      "Add mobile responsive interface"
    ]),
    prerequisites: JSON.stringify(["Full-stack development", "Real-time applications", "Project management concepts"]),
    learningObjectives: JSON.stringify(["Real-time collaboration", "Complex UI components", "Team workflow systems", "Data visualization"]),
    popularityScore: 81
  }
];

export async function seedProjectTemplates() {
  try {
    console.log('🌱 Seeding project templates...');
    
    // Clear existing templates (optional - for development)
    // await db.delete(projectTemplates);
    
    // Insert all default templates
    const inserted = await db.insert(projectTemplates).values(defaultProjectTemplates).returning();
    
    console.log(`✅ Successfully seeded ${inserted.length} project templates`);
    return inserted;
  } catch (error) {
    console.error('❌ Error seeding project templates:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedProjectTemplates()
    .then(() => {
      console.log('🎉 Template seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}