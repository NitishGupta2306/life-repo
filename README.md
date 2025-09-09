# Life RPG - Gamify Your Life

Transform your daily life into an epic RPG adventure with character progression, quest management, ADHD support, and brain dump processing.

## 🎮 Overview

Life RPG is a comprehensive life management system that gamifies personal productivity, wellness, and growth. By treating your life like an RPG character, you gain XP for completing tasks, manage resources like energy and motivation, and unlock achievements as you progress through your personal journey.

## ✨ Features

### 🛡️ Character System
- **RPG-Style Character**: Create your life hero with custom name, class, and level
- **Character Classes**: Choose from Life Explorer, Wellness Warrior, Social Butterfly, Creative Genius, or Productivity Master
- **Level Progression**: Gain XP from activities and level up your character
- **Resource Management**: Track Energy, Focus, Motivation, and Spoons
- **Stats Tracking**: Monitor Productivity, Wellness, Social, Creativity, Learning, and Organization stats

### ⚔️ Quest Management
- **Quest Board**: Create and manage daily, main, side, boss, and self-care quests
- **Quest Types**: Different quest categories with varying XP rewards and energy costs
- **Objectives System**: Break down quests into actionable objectives
- **Quest Completion**: Automatic XP awards and resource updates upon completion
- **Boss Battles**: Tackle major life challenges with epic quest rewards

### 🧠 ADHD Support System
- **Spoon Theory**: Track your daily energy capacity with the spoon system
- **Basic Needs Tracking**: Monitor hydration, nutrition, sleep, movement, and medication
- **Focus Sessions**: Pomodoro and deep work sessions with progress tracking
- **Gentle Reminders**: ADHD-friendly notifications and check-ins
- **Resource Integration**: Basic needs completion affects character resources

### 🧩 Brain Dump & AI Processing
- **Thought Capture**: Quickly dump thoughts, worries, and ideas
- **AI Analysis**: Automated processing to extract actionable insights
- **Quest Generation**: AI converts brain dumps into structured quests
- **Mood Tracking**: Track energy and urgency levels with each dump
- **Pattern Recognition**: Identify recurring themes and concerns

### 📊 Analytics & Reflection System
- **Daily Reflections**: Structured reflection prompts for self-awareness
- **Weekly/Monthly Reviews**: Deeper pattern analysis and goal setting
- **Progress Tracking**: Visual dashboards showing improvement over time
- **Mood & Energy Trends**: Long-term tracking of mental state patterns
- **AI Insights**: Personalized recommendations based on reflection data

### 🏆 Achievement System
- **Cross-System Achievements**: Unlock rewards based on activities across all systems
- **Achievement Categories**: Habits, Focus, Quests, Reflection, and Progression achievements
- **Rarity Levels**: Common, Uncommon, Rare, Epic, and Legendary achievements
- **XP Rewards**: Additional experience points for major milestones
- **Progress Tracking**: Monitor progress toward upcoming achievements

## 🚀 Technology Stack

- **Frontend**: Next.js 14+ with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with comprehensive validation
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Authentication**: Supabase Auth (configured for future implementation)
- **UI Components**: Custom shadcn/ui components with Life RPG theming
- **Error Handling**: Comprehensive error boundaries and API error management
- **Performance**: Optimized queries, caching, and code splitting

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Supabase project (for authentication)

### Environment Variables
Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/life_rpg"

# Supabase (for auth)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# NextAuth (if using)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd life-rpg

# Install dependencies
npm install

# Set up the database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your Life RPG in action!

## 🗂️ Project Structure

```
life-rpg/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── character/     # Character management
│   │   │   ├── quests/        # Quest system
│   │   │   ├── adhd/          # ADHD support features
│   │   │   ├── brain-dump/    # Brain dump processing
│   │   │   ├── reflections/   # Reflection system
│   │   │   └── achievements/  # Achievement tracking
│   │   ├── globals.css        # Global styles with RPG theme
│   │   ├── layout.tsx         # Root layout with error boundaries
│   │   └── page.tsx           # Enhanced Life RPG home page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── character/         # Character creation & management
│   │   └── error-boundary/    # Error handling components
│   ├── contexts/
│   │   └── UserContext.tsx    # User session management
│   ├── lib/
│   │   ├── api-client.ts      # Type-safe API client
│   │   ├── character-service.ts # Character business logic
│   │   ├── database-service.ts # Optimized database operations
│   │   ├── integration-service.ts # Cross-system integration
│   │   ├── api-response.ts    # Standardized API responses
│   │   ├── db.ts              # Enhanced database configuration
│   │   └── utils.ts           # Utility functions
│   └── types/
│       └── user.ts            # TypeScript type definitions
├── database/
│   ├── schema.ts              # Main schema exports
│   ├── schemas/               # Individual table schemas
│   │   ├── character.ts       # Character system tables
│   │   ├── quests.ts          # Quest management tables
│   │   ├── adhd.ts            # ADHD support tables
│   │   ├── brain-dump.ts      # Brain dump tables
│   │   ├── reflections.ts     # Reflection system tables
│   │   ├── support.ts         # Supporting tables
│   │   └── enums.ts           # Shared enums
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
└── components/                # Shared React components
```

