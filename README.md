Twell Ai - AI-Powered Career Development
Unlock Your Career Potential with Intelligent AI Guidance
Twell Ai is an innovative career development platform designed to help you navigate your professional journey with the power of artificial intelligence. By combining advanced AI tools with up-to-date industry insights, Twell Ai provides personalized guidance to optimize your resume, craft compelling cover letters, and master your interview skills, all tailored to your unique background and career aspirations.

✨ Features
Intelligent Resume Builder: Generate professional, industry-specific resumes that highlight your strengths and align with current job market demands.

Dynamic Cover Letter Generator: Create personalized cover letters that resonate with hiring managers, adapting to specific job descriptions and your professional story.

Adaptive Interview Preparation: Practice with AI-generated interview questions, receive real-time feedback, and track your progress to enhance your performance.

Weekly Industry Insights: Stay ahead with regularly updated data on salary trends, in-demand skills, and industry growth patterns, powered by advanced AI analysis.

Customizable Content: Full control to edit and refine all AI-generated content using a user-friendly markdown editor.

Secure & Private: Your professional information is encrypted and securely stored, with robust authentication powered by Clerk.

🚀 How It Works
Twell Ai learns about your industry, experience, and skills during a simple onboarding process. This information is then leveraged by our AI models to:

Personalize Content: Generate resumes, cover letters, and interview questions that are specifically aligned with your professional background and industry standards.

Provide Actionable Insights: Analyze current market trends to offer relevant data and suggestions for your career decisions.

Track Progress: Monitor your performance during interview practice, providing detailed analytics and AI-generated tips for improvement.

🛠️ Technologies Used
Next.js: A React framework for production-grade applications.

Clerk: For secure and seamless user authentication.

Prisma: A next-generation ORM for Node.js and TypeScript, used for database interaction.

Tailwind CSS: A utility-first CSS framework for rapid and responsive UI development.

Gemini API: Powers the intelligent AI insights and content generation.

PostgreSQL (or compatible DB): For data storage.

📦 Getting Started
Follow these steps to get a local copy of the project up and running on your machine.

Prerequisites
Node.js (v18 or higher recommended)

npm or Yarn

A PostgreSQL database (or other database supported by Prisma)

Clerk account and API keys

Google Cloud Project with Gemini API enabled and API key

Installation
Clone the repository:

git clone https://github.com/your-username/twell-ai.git
cd twell-ai

Install dependencies:

npm install
# or
yarn install

Set up environment variables:
Create a .env.local file in the root of your project and add the following:

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
WEBHOOK_SECRET=your_clerk_webhook_secret # If using Clerk webhooks

# Database (Prisma)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Gemini API (for AI insights)
GEMINI_API_KEY=your_gemini_api_key

Replace the placeholder values with your actual keys and database connection string.

Initialize Prisma and migrate your database:

npx prisma migrate dev --name init

This will create your database schema based on your schema.prisma file.

Run the development server:

npm run dev
# or
yarn dev

Open http://localhost:3000 in your browser to see the application.

🤝 Contributing
We welcome contributions! If you'd like to contribute, please follow these steps:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature-name).

Make your changes.

Commit your changes (git commit -m 'feat: Add new feature').

Push to the branch (git push origin feature/your-feature-name).

Open a Pull Request.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details. (If you have a https://www.google.com/search?q=LICENSE file, otherwise omit this section or add one).

### Make sure to create a `.env` file with following variables -

```
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=
```
