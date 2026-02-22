import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const res = await fetch('http://localhost:5000/api/student/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                } else {
                    localStorage.removeItem('token');
                    navigate('/');
                }
            } catch (err) {
                console.error('Failed to fetch dashboard', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) return <div className="dashboard-container">Loading...</div>;
    if (!data) return <div className="dashboard-container">No Data Found</div>;

    const { studentStats, pendingHomeworks, completedHomeworks, attendanceRecords } = data;

    return (
        <>
            <nav className="navbar">
                <h2>Hi, {studentStats.username}!</h2>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </nav>

            <div className="dashboard-container fade-in">
                <div className="dashboard-header">
                    <h1 className="title-glow">Your Performance Overview</h1>
                </div>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card glass-panel">
                        <div className="stat-icon">🎓</div>
                        <div className="stat-value">{studentStats.percentage}%</div>
                        <div className="stat-label">Completion Rate</div>
                    </div>
                    <div className="stat-card glass-panel">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-value">{studentStats.streak}</div>
                        <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat-card glass-panel">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-value">Rank #{studentStats.rank}</div>
                        <div className="stat-label">Global Leaderboard</div>
                    </div>
                    <div className="stat-card glass-panel">
                        <div className="stat-icon">📅</div>
                        <div className="stat-value">{studentStats.attendancePercentage || 100}%</div>
                        <div className="stat-label">Attendance Rate</div>
                    </div>
                </div>

                {/* Pending Homework */}
                <div className="dashboard-header" style={{ marginTop: '3rem' }}>
                    <h2>Pending Tasks</h2>
                </div>

                {pendingHomeworks.length === 0 ? (
                    <p style={{ color: 'var(--success-color)' }}>All caught up! Excellent work.</p>
                ) : (
                    <div className="homework-grid">
                        {pendingHomeworks.map(sub => (
                            <div key={sub._id} className="homework-card glass-panel">
                                <div className="hw-header">
                                    <h3 className="hw-title">{sub.homeworkId?.title || 'Homework'}</h3>
                                    <span className="hw-status status-pending">Pending</span>
                                </div>
                                <div className="hw-date">Due: {sub.homeworkId ? new Date(sub.homeworkId.dueDate).toLocaleDateString() : 'N/A'}</div>
                                <p className="hw-desc" style={{ marginTop: '1rem' }}>{sub.homeworkId?.description || ''}</p>
                                {sub.remark && (
                                    <div style={{ padding: '1rem', background: 'var(--surface-color-light)', borderRadius: '6px', fontSize: '0.9rem' }}>
                                        <strong>Admin Remark:</strong> {sub.remark}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Completed Homework */}
                <div className="dashboard-header" style={{ marginTop: '4rem' }}>
                    <h2>Completed Tasks</h2>
                </div>

                {completedHomeworks.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No completed tasks yet.</p>
                ) : (
                    <div className="homework-grid" style={{ opacity: 0.8 }}>
                        {completedHomeworks.map(sub => (
                            <div key={sub._id} className="homework-card glass-panel">
                                <div className="hw-header">
                                    <h3 className="hw-title" style={{ textDecoration: sub.status === 'not done' ? 'line-through' : 'none' }}>{sub.homeworkId?.title || 'Homework'}</h3>
                                    <span className={`hw-status ${sub.status === 'done' ? 'status-done' : 'status-not-done'}`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <div className="hw-date">Due: {sub.homeworkId ? new Date(sub.homeworkId.dueDate).toLocaleDateString() : 'N/A'}</div>
                                {sub.remark && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-color-light)', borderRadius: '6px', fontSize: '0.9rem' }}>
                                        <strong>Admin Remark:</strong> {sub.remark}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Attendance History */}
                <div className="dashboard-header" style={{ marginTop: '4rem' }}>
                    <h2>Attendance History</h2>
                </div>

                {(!attendanceRecords || attendanceRecords.length === 0) ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No attendance records found yet.</p>
                ) : (
                    <div className="glass-panel" style={{ overflowX: 'auto', opacity: 0.9 }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map(record => (
                                    <tr key={record._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{record.date}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span
                                                className={`hw-status ${record.status === 'present' ? 'status-done' : 'status-not-done'}`}
                                            >
                                                {record.status === 'present' ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </>
    );
}
