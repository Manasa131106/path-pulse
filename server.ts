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
    const { userId, aiTasks, aiRoadmap, ...profile } = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    const updatedUser = { 
      ...users[userIndex], 
      ...profile, 
      is_new_user: false,
      skillGaps: aiRoadmap?.skillGaps || [],
      roadmap: {
        title: aiRoadmap?.roadmapTitle || "Your Journey",
        steps: (aiRoadmap?.roadmapSteps || []).map((step: any, i: number) => ({
          ...step,
          status: i === 0 ? 'current' : 'locked'
        }))
      }
    };
    users[userIndex] = updatedUser;

    const generatedTasks = (aiTasks || []).map((t: any, i: number) => ({
      ...t,
      id: Date.now() + i,
      userId,
      completed: false
    }));

    tasks.push(...generatedTasks);
    res.json(updatedUser);
  });

  app.get("/api/profile/:id", (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    res.json(user || null);
  });

  app.get("/api/tasks", (req, res) => {
    const userId = req.query.userId;
    const user = users.find(u => u.id === userId);
    let userTasks = tasks.filter(t => t.userId === userId);
    
    if (user?.strictMode) {
      const firstUncompleted = userTasks.find(t => !t.completed);
      if (firstUncompleted) {
        // In strict mode, only show the current active task
        userTasks = [firstUncompleted];
      } else {
        // All tasks completed
        userTasks = [];
      }
    }
    
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
    const { userId, aiFeedback, ...pulse } = req.body;
    
    const response = { ...pulse, userId, timestamp: new Date().toISOString(), aiFeedback };
    pulseData.push(response);

    // Update user burnout status
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1 && aiFeedback) {
      users[userIndex].burnoutStatus = {
        level: aiFeedback.burnoutRisk > 70 ? 'High' : aiFeedback.burnoutRisk > 40 ? 'Moderate' : 'Low',
        warning: aiFeedback.status === 'Burnout' ? "High risk of burnout detected." : aiFeedback.status === 'Warning' ? "Moderately high stress levels." : "Healthy state.",
        recommendation: aiFeedback.suggestion
      };
    }
    
    res.json(response);
  });

  app.get("/api/pulse/:userId", (req, res) => {
    const userPulse = pulseData.filter(p => p.userId === req.params.userId);
    res.json(userPulse[userPulse.length - 1] || { mood: "Neutral", stress: "Medium", motivation: "Medium" });
  });

  app.get("/api/dashboard-data", (req, res) => {
    const userId = req.query.userId;
    const user = users.find(u => u.id === userId);
    let userTasks = tasks.filter(t => t.userId === userId);
    const completedTasks = userTasks.filter(t => t.completed).length;
    const progress = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;
    
    // Strict Mode: Filter tasks for dashboard display
    const displayTasks = user?.strictMode 
      ? (userTasks.find(t => !t.completed) ? [userTasks.find(t => !t.completed)!] : [])
      : userTasks;

    // Calculate streak based on pulse check-ins
    const userPulses = pulseData
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    let streak = 0;
    if (userPulses.length > 0) {
      streak = 1;
      let lastDate = new Date(userPulses[0].timestamp);
      lastDate.setHours(0, 0, 0, 0);
      
      for (let i = 1; i < userPulses.length; i++) {
        const currentDate = new Date(userPulses[i].timestamp);
        currentDate.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(lastDate.getTime() - currentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
          lastDate = currentDate;
        } else if (diffDays > 1) {
          break;
        }
      }
    }

    // Priority task: First uncompleted task
    const priorityTask = userTasks.find(t => !t.completed);
    
    const partsCount = Math.floor(completedTasks / 2);
    const allParts = ["Base", "Hair", "Eyes", "Outfit", "Accessory"];
    const avatarParts = allParts.slice(0, Math.min(partsCount + 1, allParts.length));

    res.json({
      user,
      tasks: displayTasks,
      progress,
      streak,
      burnoutStatus: user?.burnoutStatus || { level: 'Low', warning: "Healthy state.", recommendation: "Keep it up!" },
      recommendedAction: user?.burnoutStatus?.level === 'High' ? 'reduce tasks' : progress > 80 ? 'increase difficulty' : 'maintain',
      priorityTask,
      achievements: partsCount,
      avatarParts,
      aiInsights: {
        summary: "You're doing great!",
        nextBigMove: "Complete your next task.",
        recommendedAction: 'maintain'
      }
    });
  });

  app.get("/api/insights", (req, res) => {
    const userId = req.query.userId as string;
    
    // Get mood history (last 7 days)
    const userPulses = pulseData
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-7);
    
    res.json({
      weeklyProgress: [
        { day: 'Mon', score: 20 }, { day: 'Tue', score: 45 }, { day: 'Wed', score: 30 },
        { day: 'Thu', score: 60 }, { day: 'Fri', score: 80 }, { day: 'Sat', score: 50 }, { day: 'Sun', score: 90 }
      ],
      moodTrend: userPulses.map(p => ({
        day: new Date(p.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
        level: p.mood === 'Great' ? 5 : p.mood === 'Good' ? 4 : p.mood === 'Neutral' ? 3 : p.mood === 'Low' ? 2 : 1
      })),
      skillDistribution: [
        { category: 'Career', value: 40 }, { category: 'Skill', value: 30 },
        { category: 'Interest', value: 20 }, { category: 'Mindfulness', value: 10 }
      ]
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
