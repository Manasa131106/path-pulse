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
  let authUsers: any[] = []; // { email, password, userId }

  // Auth Routes
  app.post("/api/auth/signup", (req, res) => {
    const { email, password } = req.body;
    if (authUsers.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const userId = Math.random().toString(36).substring(7);
    authUsers.push({ email, password, userId });
    const newUser = { id: userId, email, is_new_user: true };
    users.push(newUser);
    res.json({ userId, is_new_user: true });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const authUser = authUsers.find(u => u.email === email && u.password === password);
    if (!authUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = users.find(u => u.id === authUser.userId);
    res.json({ userId: authUser.userId, is_new_user: user?.is_new_user });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = authUsers.find(u => u.email === email);
    if (user) {
      // Mock email verification
      res.json({ status: "success", message: "Verification email sent" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email, newPassword } = req.body;
    const user = authUsers.find(u => u.email === email);
    if (user) {
      user.password = newPassword;
      res.json({ status: "success" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // API Routes
  app.post("/api/profile/setup", (req, res) => {
    const { userId, ...profile } = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    const updatedUser = { ...users[userIndex], ...profile, is_new_user: false };
    users[userIndex] = updatedUser;
    
    // Generate tasks based on education level
    const edu = profile.educationLevel;
    const generatedTasks = [
      { id: Date.now() + 1, userId, text: `Research ${edu} career roadmaps`, completed: false, type: 'daily', category: 'Career' },
      { id: Date.now() + 2, userId, text: "Set up a study environment", completed: false, type: 'daily', category: 'Skill' },
      { id: Date.now() + 3, userId, text: "Read one article about your interest", completed: false, type: 'weekly', category: 'Interest' }
    ];
    
    if (edu === 'B.Tech') {
      generatedTasks.push({ id: Date.now() + 4, userId, text: "Learn SQL basics", completed: false, type: 'daily', category: 'Skill' });
    } else if (edu === 'Inter') {
      generatedTasks.push({ id: Date.now() + 5, userId, text: "Practice 10 problems", completed: false, type: 'daily', category: 'Skill' });
    }

    tasks.push(...generatedTasks);
    res.json(updatedUser);
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
    
    // Avatar parts logic: unlock every 2 tasks
    const partsCount = Math.floor(completedTasks / 2);
    const allParts = ["Base", "Hair", "Eyes", "Outfit", "Accessory"];
    const avatarParts = allParts.slice(0, Math.min(partsCount + 1, allParts.length));

    res.json({
      user,
      tasks: userTasks,
      progress,
      streak: 1,
      achievements: partsCount,
      avatarParts
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