## 🔧 API Documentation

### Character Management
- `GET /api/character?id={id}` - Get character profile
- `POST /api/character` - Create new character
- `PUT /api/character` - Update character
- `POST /api/character/xp` - Add experience points
- `GET /api/character/resources` - Get character resources
- `PUT /api/character/resources` - Update character resource

### Quest System
- `GET /api/quests?characterId={id}` - Get character quests
- `POST /api/quests` - Create new quest
- `GET /api/quests/{id}` - Get specific quest
- `PUT /api/quests/{id}` - Update quest
- `POST /api/quests/{id}/complete` - Complete quest
- `DELETE /api/quests/{id}` - Delete quest

### ADHD Support
- `GET /api/adhd/basic-needs?characterId={id}` - Get basic needs status
- `POST /api/adhd/basic-needs` - Update basic need
- `GET /api/adhd/focus-sessions?characterId={id}` - Get focus sessions
- `POST /api/adhd/focus-sessions` - Start focus session
- `PUT /api/adhd/focus-sessions` - Complete focus session

### Brain Dump System
- `GET /api/brain-dump?characterId={id}` - Get brain dumps
- `POST /api/brain-dump` - Create brain dump
- `POST /api/brain-dump/{id}/process` - Process brain dump with AI

### Reflections
- `GET /api/reflections?characterId={id}` - Get reflections
- `POST /api/reflections` - Create new reflection

### Achievements
- `GET /api/achievements?characterId={id}` - Get achievements
- `POST /api/achievements/check` - Check for new achievements

## 🎯 Key Integrations

### Cross-System XP Flow
All activities across the Life RPG systems award experience points:
- **Quests**: 25-500 XP based on difficulty and type
- **Focus Sessions**: 15-50 XP based on duration and performance  
- **Reflections**: 50-200 XP based on type (daily/weekly/monthly)
- **Brain Dumps**: 25+ XP for processing and quest generation
- **Basic Needs**: 5-15 XP for maintaining self-care
- **Achievements**: Bonus XP for reaching milestones

### Resource Management
Character resources are dynamically updated based on activities:
- **Energy**: Consumed by quests and focus sessions, restored by rest and self-care
- **Focus**: Improved by focus sessions, affected by environment and habits
- **Motivation**: Boosted by quest completion and positive reflections
- **Spoons**: ADHD-specific energy tracking, regenerated daily

### Achievement Integration
Achievements unlock based on activities across all systems:
- **Streak Achievements**: Consistent daily habits and reflections
- **Milestone Achievements**: Total quests completed, levels reached
- **Performance Achievements**: Focus session mastery, reflection insights
- **Integration Achievements**: Using multiple systems effectively

## 🛡️ Security & Performance

### Security Features
- **Input Validation**: Comprehensive Zod schema validation on all API endpoints
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Environment Configuration**: Secure handling of sensitive configuration
- **Database Security**: Prepared statements and SQL injection protection

### Performance Optimizations
- **Database Optimization**: Connection pooling, query optimization, slow query logging
- **Caching Strategy**: API response caching and resource optimization
- **Code Splitting**: Lazy loading and bundle optimization
- **Error Boundaries**: Graceful error handling throughout the application

## 🎨 User Experience

### ADHD-Friendly Design
- **Gentle Interface**: Non-overwhelming colors and spacing
- **Clear Visual Hierarchy**: Easy-to-scan layouts and consistent patterns
- **Flexible Structure**: Accommodates different attention spans and energy levels
- **Positive Reinforcement**: Focus on achievements rather than failures

### RPG Theming
- **Character Progression**: Visual level indicators and XP progress bars
- **Achievement System**: Unlockable rewards and milestone celebrations
- **Resource Visualization**: RPG-style energy, focus, and motivation meters
- **Quest Interface**: Game-like quest board with completion rewards

## 🔮 Future Enhancements

- **Real Authentication**: Full Supabase auth integration with user accounts
- **Mobile App**: React Native companion app for on-the-go tracking
- **AI Enhancement**: Advanced AI insights and personalized recommendations
- **Social Features**: Share achievements and compete with friends
- **Habit Tracking**: Detailed habit formation and tracking systems
- **Calendar Integration**: Sync with external calendars and scheduling
- **Notification System**: Smart reminders and progress alerts
- **Data Export**: Export personal data and progress reports

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📧 Support

If you encounter any issues or have questions about Life RPG, please open an issue on GitHub or contact the development team.

---

**Transform your life into an epic adventure. Start your Life RPG journey today!** 🚀
