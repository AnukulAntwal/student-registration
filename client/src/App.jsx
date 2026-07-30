import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API = 'https://student-registration-1-eeaj.onrender.com';

function App() {
  const [form, setForm] = useState({ name: '', fatherName: '', age: '', className: '', mobileNumber: '', schoolName: '' });
  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) nextErrors.name = 'Name is required';
    if (!form.fatherName.trim() || form.fatherName.trim().length < 2) nextErrors.fatherName = 'Father name is required';
    if (!/^[0-9]{10}$/.test(form.mobileNumber)) nextErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    if (!form.schoolName.trim()) nextErrors.schoolName = 'School name is required';
    if (!form.className.trim()) nextErrors.className = 'Class is required';
    const ageNum = Number(form.age);
    if (!form.age || !Number.isInteger(ageNum) || ageNum < 3 || ageNum > 25) nextErrors.age = 'Age must be between 3 and 25';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, mobileNumber: cleaned });
      setErrors({ ...errors, mobileNumber: '' });
      return;
    }

    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/students`, {
        ...form,
        age: Number(form.age)
      });
      toast.success(response.data.message || 'Registered successfully');
      setForm({ name: '', fatherName: '', age: '', className: '', mobileNumber: '', schoolName: '' });
      setErrors({});
    } catch (error) {
      const msg = error?.response?.data?.errors?.join(', ') || error?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await axios.get(`${API}/students`);
        setStudents(res.data);
      } catch (err) {
        toast.error('Unable to load admin records');
      }
    };
    if (adminLoggedIn) {
      loadStudents();
    }
  }, [adminLoggedIn]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminForm.username === 'rahul' && adminForm.password === 'Rahul@123') {
      setAdminLoggedIn(true);
      setAdminForm({ username: '', password: '' });
      navigate('/admin');
      toast.success('Admin login successful');
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    navigate('/');
    toast.success('Admin logged out');
  };

  return (
    <div className="app-shell">
      <Toaster position="top-center" />
      <header className="topbar">
        <div>
          <p className="eyebrow">Mobile-first registration</p>
          <h1>Student registration portal</h1>
        </div>
        <nav className="nav-links">
          <Link to="/">Register</Link>
          <Link to="/admin">Admin</Link>
          {adminLoggedIn && <button type="button" className="ghost-btn" onClick={handleAdminLogout}>Logout</button>}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<RegistrationForm form={form} errors={errors} loading={loading} handleChange={handleChange} handleSubmit={handleSubmit} />} />
        <Route
          path="/admin"
          element={adminLoggedIn ? <AdminPanel students={students} /> : <AdminLogin onSubmit={handleAdminLogin} adminForm={adminForm} setAdminForm={setAdminForm} />}
        />
      </Routes>
    </div>
  );
}

function RegistrationForm({ form, errors, loading, handleChange, handleSubmit }) {
  return (
    <main className="card">
      <div className="hero">
        <h2>Register a student</h2>
        <p>Collect student details quickly on mobile with clear validation and instant feedback.</p>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" />
          {errors.name && <span className="error">{errors.name}</span>}
        </label>
        <label>
          Father Name
          <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Enter father name" />
          {errors.fatherName && <span className="error">{errors.fatherName}</span>}
        </label>
        <label>
          Age
          <input name="age" type="number" min="3" max="25" value={form.age} onChange={handleChange} placeholder="Age" />
          {errors.age && <span className="error">{errors.age}</span>}
        </label>
        <label>
          Class
          <select name="className" value={form.className} onChange={handleChange}>
            <option value="">Select class</option>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={`${value}th`}>
                {`${value}${value === 1 ? 'st' : value === 2 ? 'nd' : value === 3 ? 'rd' : 'th'} Class`}
              </option>
            ))}
          </select>
          {errors.className && <span className="error">{errors.className}</span>}
        </label>
        <label>
          Mobile Number
          <input name="mobileNumber" inputMode="numeric" maxLength="10" value={form.mobileNumber} onChange={handleChange} placeholder="10-digit mobile" />
          {errors.mobileNumber && <span className="error">{errors.mobileNumber}</span>}
        </label>
        <label>
          School Name
          <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="School name" />
          {errors.schoolName && <span className="error">{errors.schoolName}</span>}
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Register student'}</button>
      </form>
    </main>
  );
}

function AdminLogin({ onSubmit, adminForm, setAdminForm }) {
  return (
    <main className="card">
      <div className="hero">
        <h2>Admin login</h2>
        <p>Use the static admin credentials to view registrations.</p>
      </div>
      <form onSubmit={onSubmit} className="form-grid">
        <label>
          Username
          <input value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} placeholder="admin" />
        </label>
        <label>
          Password
          <input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="123456" />
        </label>
        <button type="submit">Login</button>
      </form>
    </main>
  );
}

function AdminPanel({ students }) {
  return (
    <main className="card">
      <div className="hero">
        <h2>Admin registrations</h2>
        <p>List of all students registered through the portal.</p>
      </div>
      <div className="admin-list">
        {students.length === 0 ? (
          <div className="empty">No registrations yet.</div>
        ) : (
          students.map((student) => (
            <article key={student._id} className="student-card">
              <h3>{student.name}</h3>
              <p><strong>Father:</strong> {student.fatherName}</p>
              <p><strong>Age:</strong> {student.age}</p>
              <p><strong>Class:</strong> {student.className}</p>
              <p><strong>Mobile:</strong> {student.mobileNumber}</p>
              <p><strong>School:</strong> {student.schoolName}</p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

export default App;
