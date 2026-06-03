import { useEffect, useMemo, useState } from 'react';
import {
  createRequest,
  deleteRequest,
  getAllRequests,
  getMyRequests,
  loginUser,
  registerUser,
  updateRequest,
} from './api';
import { API_BASE } from './api';

const emptyForm = {
  title: '',
  description: '',
  location: '',
  urgency: 'Medium',
};

const statusOptions = ['Pending', 'In Progress', 'Resolved'];
const urgencyOptions = ['Low', 'Medium', 'High'];
const AUTH_STORAGE_KEY = 'unifix-portal-auth';

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [requestForm, setRequestForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  useEffect(() => {
    if (auth) {
      loadRequests(auth);
    } else {
      setRequests([]);
    }
  }, [auth]);

  const stats = useMemo(() => {
    const values = requests.reduce(
      (accumulator, request) => {
        accumulator.total += 1;
        accumulator[request.status?.toLowerCase().replace(/\s+/g, '') || 'pending'] += 1;
        return accumulator;
      },
      { total: 0, pending: 0, inprogress: 0, resolved: 0 }
    );

    return values;
  }, [requests]);

  async function loadRequests(currentAuth) {
    setLoading(true);
    setError('');
    try {
      const data = currentAuth.role === 'admin'
        ? await getAllRequests(currentAuth.token)
        : await getMyRequests(currentAuth.token);
      setRequests(data);
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        email: authForm.email,
        password: authForm.password,
        ...(authMode === 'register' ? { name: authForm.name } : {}),
      };

      const data = authMode === 'register' ? await registerUser(payload) : await loginUser(payload);
      setAuth({ token: data.token, role: data.role, name: data.name });
      setAuthForm({ name: '', email: '', password: '' });
      setMessage(authMode === 'register' ? 'Account created successfully.' : 'Welcome back.');
    } catch (currentError) {
      setError(currentError.message);
    }
  }

  async function handleRequestSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', requestForm.title);
      formData.append('description', requestForm.description);
      formData.append('location', requestForm.location);
      formData.append('urgency', requestForm.urgency);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await createRequest(auth.token, formData);
      setRequestForm(emptyForm);
      setSelectedFile(null);
      setMessage('Maintenance request submitted successfully.');
      await loadRequests(auth);
    } catch (currentError) {
      setError(currentError.message);
    }
  }

  async function handleStatusChange(requestId, status) {
    try {
      await updateRequest(auth.token, requestId, { status });
      setMessage('Request status updated.');
      await loadRequests(auth);
    } catch (currentError) {
      setError(currentError.message);
    }
  }

  async function handleDelete(requestId) {
    const confirmed = window.confirm('Delete this request?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteRequest(auth.token, requestId);
      setMessage('Request deleted.');
      await loadRequests(auth);
    } catch (currentError) {
      setError(currentError.message);
    }
  }

  function handleLogout() {
    setAuth(null);
    setRequests([]);
    setMessage('Logged out.');
  }

  const dashboardTitle = auth?.role === 'admin' ? 'Admin Control Panel' : 'Student Request Hub';
  const dashboardDescription = auth?.role === 'admin'
    ? 'Track and manage maintenance jobs across the university.'
    : 'Submit room, water, electrical, or cleanliness issues from one place.';

  return (
    <div className="shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Zambia University of Technology</span>
          <h1><span className="brand-mark">UF</span>UniFix Portal</h1>
          <p>
            A maintenance request system for student accommodation, lecture rooms, and shared campus spaces.
          </p>
          <div className="hero-points">
            <span><span className="point-icon">AU</span>Authentication</span>
            <span><span className="point-icon">CR</span>CRUD Operations</span>
            <span><span className="point-icon">DB</span>PostgreSQL</span>
            <span><span className="point-icon">UP</span>File Uploads</span>
            <span><span className="point-icon">UI</span>Responsive React UI</span>
          </div>
        </div>
        <div className="hero-card">
          <p>{dashboardTitle}</p>
          <strong>{auth ? auth.name : 'Sign in to continue'}</strong>
          <span>{dashboardDescription}</span>
        </div>
      </header>

      {!auth ? (
        <main className="auth-grid">
          <section className="panel auth-panel">
            <div className="tabs">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                Login
              </button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="stack">
              {authMode === 'register' && (
                <label>
                  Full name
                  <input
                    value={authForm.name}
                    onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                    placeholder="e.g. Nompumelelo Phiri"
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  placeholder="student@zamut.edu.zm"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </label>

              <button className="primary" type="submit">
                {authMode === 'register' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </section>

          <section className="panel info-panel">
            <h2>What this solves</h2>
            <p>
              Students can report broken lights, leaking taps, dirty bathrooms, network issues, and room repairs without chasing staff in person.
            </p>
            <ul>
              <li>Students submit a request with optional image evidence.</li>
              <li>Admins review requests and update progress statuses.</li>
              <li>All data is stored in PostgreSQL through an Express API.</li>
            </ul>
          </section>
        </main>
      ) : (
        <main className="dashboard">
          <section className="panel dashboard-topbar">
            <div>
              <span className="eyebrow">Signed in as {auth.role}</span>
              <h2>{dashboardTitle}</h2>
              <p>{dashboardDescription}</p>
            </div>
            <div className="actions">
              <button type="button" onClick={() => loadRequests(auth)}>
                Refresh
              </button>
              <button type="button" className="secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="panel stat-card">
              <span>Total</span>
              <strong>{stats.total}</strong>
            </article>
            <article className="panel stat-card">
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </article>
            <article className="panel stat-card">
              <span>In Progress</span>
              <strong>{stats.inprogress}</strong>
            </article>
            <article className="panel stat-card">
              <span>Resolved</span>
              <strong>{stats.resolved}</strong>
            </article>
          </section>

          <div className="content-grid">
            <section className="panel">
              <h3 className="section-title">Submit a Maintenance Request</h3>
              <form onSubmit={handleRequestSubmit} className="stack">
                <label>
                  Title
                  <input
                    value={requestForm.title}
                    onChange={(event) => setRequestForm({ ...requestForm, title: event.target.value })}
                    placeholder="Broken desk light"
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    rows="4"
                    value={requestForm.description}
                    onChange={(event) => setRequestForm({ ...requestForm, description: event.target.value })}
                    placeholder="Explain the issue clearly"
                    required
                  />
                </label>

                <div className="two-col">
                  <label>
                    Location
                    <input
                      value={requestForm.location}
                      onChange={(event) => setRequestForm({ ...requestForm, location: event.target.value })}
                      placeholder="Hostel B, room 14"
                      required
                    />
                  </label>

                  <label>
                    Urgency
                    <select
                      value={requestForm.urgency}
                      onChange={(event) => setRequestForm({ ...requestForm, urgency: event.target.value })}
                    >
                      {urgencyOptions.map((urgency) => (
                        <option key={urgency} value={urgency}>
                          {urgency}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Upload image
                  <input type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
                </label>

                <button className="primary" type="submit">
                  Submit request
                </button>
              </form>
            </section>

            <section className="panel">
              <div className="section-head">
                <h3 className="section-title">{auth.role === 'admin' ? 'All Requests' : 'My Requests'}</h3>
                <span>{loading ? 'Loading...' : `${requests.length} records`}</span>
              </div>

              <div className="request-list">
                {requests.length === 0 && !loading ? (
                  <div className="empty-state">No requests yet.</div>
                ) : (
                  requests.map((request) => (
                    <article className="request-card" key={request.id}>
                      <div className="request-card__top">
                        <div>
                          <h4>{request.title}</h4>
                          <p>{request.description}</p>
                        </div>
                        <span className={`badge badge-${(request.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="meta-row">
                        <span>{request.location}</span>
                        <span>{request.urgency}</span>
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>

                      {request.image_url && (
                        <a
                          className="image-link"
                          href={`${API_BASE.replace(/\/api$/, '')}${request.image_url}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View uploaded image
                        </a>
                      )}

                      {auth.role === 'admin' ? (
                        <div className="request-actions">
                          <select value={request.status || 'Pending'} onChange={(event) => handleStatusChange(request.id, event.target.value)}>
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button className="danger" type="button" onClick={() => handleDelete(request.id)}>
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {(message || error) && (
        <div className={`toast ${error ? 'toast-error' : 'toast-success'}`}>
          {error || message}
        </div>
      )}
    </div>
  );
}

export default App;
