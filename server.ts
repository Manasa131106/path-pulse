import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database in memory for the session
  let users: any[] = [];
  let tasks: any[] = [];
  let pulseData: any[] = [];

  // API Routes
  app.post("/api/profile/setup", (req, res) => {
    const profile = req.body;
    const userId = Math.random().toString(36).substring(7);
    const newUser = { ...profile, id: userId, is_new_user: false };
    users.push(newUser);
    
    // Initial task generation
    const initialTasks = [
      { id: 1, userId, text: "Explore career paths in " + profile.educationLevel, completed: false },
      { id: 2, userId, text: "Set a weekly study goal", completed: false },
      { id: 3, userId, text: "Take a 5-minute mindfulness break", completed: false }
    ];
    tasks.push(...initialTasks);

    res.json(newUser);
  });

  app.get("/api/profile/:id", (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    res.json(user || null);
  });

  app.get("/api/tasks", (req, res) => {
    const userId = req.query.userId;
    const userTasks = tasks.filter(t => t.userId === userId);
    res.json(userTasks);
  });

  app.put("/api/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.post("/api/pulse", (req, res) => {
    const data = req.body;
    pulseData.push(data);
    res.json({ status: "success" });
  });

  app.get("/api/pulse/:userId", (req, res) => {
    const userPulse = pulseData.filter(p => p.userId === req.params.userId);
    res.json(userPulse[userPulse.length - 1] || { mood: "Neutral", stress: "Medium", motivation: "Medium" });
  });

  app.get("/api/dashboard-data", (req, res) => {
    const userId = req.query.userId;
    const user = users.find(u => u.id === userId);
    const userTasks = tasks.filter(t => t.userId === userId);
    const completedTasks = userTasks.filter(t => t.completed).length;
    const progress = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;
    
    res.json({
      user,
      tasks: userTasks,
      progress,
      streak: 1, // Mock streak
      achievements: Math.floor(completedTasks / 2) // Mock achievement logic
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
