# ARCHON-7: Adaptive Masterclass Generator

ARCHON-7 is an advanced, AI-driven educational platform that generates personalized, interactive masterclasses. It dynamically adjusts to the user's learning level and domains, delivering a highly aesthetic, distraction-free "notebook" learning environment.

## 🚀 Features

- **Dynamic Curriculum Generation**: Uses Anthropic's Claude to generate a structured progression from foundational theory to hands-on mastery.
- **Notebook Aesthetic**: A beautiful, distraction-free handwritten notebook UI using standard Markdown rendering.
- **Visual Synthesis**: Automatically generates and renders dynamic Mermaid flowcharts and system diagrams to break down complex topics.
- **Adaptive Interrogation**: Injects interactive quizzes into the curriculum and adjusts the complexity of future modules based on user performance.
- **Capstone Project**: Every masterclass culminates in a practical, hands-on architectural project.
- **Authentication & Persistence**: Secure user login via Supabase Auth, with robust `localStorage` state persistence.
- **Rate Limiting**: Integrated Upstash Redis to ensure users are limited to free trials/generations (1 per IP), with a paywall modal.

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, TypeScript, Vite, Motion (Animations)
- **Backend / AI**: Node.js, Express, Anthropic API (Claude)
- **Database & Auth**: Supabase Auth, Upstash Redis
- **Markdown & Diagramming**: Marked, Mermaid.js
- **Deployment**: Vercel (Serverless Functions)

## 💻 Local Development

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd ARCHON_7
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with the following keys:
   ```env
   # Frontend (Supabase Auth)
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key

   # Backend (AI & Redis)
   ANTHROPIC_API_KEY=your_anthropic_api_key
   UPSTASH_REDIS_REST_URL=https://<your-redis>.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   PORT=3456
   ```

3. **Run the Application**
   For local development, the backend runs as a standard Node/Express server, while Vite proxies frontend API requests to it.
   
   *Start the Backend API:*
   ```bash
   node api/index.js
   ```
   *Start the Frontend:*
   ```bash
   npm run dev
   ```

## 🌐 Vercel Deployment

ARCHON-7 is configured natively for Vercel.

1. Push your code to GitHub.
2. Go to your [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. **Important**: Under **Environment Variables**, paste ALL the keys from your `.env` file (both `VITE_` and backend keys).
5. Click **Deploy**. Vercel will automatically host the Vite frontend and build the `api/index.js` as a Serverless Function!
