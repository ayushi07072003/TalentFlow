# TalentFlow - Mini Hiring Platform

A modern, full-featured HR dashboard built with React, TypeScript, and cutting-edge web technologies. TalentFlow simulates a complete hiring platform with job management, candidate tracking, and assessment creation capabilities.

## 🚀 Features

### Core Functionality
- **Authentication System**: Simple login flow with persistent sessions
- **Jobs Management**: Create, edit, archive, and reorder job postings with drag-and-drop
- **Candidate Management**: Virtualized list view and Kanban board for 1000+ candidates
- **Assessment Builder**: Dynamic form builder with conditional logic and live preview
- **Real-time Updates**: Optimistic UI updates with error rollback

### Technical Highlights
- **Mock Backend**: MSW (Mock Service Worker) for realistic API simulation
- **Local Persistence**: IndexedDB via Dexie.js for data storage
- **Performance**: React Virtual for handling large candidate lists
- **Drag & Drop**: dnd-kit for intuitive job reordering and candidate stage management
- **Form Management**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state and caching

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Database**: Dexie.js (IndexedDB wrapper)
- **API Mocking**: MSW (Mock Service Worker)
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: dnd-kit
- **Virtualization**: @tanstack/react-virtual
- **Routing**: React Router v6
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` (or the next available port)

### 🔐 Login Credentials

**HR Team Access:**
- **Email**: `admin@talentflow.io`
- **Password**: `password123`

### 🚀 Deployment

The application is configured for multiple deployment platforms:

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### GitHub Pages
```bash
git push origin main
# GitHub Actions will automatically deploy
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn/ui components
│   └── shared/                # App layout, protected routes
├── context/
│   └── AuthContext.tsx       # Authentication state management
├── features/
│   ├── auth/                 # Login functionality
│   ├── jobs/                 # Job management features
│   ├── candidates/           # Candidate management
│   └── assessments/          # Assessment builder
├── lib/
│   ├── db.ts                 # Dexie database schema
│   ├── queryClient.ts       # React Query configuration
│   └── seed.ts              # Database seeding with faker.js
├── mocks/
│   ├── browser.ts           # MSW browser setup
│   └── handlers.ts          # API request handlers
└── routes/
    └── AppRouter.tsx        # Application routing
```

## 🏗️ Architecture

### MSW + Dexie + React Query Pattern

This application uses a unique architecture that simulates a real backend:

1. **MSW (Mock Service Worker)**: Intercepts API calls and routes them to handlers
2. **Dexie.js**: Provides IndexedDB persistence layer
3. **React Query**: Manages server state, caching, and optimistic updates

```typescript
// Example: Jobs API Handler
http.get('/api/jobs', async ({ request }) => {
  await delay(); // Simulate network latency
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  
  // Query Dexie database
  const jobs = await db.jobs
    .orderBy('orderIndex')
    .offset((page - 1) * 10)
    .limit(10)
    .toArray();
    
  return HttpResponse.json({ jobs, pagination: {...} });
})
```

### Key Technical Decisions

**Why dnd-kit?**
- Superior accessibility support
- Better performance than react-beautiful-dnd
- More flexible API for complex drag scenarios

**Why @tanstack/react-virtual?**
- Handles 1000+ candidates efficiently
- Smooth scrolling performance
- Minimal memory footprint

**Why MSW + Dexie?**
- Realistic API simulation with persistence
- No backend required for development
- Easy to migrate to real APIs later

## 🎯 Core Features

### 1. Jobs Management
- **Drag & Drop Reordering**: Jobs can be reordered with optimistic updates
- **Advanced Filtering**: Search by title, filter by status, multi-tag selection
- **CRUD Operations**: Create, edit, archive jobs with validation
- **Error Handling**: Rollback on failed reorder operations

### 2. Candidate Management
- **Virtualized List**: Handles 1000+ candidates with smooth performance
- **Kanban Board**: Drag candidates between stages (Applied → Screen → Tech → Offer → Hired/Rejected)
- **Timeline Tracking**: Automatic stage change logging and manual notes
- **Real-time Updates**: Optimistic UI with error rollback

### 3. Assessment Builder
- **Dynamic Forms**: Create assessments with multiple question types
- **Conditional Logic**: Show/hide questions based on previous answers
- **Live Preview**: Real-time form preview as you build
- **Question Types**: Single choice, multi-choice, text, numeric, file upload
- **Assessment Submission**: Complete assessment flow with candidate tracking

### 4. Advanced Features
- **@Mentions**: Rich text notes with team member mentions
- **Keyboard Shortcuts**: Power user shortcuts (Ctrl+N, Ctrl+K, etc.)
- **Deep Linking**: Direct links to jobs and candidates
- **Server-like Pagination**: Efficient handling of large datasets
- **Advanced Sorting**: Multiple sort options for jobs and candidates

### 5. Authentication
- **Persistent Sessions**: Login state survives page refreshes
- **Protected Routes**: Automatic redirect to login when not authenticated
- **Simple Auth**: No complex OAuth, just email/password for demo

## 🔧 Development

### Database Seeding
The application automatically seeds the database with:
- 25 jobs (mixed active/archived status)
- 1000+ candidates with realistic data
- Sample assessments
- Timeline entries for candidate progression

### API Simulation
- **Network Latency**: 200ms-1200ms random delays
- **Error Rates**: 5-10% failure rate on mutations
- **Realistic Responses**: Proper HTTP status codes and error messages

### Performance Optimizations
- **React Virtual**: Only renders visible candidates
- **Query Caching**: TanStack Query prevents unnecessary API calls
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Code Splitting**: Route-based lazy loading

## 🧪 Testing the Application

### 1. Login
- Use the provided credentials to access the dashboard
- Session persists across browser refreshes

### 2. Jobs Management
- Create new jobs with custom titles and tags
- Drag jobs to reorder them (watch for optimistic updates)
- Filter by status and tags
- Archive/unarchive jobs

### 3. Candidate Management
- Browse the virtualized list of 1000+ candidates
- Switch to Kanban board view
- Drag candidates between stages
- View individual candidate profiles with timeline

### 4. Assessment Builder
- Navigate to a job's assessment page
- Create dynamic forms with different question types
- Test conditional logic between questions
- Preview the form as candidates would see it

## 🚀 Production Considerations

### Migration to Real Backend
The MSW handlers can be easily replaced with real API calls:

```typescript
// Replace MSW handlers with real API calls
const { data } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => fetch('/api/jobs').then(res => res.json())
});
```

### Database Migration
Dexie schema can be exported and migrated to any SQL database:

```typescript
// Export data for migration
const jobs = await db.jobs.toArray();
const candidates = await db.candidates.toArray();
// Send to backend API
```

### Performance Monitoring
- Add React Query DevTools for debugging
- Monitor virtual list performance with large datasets
- Implement proper error boundaries

## 📝 License

This project is created for demonstration purposes. Feel free to use it as a starting point for your own applications.

## 🤝 Contributing

This is a demo project, but suggestions and improvements are welcome!

---

**Built with ❤️ using modern React patterns and best practices.**
