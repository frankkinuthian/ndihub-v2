# NDIHub - Learning Management Platform

A comprehensive Learning Management System with integrated MasterClass functionality, built with Next.js 15, Sanity CMS, Clerk authentication, and multi-provider payment processing. Features real-time content updates, course progress tracking, live session management, and professional admin interface.

## Features

### For Students

- Access to comprehensive course content
- Real-time progress tracking
- Lesson completion system
- Module-based learning paths
- Multiple video player integrations (YouTube, Vimeo, Loom)
- Secure course purchases
- Mobile-friendly learning experience
- Course progress synchronization
- Live MasterClass enrollment and participation
- Automatic calendar invites for sessions
- Multi-payment method support (M-Pesa, Credit Cards)

### For Instructors

- Rich content management with Sanity CMS
- Student progress monitoring
- Course analytics
- Customizable course structure
- Multiple video hosting options
- Real-time content updates
- Mobile-optimized content delivery
- Google Calendar integration for MasterClasses
- Automated session management
- Revenue tracking and analytics

### For Administrators

- Professional admin interface via Sanity Studio
- Real-time analytics and performance monitoring
- MasterClass pricing and configuration management
- System health monitoring with alerts
- Payment method distribution tracking
- Revenue analytics by month and session
- Webhook performance monitoring
- User enrollment management

### Technical Features

- Server Components & Server Actions
- Authentication with Clerk (modal-based sign-in)
- Multi-provider payment processing (IntaSend M-Pesa, Stripe)
- Content management with Sanity CMS
- Google Calendar API integration
- Modern UI with Tailwind CSS and shadcn/ui
- Responsive design
- Real-time content updates
- Protected routes and content
- Dark mode support
- Webhook processing for payment confirmation
- Email automation for session invites
- Performance monitoring and analytics

### UI/UX Features

- Modern, clean interface
- Consistent design system using shadcn/ui
- Accessible components
- Smooth transitions and animations
- Responsive across all devices
- Loading states with skeleton loaders
- Micro-interactions for better engagement
- Dark/Light mode toggle

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Stripe Account
- IntaSend Account (for M-Pesa payments)
- Clerk Account
- Sanity Account
- Google Cloud Project (for Calendar API)
- Google Calendar

### Environment Variables

Create a `.env.local` file with:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
# Read Token
SANITY_API_TOKEN=your-sanity-read-token
# Full Access Admin Token
SANITY_API_ADMIN_TOKEN=your-sanity-admin-token

# For Sanity Studio to read
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# IntaSend (M-Pesa Payments)
INSTASEND_API_KEY=your-intasend-api-key
INSTASEND_PUBLISHABLE_KEY=your-intasend-publishable-key
INSTASEND_WEBHOOK_SECRET=your-intasend-webhook-secret

# Google Calendar API
GOOGLE_PROJECT_ID=your-google-project-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Installation

```bash
# Clone the repository
git clone https://github.com/frankkinuthian/ndihub-v2

# Install dependencies
pnpm install

# Start the development server
pnpm dev

# In a separate terminal, start Sanity Studio
pnpm sanity:dev

# Access Sanity Studio admin interface
# Visit: http://localhost:3000/studio
```

### Setting up Sanity CMS

1. Create a Sanity account
2. Create a new project
3. Install the Sanity CLI:
   ```bash
   npm install -g @sanity/cli
   ```
4. Initialize Sanity in your project:
   ```bash
   sanity init
   ```
5. Deploy Sanity Studio:
   ```bash
   sanity deploy
   ```

### Setting up Clerk

1. Create a Clerk application
2. Configure authentication providers
3. Set up redirect URLs
4. Add environment variables

### Setting up Payment Providers

#### Stripe (Credit Card Payments)

1. Create a Stripe account
2. Set up webhook endpoints: `/api/stripe/webhook`
3. Configure payment settings
4. Set up webhook forwarding for local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

#### IntaSend (M-Pesa Payments)

1. Create an IntaSend account
2. Get API credentials from dashboard
3. Configure webhook URL: `/api/intasend/webhook`
4. For local development, use ngrok:
   ```bash
   ngrok http 3000
   # Use the https URL for webhook configuration
   ```

### Setting up Google Calendar Integration

1. Create a Google Cloud Project
2. Enable Google Calendar API
3. Create a service account
4. Download service account key (JSON)
5. Share your Google Calendar with the service account email
6. Grant "Make changes to events" permission
7. Extract credentials for environment variables

## Architecture

### Content Schema

#### Core Learning Content

- **Courses**: Title, Description, Price, Image, Modules, Instructor, Category
- **Modules**: Title, Lessons, Order
- **Lessons**: Title, Description, Video URL, Content (Rich Text), Completion Status

#### User Management

- **Students**: Profile Information, Enrolled Courses, Progress Data
- **Instructors**: Name, Bio, Photo, Courses

#### MasterClass System

