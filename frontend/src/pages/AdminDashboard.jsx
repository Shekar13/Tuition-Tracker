import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [homeworks, setHomeworks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedStudentToGrade, setSelectedStudentToGrade] = useState('');

    // Forms states
    const [newStudent, setNewStudent] = useState({ username: '', password: '' });
    const [newHomework, setNewHomework] = useState({ title: '', description: '', dueDate: '', studentId: '' });

    const [grading, setGrading] = useState({ submissionId: '', status: 'done', remark: '' });

    // Attendance states
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        fetchStudents();
        fetchHomeworks();
    }, [navigate]);

    useEffect(() => {
        if (selectedStudentToGrade) {
            fetchSubmissionsForStudent(selectedStudentToGrade);
        }
    }, [selectedStudentToGrade]);

    useEffect(() => {
        if (attendanceDate && token) {
            fetchAttendance(attendanceDate);
        }
    }, [attendanceDate, token]);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const fetchStudents = async () => {
        const res = await fetch('http://localhost:5000/api/admin/students', { headers });
        if (res.ok) setStudents(await res.json());
    };

    const fetchHomeworks = async () => {
        const res = await fetch('http://localhost:5000/api/admin/homework', { headers });
        if (res.ok) setHomeworks(await res.json());
    };

    const fetchSubmissionsForStudent = async (studentId) => {
        const res = await fetch(`http://localhost:5000/api/admin/students/${studentId}/submissions`, { headers });
        if (res.ok) setSubmissions(await res.json());
    };

    const fetchAttendance = async (dateStr) => {
        const res = await fetch(`http://localhost:5000/api/admin/attendance?date=${dateStr}`, { headers });
        if (res.ok) {
            const records = await res.json();
            const attObj = {};
            records.forEach(r => {
                if (r.studentId) attObj[r.studentId._id] = r.status;
            });
            setAttendanceData(attObj);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:5000/api/admin/students', {
            method: 'POST',
            headers,
            body: JSON.stringify(newStudent)
        });
        if (res.ok) {
            fetchStudents();
            setNewStudent({ username: '', password: '' });
            alert('Student created successfully');
        } else {
            alert('Error creating student');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to permanently delete this student? All their homework and submissions will also be deleted.')) {
            return;
        }

        const res = await fetch(`http://localhost:5000/api/admin/students/${studentId}`, {
            method: 'DELETE',
            headers
        });

        if (res.ok) {
            fetchStudents();
            fetchHomeworks();
            setSelectedStudentToGrade('');
            setSubmissions([]);
            alert('Student deleted successfully');
        } else {
            alert('Error deleting student');
        }
    };

    const handleCreateHomework = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:5000/api/admin/homework', {
            method: 'POST',
            headers,
            body: JSON.stringify(newHomework)
        });
        if (res.ok) {
            fetchHomeworks();
            setNewHomework({ title: '', description: '', dueDate: '', studentId: '' });
            alert('Homework uploaded successfully');
        } else {
            alert('Error uploading homework');
        }
    };

    const handleGrade = async (e) => {
        e.preventDefault();
        const res = await fetch(`http://localhost:5000/api/admin/submissions/${grading.submissionId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: grading.status, remark: grading.remark })
        });
        if (res.ok) {
            fetchSubmissionsForStudent(selectedStudentToGrade);
            setGrading({ submissionId: '', status: 'done', remark: '' }); // Reset
            alert('Submission graded!');
        } else {
            alert('Error grading submission');
        }
    };

    const handleSaveAttendance = async () => {
        const recordsToSave = Object.keys(attendanceData).map(studentId => ({
            studentId,
            status: attendanceData[studentId]
        }));

        const res = await fetch('http://localhost:5000/api/admin/attendance', {
            method: 'POST',
            headers,
            body: JSON.stringify({ date: attendanceDate, attendanceRecords: recordsToSave })
        });

        if (res.ok) {
            alert('Attendance saved for ' + attendanceDate);
        } else {
            alert('Error saving attendance');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <>
            <nav className="navbar">
                <h2>Admin Dashboard</h2>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </nav>

            <div className="dashboard-container fade-in">
                <div className="admin-grid">

                    {/* Left Column: Management */}
                    <div>
                        {/* Create Student */}
                        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                            <h3>Create Student</h3>
                            <form onSubmit={handleCreateStudent} style={{ marginTop: '1rem' }}>
                                <div className="input-group">
                                    <input type="text" placeholder="Username" required value={newStudent.username} onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <input type="password" placeholder="Password" required value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Student</button>
                            </form>
                        </div>

                        {/* Upload Homework */}
                        <div className="glass-panel">
                            <h3>Upload Homework</h3>
                            <form onSubmit={handleCreateHomework} style={{ marginTop: '1rem' }}>
                                <div className="input-group">
                                    <label>Select Student Name</label>
                                    <select required value={newHomework.studentId} onChange={(e) => setNewHomework({ ...newHomework, studentId: e.target.value })}>
                                        <option value="" disabled>-- Select Student --</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>{s.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <input type="text" placeholder="Homework Assignment (Title)" required value={newHomework.title} onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <textarea placeholder="Assignment Details (Optional)" rows="3" value={newHomework.description} onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Submission Date</label>
                                    <input type="date" required value={newHomework.dueDate} onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Assign Homework</button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Grading / Review */}
                    <div className="glass-panel">
                        <h3>Grade Submissions</h3>
                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label>Select Student to View/Grade</label>
                            <select onChange={(e) => setSelectedStudentToGrade(e.target.value)} value={selectedStudentToGrade}>
                                <option value="" disabled>-- Choose Student --</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.username}</option>
                                ))}
                            </select>
                        </div>

                        {selectedStudentToGrade && (
                            <div style={{ marginTop: '2rem' }}>
                                {submissions.length === 0 ? <p>No submissions or history found for this student.</p> : (
                                    <div>
                                        {submissions.map(sub => (
                                            <div key={sub._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong>{sub.homeworkId?.title || 'Deleted Homework'}</strong>
                                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due: {sub.homeworkId ? new Date(sub.homeworkId.dueDate).toLocaleDateString() : 'N/A'}</span>
                                                    <span style={{ marginTop: '0.4rem', display: 'inline-block' }} className={`hw-status ${sub.status === 'done' ? 'status-done' : sub.status === 'not done' ? 'status-not-done' : 'status-pending'}`}>{sub.status}</span>
                                                    {sub.remark && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Remark: {sub.remark}</p>}
                                                </div>

                                                <button onClick={() => setGrading({ ...grading, submissionId: sub._id, remark: sub.remark || '' })} className="btn" style={{ background: 'var(--surface-color-light)', color: '#fff', padding: '0.5rem 1rem' }}>
                                                    Grade
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Grading Form Modal / Inline */}
                        {grading.submissionId && (
                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface-color-light)', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
                                <h4>Update Status</h4>
                                <form onSubmit={handleGrade} style={{ marginTop: '1rem' }}>
                                    <div className="input-group">
                                        <label>Status</label>
                                        <select value={grading.status} onChange={(e) => setGrading({ ...grading, status: e.target.value })}>
                                            <option value="done">Done</option>
                                            <option value="not done">Not Done</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Remark (Optional)</label>
                                        <textarea placeholder="Add a remark..." value={grading.remark} onChange={(e) => setGrading({ ...grading, remark: e.target.value })} rows="2" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                        <button type="button" className="btn btn-danger" onClick={() => setGrading({ submissionId: '', status: 'done', remark: '' })}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>

                </div>

                {/* Take Attendance Section */}
                <div className="glass-panel" style={{ marginTop: '2rem' }}>
                    <h3
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
                    >
                        <span>Take Attendance</span>
                        <span>{isAttendanceOpen ? '−' : '+'}</span>
                    </h3>

                    {isAttendanceOpen && (
                        <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <input
                                        type="date"
                                        value={attendanceDate}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        style={{ width: 'auto' }}
                                    />
                                </div>
                                <button onClick={handleSaveAttendance} className="btn btn-primary">Save Attendance</button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '1rem' }}>Username</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>Present</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>Absent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <tr key={student._id} style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.8 }}>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{student.username}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <input
                                                        type="radio"
                                                        name={`att-${student._id}`}
                                                        checked={attendanceData[student._id] === 'present'}
                                                        onChange={() => { }} // React requires onChange if checked is provided
                                                        onClick={() => {
                                                            const prevVal = attendanceData[student._id];
                                                            setAttendanceData({
                                                                ...attendanceData,
                                                                [student._id]: prevVal === 'present' ? null : 'present'
                                                            });
                                                        }}
                                                        style={{ transform: 'scale(1.5)', cursor: 'pointer', accentColor: 'var(--success-color)' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <input
                                                        type="radio"
                                                        name={`att-${student._id}`}
                                                        checked={attendanceData[student._id] === 'absent'}
                                                        onChange={() => { }}
                                                        onClick={() => {
                                                            const prevVal = attendanceData[student._id];
                                                            setAttendanceData({
                                                                ...attendanceData,
                                                                [student._id]: prevVal === 'absent' ? null : 'absent'
                                                            });
                                                        }}
                                                        style={{ transform: 'scale(1.5)', cursor: 'pointer', accentColor: 'var(--danger-color)' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>No students registered yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Rankings Preview */}
                <div className="glass-panel" style={{ marginTop: '2rem' }}>
                    <h3>Student Leaderboard & Stats</h3>
                    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem' }}>Rank</th>
                                    <th style={{ padding: '1rem' }}>Username</th>
                                    <th style={{ padding: '1rem' }}>Streak 🔥</th>
                                    <th style={{ padding: '1rem' }}>Completion %</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id} style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.8 }}>
                                        <td style={{ padding: '1rem' }}>#{student.rank}</td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{student.username}</td>
                                        <td style={{ padding: '1rem', color: 'var(--accent-color)' }}>{student.streak} days</td>
                                        <td style={{ padding: '1rem', color: 'var(--success-color)' }}>{student.percentage}%</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
                                                className="btn btn-danger"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                title="Delete Student"
                                            >
                                                🗑️ Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No students registered yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}
