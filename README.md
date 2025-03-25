# F1 Fantasy Betting App

A web application for betting on Formula 1 race results and competing with friends.

## Features

- User authentication with password protection
- Admin panel for race management
- Bet on race finishing orders
- View live leaderboards
- Invite friends to private betting groups

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: SQLite (via Drizzle ORM)
- **Authentication**: NextAuth.js

## Local Development

1. Clone the repository
2. Install dependencies
   ```bash
   bun install
   ```
3. Start the development server
   ```bash
   bun run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Prerequisites

- A [Vercel](https://vercel.com) account
- Git repository with your F1 Fantasy App code

### Steps to Deploy

1. **Push your code to a Git repository**
   If you haven't already, push your code to GitHub, GitLab, or Bitbucket.

2. **Connect to Vercel**
   - Log in to your Vercel account
   - Click "New Project"
   - Import your Git repository
   - Select the repository with your F1 Fantasy App

3. **Configure Environment Variables**
   Add the following environment variables in the Vercel project settings:

   - `NEXTAUTH_SECRET`: A random string for NextAuth.js (use a generator to create a secure value)
   - `NEXTAUTH_URL`: Your deployment URL (e.g., `https://your-project.vercel.app`)

4. **Deploy**
   Click the "Deploy" button. Vercel will automatically:
   - Install dependencies
   - Run the database initialization script
   - Build the application
   - Deploy to a production environment

5. **Verify Deployment**
   Once deployment is complete, Vercel will provide a URL for your application. Visit the URL to ensure everything is working correctly.

### Notes About Vercel Deployment

- The application uses an in-memory database in the Vercel environment
- This means data will reset between deployments and serverless function invocations
- For a production app, consider using a persistent database like PostgreSQL or MongoDB

## Default Accounts

The application comes with pre-seeded accounts for testing:

- **Admin Account**:
  - Email: `admin@example.com`
  - Password: `Admin123!`

- **Regular User**:
  - Email: `user@example.com`
  - Password: `Testing123!`

## License

MIT
