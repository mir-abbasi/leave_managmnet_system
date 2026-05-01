const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const DATA_PATH = path.join(__dirname, 'data', 'leaves.json');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

app.use(cors());
app.use(express.json());

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function readLeaves() {
  return readJson(DATA_PATH);
}

function saveLeaves(leaves) {
  writeJson(DATA_PATH, leaves);
}

function readUsers() {
  return readJson(USERS_PATH);
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password.' });
  }

  const users = readUsers();
  const user = users.find((item) => item.username === username && item.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const { password: _password, ...safeUser } = user;
  res.json(safeUser);
});

app.get('/api/leaves', (req, res) => {
  const leaves = readLeaves();
  const { username } = req.query;

  if (username) {
    return res.json(leaves.filter((leave) => leave.submittedBy === username));
  }

  res.json(leaves);
});

app.post('/api/leaves', (req, res) => {
  const { submittedBy, name, dept, type, from, to, reason } = req.body;
  if (!submittedBy || !name || !dept || !type || !from || !to) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const leaves = readLeaves();
  const newLeave = {
    id: Date.now().toString(),
    submittedBy,
    name,
    dept,
    type,
    from,
    to,
    reason: reason || '',
    status: 'Pending'
  };

  leaves.push(newLeave);
  saveLeaves(leaves);
  res.status(201).json(newLeave);
});

app.put('/api/leaves/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['Pending', 'Approved', 'Rejected'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const leaves = readLeaves();
  const leave = leaves.find((item) => item.id === id);

  if (!leave) {
    return res.status(404).json({ error: 'Leave not found.' });
  }

  leave.status = status;
  saveLeaves(leaves);
  res.json(leave);
});

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