- **MasterClass Enrollments**: Student, Session, Payment Details, Status
- **MasterClass Analytics**: Revenue tracking, Enrollment metrics, Performance data
- **MasterClass Settings**: System configuration, Pricing defaults, Email templates

#### Administrative

- **Performance Monitoring**: System health, Webhook performance, Payment analytics
- **Categories**: Course categorization and organization

### Key Components

#### Course Management System

- Content creation and organization
- Module and lesson structuring
- Rich text editing
- Media integration

#### MasterClass Management

- Google Calendar integration for session scheduling
- Real-time enrollment tracking
- Automated email invitations
- Multi-currency pricing support

#### Progress Tracking

- Lesson completion
- Course progress calculation
- Module progress visualization

#### Payment Processing

- Multi-provider support (IntaSend M-Pesa, Stripe)
- Secure checkout flows
- Webhook-based enrollment confirmation
- Real-time payment status updates

#### User Authentication

- Clerk authentication with modal sign-in
- Protected routes and content
- Role-based access control

#### Administrative Interface

- Sanity Studio-based admin panel
- Real-time analytics and monitoring
- System health tracking
- Performance metrics dashboard

## Usage

### Creating a Course

1. Access Sanity Studio at `/studio`
2. Create course structure with modules and lessons
3. Add content and media
4. Publish course

### Creating MasterClasses

1. Create events in Google Calendar with "MasterClass" in the title
2. Add pricing information in event description (Price: KES 2500, Premium)
3. Include instructor and participant limit details
4. Events automatically appear on the platform

### Student Experience

1. Browse available courses and MasterClasses
2. Purchase and enroll using M-Pesa or credit card
3. Receive automatic calendar invites for MasterClasses
4. Access course content and track progress
5. Mark lessons as complete
6. View completion certificates

### Administrative Tasks

1. Access admin interface at `/studio`
2. Monitor system performance and analytics
3. Track revenue and enrollment metrics
4. Manage MasterClass pricing and settings
5. View system health and webhook performance

## Development

### Key Files and Directories

```
/app                    # Next.js app directory
  /(dashboard)          # Dashboard routes
  /(user)              # User routes
  /api                 # API routes
/components            # React components
/sanity                # Sanity configuration
  /lib                 # Sanity utility functions
  /schemas             # Content schemas
/lib                   # Utility functions
```

### Core Technologies

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Sanity CMS
- **Authentication**: Clerk
- **Payments**: Stripe (Credit Cards), IntaSend (M-Pesa)
- **Calendar**: Google Calendar API
- **Email**: Nodemailer with SMTP
- **UI Components**: Radix UI, Lucide Icons
- **Development**: ESLint, TypeScript, Hot Reload

## Features in Detail

### Course Management

- Flexible course structure with modules and lessons
- Rich text editor for lesson content
- Support for multiple video providers
- Course pricing and enrollment management

### MasterClass System

- Google Calendar integration for session scheduling
- Real-time enrollment with payment confirmation
- Automated email invitations with calendar attachments
- Multi-currency pricing (KES for M-Pesa, USD/EUR for Stripe)
- Live session management and participant tracking

### Student Dashboard

- Progress tracking across all enrolled courses
- Lesson completion status
- Continue where you left off
- Course navigation with sidebar
- MasterClass enrollment history and upcoming sessions

### Payment System

- Multi-provider support (IntaSend M-Pesa, Stripe Credit Cards)
- Secure checkout flows with real-time confirmation
- Webhook-based enrollment processing
- Payment retry logic and error handling
- Revenue tracking and analytics

### Administrative Interface

- Professional Sanity Studio-based admin panel
- Real-time analytics dashboard
- System performance monitoring
- MasterClass pricing management
- User enrollment tracking
- Revenue analytics by month and session

### Authentication

- Clerk authentication with modal sign-in
- Protected course content and MasterClass access
- Role-based access control
- Secure session management

### Technical Infrastructure

- Webhook processing for payment confirmation
- Google Calendar API integration
- Email automation with SMTP
- Performance monitoring and alerting
- Error handling and graceful degradation

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Testing and Development

### Available Test Commands

```bash
# Test Google Calendar integration
pnpm test:calendar-setup

# Test enrollment functionality
pnpm test:enrollment-debug

# Test webhook processing
pnpm test:webhook-debug

# Test MasterClass title fetching
pnpm test:event-titles

# Test admin permissions
pnpm test:admin-permissions

# Test analytics generation
pnpm test:analytics
```

### Local Development Setup

1. Install dependencies: `pnpm install`
2. Configure environment variables in `.env.local`
3. Set up ngrok for webhook testing: `ngrok http 3000`
4. Configure payment provider webhooks with ngrok URL
5. Start development server: `pnpm dev`
6. Access admin interface: `http://localhost:3000/studio`

---

Built with Next.js 15, Sanity CMS, Clerk Authentication, IntaSend, Stripe, and Google Calendar API
