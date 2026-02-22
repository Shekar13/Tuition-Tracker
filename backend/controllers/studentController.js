import Student from '../models/Student.js';
import Homework from '../models/Homework.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';

// @desc Get student dashboard info
// @route GET /api/student/dashboard
export const getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Get current ranking
        // To rank, we compare the percentage of completed homeworks of this student with all other students
        // This is simple rank tracking: Find how many students have a higher percentage than this student

        // Sort students by percentage (which is a virtual property, so we might need to sort in JS or use aggregate in MongoDB. 
        // To keep it simple for now, we'll fetch them, calculate, sort and find index. This is fine for small groups).
        // Or we can just calculate ranking simply based on completedHomeworks.
        const allStudents = await Student.find({});

        // Calculate percentage and give rank based on it
        allStudents.sort((a, b) => {
            // B's percentage - A's percentage for descending order
            return (b.percentage) - (a.percentage);
        });

        // Find index of current student
        const rank = allStudents.findIndex(s => s._id.toString() === req.user.id.toString()) + 1;
        student.rank = rank;
        await student.save(); // save the calculated rank

        const pendingSubmissions = await Submission.find({
            studentId: req.user.id,
            status: 'pending' // pending
        }).populate('homeworkId', 'title description dueDate');

        const completedSubmissions = await Submission.find({
            studentId: req.user.id,
            status: { $in: ['done', 'not done'] }
        }).populate('homeworkId', 'title description dueDate');

        const attendanceRecords = await Attendance.find({
            studentId: req.user.id
        }).sort({ date: -1 });

        // Calculate attendance percentage
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
        const attendancePercentage = totalDays === 0 ? 100 : Math.round((presentDays / totalDays) * 100);

        res.json({
            studentStats: {
                username: student.username,
                streak: student.streak,
                rank: student.rank,
                percentage: student.percentage,
                completedHomeworks: student.completedHomeworks,
                totalHomeworksAssigned: student.totalHomeworksAssigned,
                attendancePercentage
            },
            pendingHomeworks: pendingSubmissions,
            completedHomeworks: completedSubmissions,
            attendanceRecords: attendanceRecords
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
