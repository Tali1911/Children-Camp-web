# Amuse Ke - Children's Nature Camp Platform

## About Amuse Ke

Amuse Ke is a comprehensive full-stack platform for a children's nature camp located in Kenya's beautiful Karura Forest. The platform serves as both a public-facing website for families to learn about and register for camp programs, and a robust internal management system with role-based portals for staff across multiple departments.

## Key Features

### Public-Facing Features
- **Interactive Landing Page**
  - Dynamic hero slider with content management
  - Real-time announcements system
  - Program highlights and seasonal camp offerings
  - Interactive yearly calendar
  - Parent testimonials and reviews
  - Team member profiles
  - Contact form with email integration

- **Program Registration System**
  - Multiple program types: Day Camps, Holiday Camps (Easter, Summer, Mid-Term, End Year)
  - Kenyan Experiences, Homeschooling, School Experience programs
  - Team Building and Birthday Party bookings
  - Online payment processing with QR code generation
  - Automated confirmation emails
  - Registration tracking and management

- **Content Management**
  - Dynamic "Who We Are" section with pillars
  - FAQ system with categorization
  - Gallery management with image optimization
  - Navigation settings control

### Administrative & Staff Portals
- **Marketing Portal**
  - Content management for all public pages
  - Lead and customer management
  - Email campaign management with Postmark integration
  - Email health dashboard and deliverability tracking
  - Campaign analytics and reporting
  - Navigation and SEO settings

- **CEO Dashboard**
  - Executive analytics and KPI tracking
  - Approval workflows
  - Strategic planning tools
  - Company-wide reports
  - System settings and configurations

- **HR Portal**
  - Employee management
  - Team recruitment section
  - Staff profiles and roles

- **Accounts Portal**
  - Invoice management
  - Financial tracking
  - Payment reconciliation

- **Governance Portal**
  - Policy management
  - Compliance framework
  - Risk management
  - Audit trails and logs
  - Document management
  - Data governance

- **Coach Portal**
  - Camp attendance tracking with QR scanner
  - Registration management
  - Activity planning and reporting

- **Admin Portal**
  - User management and approval system
  - Role-based access control
  - Camp and program registration management
  - Ground registration for walk-ins
  - Attendance marking system
  - System health monitoring
  - Data migration tools

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: 
  - Tailwind CSS with custom design system
  - Semantic color tokens (HSL-based)
  - Shadcn UI component library
  - Radix UI primitives
- **State Management**: 
  - TanStack React Query for server state
  - React Context for authentication
  - Local state with React hooks
- **Routing**: React Router DOM v6
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**:
  - Custom components built on Radix UI
  - Responsive design patterns
  - Accessible ARIA-compliant components
- **Utilities**:
  - date-fns for date handling
  - Recharts for data visualization
  - Sonner for toast notifications
  - Lucide React for icons
  - QR code generation (qrcode, html5-qrcode)
  - PDF generation (jspdf, html2canvas)
  - Rich text editing (Quill, React Quill)

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: 
  - Supabase Auth with JWT
  - Email/password authentication
  - Role-based access control with custom app_role enum
  - User approval system
- **Storage**: Supabase Storage for images and assets
- **Edge Functions**: 
  - Email webhook handling (Postmark integration)
  - Program confirmation emails
  - Marketing system automation
- **Real-time**: Supabase real-time subscriptions for live updates
- **Security**: 
  - Row Level Security policies on all tables
  - Custom security functions (has_role)
  - Audit logging system

### Key Integrations
- **Email**: Postmark for transactional emails and campaigns
- **Analytics**: Custom analytics dashboard with usage tracking
- **Payment Processing**: Integrated payment gateway (Stripe-ready)
- **SEO**: React Helmet Async for meta tags and SEO optimization

## Architecture
- **Frontend**: Single Page Application (SPA)
- **Backend**: Supabase (PostgreSQL + Edge Functions + Storage + Auth)
- **State Management**: Server-client synchronization with React Query
- **Security Model**: Role-based access control (RBAC) with RLS policies
- **Content Delivery**: Optimized asset delivery with lazy loading

## Development Approach
- Component-based architecture with TypeScript
- Mobile-first responsive design
- Accessibility-first UI components (WCAG compliant)
- Progressive enhancement patterns
- Comprehensive CMS for non-technical content management
- Real-time data synchronization
- Optimistic UI updates for better UX

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager
- Lovable Cloud enabled (automatically provisions Supabase backend)

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The app will be available at `http://localhost:8080`

### Database Setup

All database migrations are located in `public/supabase/migrations/` and include:
- Authentication system setup
- User roles and permissions
- Content management tables
- Program registration tables
- Marketing and CMS tables
- Email management system
- Calendar and events

Migrations are automatically applied when deploying or can be run manually through the Supabase dashboard.

### Deployment

This application is optimized for deployment on Lovable:
- **Frontend**: Automatically deployed via Lovable's publish feature
- **Backend**: Supabase with automatic scaling
- **Database**: PostgreSQL managed by Supabase
- **Edge Functions**: Automatically deployed with code changes


## File Structure Overview

- `/src` - Main source code directory
  - `/components` - React components
    - `/ui` - Shadcn UI components (Radix-based)
    - `/portals` - Role-based portal components (CEO, Marketing, HR, etc.)
    - `/admin` - Admin dashboard components
    - `/gallery` - Gallery management components
    - `/calendar` - Calendar and event components
    - `/team` - Team member components
    - `/announcements` - Announcement system
    - `/content` - CMS content components
    - `/forms` - Program registration forms
    - `/analytics` - Analytics dashboard
    - `/attendance` - QR scanner and attendance tracking
    - `/communication` - Messaging and email components
  - `/hooks` - Custom React hooks (useAuth, useContent, useSupabaseAuth, etc.)
  - `/lib` - Utility functions and helpers
  - `/pages` - Main page components
    - `/about` - About section pages (Team, Who We Are, What We Do)
    - `/camps` - Camp program pages
    - `/experiences` - Experience program pages
    - `/group-activities` - Team building and parties
    - `/programs` - Program detail pages
  - `/services` - API service layer for Supabase integration
  - `/types` - TypeScript type definitions
  - `/integrations` - Third-party integrations (Supabase client)
  - `/utils` - Utility functions and default configurations

- `/public/supabase/migrations` - Database migration files
- `/supabase/functions` - Edge functions for serverless backend logic
- `/server` - Legacy Express backend (deprecated, kept for reference)

## License

This project is proprietary and confidential.
