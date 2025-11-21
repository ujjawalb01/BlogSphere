# MERN Blog — Updated (fixed Tailwind dependency + UI refresh)

What's fixed:
- Removed invalid @tailwindcss/vite dependency (it doesn't exist on npm).
- Correct Tailwind setup using tailwindcss + postcss + autoprefixer.
- UI refreshed: dark-violet aesthetic, glass cards, improved forms and layout.

How to install (frontend):
1. cd frontend
2. npm install
3. npx tailwindcss init -p
4. Start dev: npm run dev

If you still see errors, delete node_modules and package-lock.json and run npm install again.

Backend:
1. cd backend
2. npm install
3. create .env from .env.example (set MONGODB_URI and JWT_SECRET)
4. npm run dev

Notes:
- If you attempted to install non-existent packages previously, npm may cache a failed state; remove package-lock.json and node_modules then retry.
