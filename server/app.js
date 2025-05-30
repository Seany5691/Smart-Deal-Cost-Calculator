// Express backend for Smart Deal Cost Calculator
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const CONFIG_PATH = path.join(__dirname, 'config', 'config.json');
const USERS_PATH = path.join(__dirname, 'config', 'users.json');
const SECRET = process.env.JWT_SECRET || 'smartdeal_secret';

app.use(cors());
app.use(bodyParser.json());

// Helper: Read config
function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}
// Helper: Write config
function writeConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
}
// Helper: Read users
function readUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
}
// Helper: Write users
function writeUsers(data) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
}

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  const users = readUsers().map(u => ({ id: u.id, username: u.username, role: u.role }));
  res.json(users);
});

app.post('/api/users', authenticateToken, requireAdmin, (req, res) => {
  const users = readUsers();
  const { username, password, role } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const newUser = { id: Date.now().toString(), username, password, role };
  users.push(newUser);
  writeUsers(users);
  res.json({ id: newUser.id, username: newUser.username, role: newUser.role });
});

app.put('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx] = { ...users[idx], ...req.body };
  writeUsers(users);
  res.json({ id: users[idx].id, username: users[idx].username, role: users[idx].role });
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
  let users = readUsers();
  users = users.filter(u => u.id !== req.params.id);
  writeUsers(users);
  res.json({ success: true });
});

app.post('/api/change-password', authenticateToken, requireAdmin, (req, res) => {
  const { userId, newPassword } = req.body;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx].password = newPassword;
  writeUsers(users);
  res.json({ success: true });
});

// Config endpoints
app.get('/api/config', authenticateToken, (req, res) => {
  res.json(readConfig());
});

app.put('/api/config', authenticateToken, requireAdmin, (req, res) => {
  writeConfig(req.body);
  res.json({ success: true });
});

// Hardware endpoints
app.get('/api/hardware', authenticateToken, (req, res) => {
  const config = readConfig();
  res.json(config.hardware || []);
});

app.put('/api/hardware', authenticateToken, requireAdmin, (req, res) => {
  const config = readConfig();
  config.hardware = req.body;
  writeConfig(config);
  res.json({ success: true });
});

// Connectivity endpoints
app.get('/api/connectivity', authenticateToken, (req, res) => {
  const config = readConfig();
  res.json(config.connectivity || []);
});

app.put('/api/connectivity', authenticateToken, requireAdmin, (req, res) => {
  const config = readConfig();
  config.connectivity = req.body;
  writeConfig(config);
  res.json({ success: true });
});

// Licensing endpoints
app.get('/api/licensing', authenticateToken, (req, res) => {
  const config = readConfig();
  res.json(config.licensing || []);
});

app.put('/api/licensing', authenticateToken, requireAdmin, (req, res) => {
  const config = readConfig();
  config.licensing = req.body;
  writeConfig(config);
  res.json({ success: true });
});

// Scales endpoints
app.get('/api/scales', authenticateToken, (req, res) => {
  const config = readConfig();
  res.json(config.scales || {});
});

app.put('/api/scales', authenticateToken, requireAdmin, (req, res) => {
  const config = readConfig();
  config.scales = req.body;
  writeConfig(config);
  res.json({ success: true });
});

// Factors endpoints
app.get('/api/factors', authenticateToken, (req, res) => {
  const config = readConfig();
  res.json(config.factors || {});
});

app.put('/api/factors', authenticateToken, requireAdmin, (req, res) => {
  const config = readConfig();
  config.factors = req.body;
  writeConfig(config);
  res.json({ success: true });
});

// Handle duplicate /api prefix for factors (temporary fix)
app.get('/api/api/factors', authenticateToken, (req, res) => {
  const config = readConfig();
  res.json(config.factors || {});
});

app.put('/api/api/factors', authenticateToken, requireAdmin, (req, res) => {
  const config = readConfig();
  config.factors = req.body;
  writeConfig(config);
  res.json({ success: true });
});

// Serve frontend (for production)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
