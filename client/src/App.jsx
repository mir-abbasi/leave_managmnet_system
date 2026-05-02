import { useEffect, useMemo, useState } from 'react';

const users = [
  { username: 'admin', password: 'qaziabsaar', role: 'admin', name: 'Administrator', dept: '' },
  { username: 'shahmir', password: 'absaarnayoskemarihun', role: 'employee', name: 'Shahmir', dept: 'HR' },
  { username: 'user2', password: 'pass123', role: 'employee', name: 'Ahmed Khan', dept: 'Engineering' },
  { username: 'user3', password: 'pass456', role: 'employee', name: 'Fatima Ali', dept: 'Finance' },
  { username: 'user4', password: 'pass789', role: 'employee', name: 'Hassan Omar', dept: 'Operations' }
];

const initialForm = { type: 'Casual', from: '', to: '', reason: '' };
const initialLogin = { username: '', password: '' };
const initialSignup = { username: '', password: '', name: '', dept: '' };

function readLeaves() {
  try {
    const raw = localStorage.getItem('leaves');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLeaves(leaves) {
  localStorage.setItem('leaves', JSON.stringify(leaves));
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('leaveAppUser')) || null;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState(user ? 'dashboard' : 'login');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loginData, setLoginData] = useState(initialLogin);
  const [signupData, setSignupData] = useState(initialSignup);
  const [error, setError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadLeaves();
    }
  }, [user]);

  const loadLeaves = () => {
    setLoading(true);
    const allLeaves = readLeaves();
    const visibleLeaves = user?.role === 'employee'
      ? allLeaves.filter((leave) => leave.submittedBy === user.username)
      : allLeaves;
    setLeaves(visibleLeaves);
    setLoading(false);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setLoginError('');
    setSignupSuccess('');

    const username = loginData.username.trim();
    const password = loginData.password.trim();

    if (!username || !password) {
      setLoginError('Enter username and password.');
      return;
    }

    const matchedUser = users.find(
      (item) => item.username === username && item.password === password
    );

    if (!matchedUser) {
      setLoginError('Invalid username or password.');
      return;
    }

    const safeUser = { username: matchedUser.username, role: matchedUser.role, name: matchedUser.name, dept: matchedUser.dept };
    setUser(safeUser);
    localStorage.setItem('leaveAppUser', JSON.stringify(safeUser));
    setPage('dashboard');
    setLoginData(initialLogin);
    setForm(initialForm);
  };

  const handleSignup = (event) => {
    event.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    const username = signupData.username.trim();
    const password = signupData.password.trim();
    const name = signupData.name.trim();
    const dept = signupData.dept.trim();

    if (!username || !password || !name || !dept) {
      setSignupError('Complete all fields to sign up.');
      return;
    }

    const existing = users.find((u) => u.username === username);
    if (existing) {
      setSignupError('Username already exists.');
      return;
    }

    users.push({ username, password, role: 'employee', name, dept });
    setSignupSuccess('Signup complete. Please login with your new credentials.');
    setSignupData(initialSignup);
    setPage('login');
  };

  const handleLogout = () => {
    setUser(null);
    setLeaves([]);
    setPage('login');
    setForm(initialForm);
    setLoginData(initialLogin);
    setSignupData(initialSignup);
    localStorage.removeItem('leaveAppUser');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.from || !form.to) {
      setError('Complete all required fields.');
      return;
    }

    const allLeaves = readLeaves();
    const newLeave = {
      id: Date.now().toString(),
      submittedBy: user.username,
      name: user.name,
      dept: user.dept,
      type: form.type,
      from: form.from,
      to: form.to,
      reason: form.reason,
      status: 'Pending'
    };

    const nextLeaves = [...allLeaves, newLeave];
    saveLeaves(nextLeaves);
    setForm(initialForm);
    setPage('history');
    loadLeaves();
  };

  const updateStatus = (id, status) => {
    const allLeaves = readLeaves();
    const updatedLeaves = allLeaves.map((leave) =>
      leave.id === id ? { ...leave, status } : leave
    );
    saveLeaves(updatedLeaves);
    loadLeaves();
  };

  const stats = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((item) => item.status === 'Pending').length,
      approved: leaves.filter((item) => item.status === 'Approved').length
    };
  }, [leaves]);

  if (!user) {
    return (
      <div className="app-shell d-flex align-items-center justify-content-center">
        <div className="auth-card shadow-lg p-4" style={{ minWidth: 360, width: '100%', maxWidth: 420 }}>
          <h3 className="mb-4 text-center">Sign In</h3>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            {loginError && <div className="alert alert-danger">{loginError}</div>}
            {signupSuccess && <div className="alert alert-success">{signupSuccess}</div>}
            <button className="btn btn-primary w-100" type="submit">
              Login
            </button>
          </form>
          <div className="text-center mt-3">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage('signup')}>
              New employee? Sign up
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dashboardTitle = user.role === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard';
  const greetingText =
    user.role === 'admin'
      ? 'Approve pending leaves and manage team leave requests.'
      : 'Apply for leave, track approvals, and view your leave history.';

  return (
    <div className="app-shell min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark shadow-sm px-3 py-3">
        <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <span className="navbar-brand mb-0">Leave Management</span>
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
            <span className="navbar-text text-white text-capitalize me-2">
              {user.name} ({user.role})
            </span>
            <button className="btn btn-light btn-sm" onClick={() => setPage('dashboard')}>
              Dashboard
            </button>
            {user.role === 'employee' && (
              <>
                <button className="btn btn-light btn-sm" onClick={() => setPage('apply')}>
                  Apply
                </button>
                <button className="btn btn-light btn-sm" onClick={() => setPage('history')}>
                  History
                </button>
              </>
            )}
            {user.role === 'admin' && (
              <button className="btn btn-light btn-sm" onClick={() => setPage('admin')}>
                Admin
              </button>
            )}
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {page === 'dashboard' && (
          <>
            <div className="dashboard-hero rounded-4 shadow-sm p-4 mb-4 text-white">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                <div>
                  <h2 className="mb-2">{dashboardTitle}</h2>
                  <p className="mb-0 lead">{greetingText}</p>
                </div>
                <div className="hero-pill">{user.role.toUpperCase()}</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <StatCard title="Total Leaves" value={stats.total} icon="📄" />
              <StatCard title="Pending" value={stats.pending} icon="⏳" />
              <StatCard title="Approved" value={stats.approved} icon="✅" />
              <StatCard title="Role" value={user.role} icon="👤" />
            </div>
          </>
        )}

        {page === 'signup' && (
          <div className="auth-card shadow-lg p-4 mx-auto" style={{ minWidth: 360, width: '100%', maxWidth: 520 }}>
            <h3 className="mb-4 text-center">Employee Signup</h3>
            <form onSubmit={handleSignup}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Department</label>
                <input
                  className="form-control"
                  value={signupData.dept}
                  onChange={(e) => setSignupData({ ...signupData, dept: e.target.value })}
                />
              </div>
              {signupError && <div className="alert alert-danger">{signupError}</div>}
              <button className="btn btn-primary w-100" type="submit">
                Sign Up
              </button>
            </form>
            <div className="text-center mt-3">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage('login')}>
                Back to login
              </button>
            </div>
          </div>
        )}

        {page === 'apply' && user.role === 'employee' && (
          <div className="custom-card p-4 rounded-4 shadow-sm mx-auto" style={{ maxWidth: 620 }}>
            <h2 className="text-center mb-4">Apply Leave</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Employee Name</label>
                  <input className="form-control" value={user.name} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <input className="form-control" value={user.dept} disabled />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Leave Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Casual</option>
                  <option>Sick</option>
                  <option>Annual</option>
                </select>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">To</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Reason</label>
                <textarea
                  className="form-control"
                  placeholder="Reason"
                  rows="4"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <button className="btn btn-primary w-100" type="submit">
                Submit
              </button>
            </form>
          </div>
        )}

        {page === 'history' && user.role === 'employee' && (
          <div className="custom-card p-4 rounded-4 shadow-sm">
            <h2 className="text-center mb-4">Leave History</h2>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No leave history available.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.name}</td>
                        <td>{leave.type}</td>
                        <td>{leave.from} to {leave.to}</td>
                        <td>{leave.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'admin' && user.role === 'admin' && (
          <div className="custom-card p-4 rounded-4 shadow-sm">
            <h2 className="text-center mb-4">Admin Panel</h2>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : leaves.filter((leave) => leave.status === 'Pending').length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No pending leave requests.
                      </td>
                    </tr>
                  ) : (
                    leaves.filter((leave) => leave.status === 'Pending').map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.name}</td>
                        <td>{leave.dept}</td>
                        <td>{leave.type}</td>
                        <td>{leave.status}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => updateStatus(leave.id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => updateStatus(leave.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'admin' && user.role !== 'admin' && (
          <div className="alert alert-warning">You need admin access to view this page.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <h5>{title}</h5>
      <h3>{value}</h3>
    </div>
  );
}

export default App;
