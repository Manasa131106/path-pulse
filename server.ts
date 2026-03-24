import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 NEW DECISION ENGINE (REPLACE OLD ONE)
function decisionEngine({ tasks, pulseHistory, streak }: any) {
  const lastMoods = pulseHistory.slice(-5);

  const highStressCount = lastMoods.filter((p: any) => p.stress === "High").length;
  const lowMoodCount = lastMoods.filter((p: any) => p.mood === "Low").length;

  const completedTasks = tasks.filter((t: any) => t.completed).length;
  const completionRate = tasks.length > 0 ? completedTasks / tasks.length : 0;

  let status = "Normal";
  let action = "Maintain";
  let reason = "You're doing fine.";

  // 🚨 Burnout
  if (highStressCount >= 3 && completionRate < 0.4) {
    status = "Burnout";
    action = "Reduce workload";
    reason = "High stress and low productivity detected.";
  }

  // 🚀 Growth
  else if (completionRate > 0.8 && streak >= 3) {
    status = "Growth";
    action = "Increase difficulty";
    reason = "Strong consistency and performance.";
  }

  // ⚠️ Warning
  else if (completionRate < 0.5) {
    status = "Warning";
    action = "Stabilize routine";
    reason = "Inconsistent task completion.";
  }

  return { status, action, reason, completionRate };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let users: any[] = [];
  let tasks: any[] = [];
  let pulseData: any[] = [];
  let authUsers: any[] = [];

  // AUTH
  app.post("/api/auth/signup", (req, res) => {
    const { email, password } = req.body;
    if (authUsers.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const userId = Math.random().toString(36).substring(7);
    authUsers.push({ email, password, userId });
    users.push({ id: userId, email, is_new_user: true });
    res.json({ userId, is_new_user: true });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = authUsers.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const profile = users.find(u => u.id === user.userId);
    res.json({ userId: user.userId, is_new_user: profile?.is_new_user });
  });

  // PROFILE SETUP
  app.post("/api/profile/setup", (req, res) => {
    const { userId, aiTasks, aiRoadmap, ...profile } = req.body;

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    users[userIndex] = {
      ...users[userIndex],
      ...profile,
      is_new_user: false
    };

    const generatedTasks = (aiTasks || []).map((t: any, i: number) => ({
      ...t,
      id: Date.now() + i,
      userId,
      completed: false,
      priority: i + 1
    }));

    tasks.push(...generatedTasks);
    res.json(users[userIndex]);
  });

  // TASKS
  app.get("/api/tasks", (req, res) => {
    const userId = req.query.userId;
    const userTasks = tasks.filter(t => t.userId === userId);
    res.json(userTasks);
  });

  app.put("/api/tasks/:id", (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.completed = !task.completed;
    res.json(task);
  });

  // PULSE
  app.post("/api/pulse", (req, res) => {
    const { userId, ...pulse } = req.body;
    const entry = { ...pulse, userId, timestamp: new Date().toISOString() };
    pulseData.push(entry);
    res.json(entry);
  });

  // 🔥 MAIN DASHBOARD (UPDATED)
  app.get("/api/dashboard-data", (req, res) => {
    const userId = req.query.userId;

    const userTasks = tasks.filter(t => t.userId === userId);
    const userPulses = pulseData.filter(p => p.userId === userId);

    const completedTasks = userTasks.filter(t => t.completed).length;
    const progress = userTasks.length > 0
      ? Math.round((completedTasks / userTasks.length) * 100)
      : 0;

    // STREAK CALCULATION
    let streak = 0;
    const sorted = userPulses.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (sorted.length > 0) {
      streak = 1;
      let last = new Date(sorted[0].timestamp);
      last.setHours(0, 0, 0, 0);

      for (let i = 1; i < sorted.length; i++) {
        const curr = new Date(sorted[i].timestamp);
        curr.setHours(0, 0, 0, 0);

        const diff = Math.abs(last.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
          last = curr;
        } else break;
      }
    }

    // 🔥 CALL NEW ENGINE HERE
    const decision = decisionEngine({
      tasks: userTasks,
      pulseHistory: userPulses,
      streak
    });

    res.json({
      tasks: userTasks,
      progress,
      streak,
      decision,
      aiInsights: {
        summary: decision.reason,
        nextMove: decision.action
      }
    });
  });

  // VITE
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