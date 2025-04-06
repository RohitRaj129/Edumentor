# 🤖 AI Voice Agent

AI Voice Agent is a modern web application built with the latest web technologies, integrating seamless frontend and backend functionality. It uses **Next.js 15**, **Tailwind CSS**, **Convex** for backend, **Stack Auth** for authentication, and **Docker** for running backend services.

> ⚠️ **Note**: AI functionality is not yet integrated — it's reserved for future updates.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) + [Tailwind CSS (latest)](https://tailwindcss.com/)
- **Authentication**: [Stack Auth](https://www.stack-auth.dev/)
- **Backend**: [Convex (Self-Hosted)](https://docs.convex.dev/)
- **Containerization**: Docker
- **AI**: _Coming Soon..._ 🤖

---

## ⚙️ How to Run Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2️⃣ Install Dependencies

```bash
npm install
```

3️⃣ Create .env.local File

Create a .env.local file in the root of the project and add the following values:

```env
NEXT_PUBLIC_STACK_PROJECT_ID='your-stack-project-id'
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY='your-publishable-client-key'
STACK_SECRET_SERVER_KEY='your-stack-secret-server-key'

# Deployment used by `npx convex dev`
# CONVEX_DEPLOYMENT=dev:jovial-iguana-119

# Self-hosted Convex configuration
CONVEX_SELF_HOSTED_URL='http://localhost:3210'
CONVEX_SELF_HOSTED_ADMIN_KEY='your-convex-admin-key'

NEXT_PUBLIC_CONVEX_URL='http://localhost:3210'
```

🔐 To generate the Convex Admin Key, run:

```bash
docker compose exec backend ./generate_admin_key.sh
```

---

🧪 Development Workflow

You’ll need 3 terminals open to run everything smoothly:

➤ Terminal 1: Start the frontend

```bash
npm run dev
```

➤ Terminal 2: Pull and Start the Backend with Docker

> start docker first then run this command.

```bash
docker compose pull
docker compose up
```

➤ Terminal 3: Run Convex Dev Server

```bash
npx convex dev
```

Now visit http://localhost:3000 to see it live! 🎉

---

📦 Project Status
• ✅ Basic Project Structure
• ✅ Auth with Stack
• ✅ Convex Backend Setup
• ❌ AI Agent Integration (Coming Soon)

---

📁 Deployment

🚧 Coming soon…

---

🙏 Credits

Made with ❤️ by Rohit Raj
GitHub: @RohitRaj129

---
