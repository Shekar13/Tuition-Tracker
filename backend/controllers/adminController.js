import Student from '../models/Student.js';
import Homework from '../models/Homework.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';

// --- STUDENT MANAGEMENT ---

// @desc Create a new student account
// @route POST /api/admin/students
export const createStudent = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingStudent = await Student.findOne({ username });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student username already exists' });
        }

        const student = new Student({ username, password });
        await student.save();

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get all students
// @route GET /api/admin/students
export const getStudents = async (req, res) => {
    try {
        const students = await Student.find({}).sort({ rank: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Delete a student
// @route DELETE /api/admin/students/:id
export const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Find and delete the student
        const student = await Student.findByIdAndDelete(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete all submissions associated with the student to clean up DB
        await Submission.deleteMany({ studentId: studentId });

        // Also delete any homework specifically assigned to only this student 
        // to prevent orphaned homework entries 
        await Homework.deleteMany({ assignedTo: studentId });

        res.json({ message: 'Student removed completely' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- HOMEWORK MANAGEMENT ---

// @desc Upload new homework
// @route POST /api/admin/homework
export const uploadHomework = async (req, res) => {
    try {
        const { title, description, dueDate, studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ message: 'studentId is required as we are assigning to an individual student.' });
        }

        const homework = new Homework({ title, description, dueDate, assignedTo: studentId });
        await homework.save();

        // Create a single pending submission for the assigned student
        const submission = new Submission({
            studentId: studentId,
            homeworkId: homework._id,
            status: 'pending' // Default status
        });

        await submission.save();

        // Increment totalHomeworksAssigned for this specific student
        await Student.findByIdAndUpdate(studentId, { $inc: { totalHomeworksAssigned: 1 } });

        res.status(201).json(homework);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get all homeworks
// @route GET /api/admin/homework
export const getHomeworks = async (req, res) => {
    try {
        const homeworks = await Homework.find({}).populate('assignedTo', 'username').sort({ dueDate: -1 });
        res.json(homeworks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- SUBMISSION MANAGEMENT ---

// @desc Get all submissions for a specific homework
// @route GET /api/admin/homework/:id/submissions
export const getHomeworkSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ homeworkId: req.params.id })
            .populate('studentId', 'username rank streak percentage')
            .sort({ 'studentId.username': 1 }); // Assuming simple sorting for now

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get all submissions for a specific student
// @route GET /api/admin/students/:id/submissions
export const getStudentSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.params.id })
            .populate('homeworkId', 'title description dueDate')
            .sort({ createdAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Mark submission as done/not done and add remark
// @route PUT /api/admin/submissions/:id
export const updateSubmissionStatus = async (req, res) => {
    try {
        const { status, remark } = req.body; // status: 'done', 'not done'

        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const previousStatus = submission.status;
        submission.status = status;
        submission.remark = remark || submission.remark;
        await submission.save();

        // Re-calculate Student Stats
        const student = await Student.findById(submission.studentId);

        // Update streak and completed homeworks based on status changes
        if (status === 'done' && previousStatus !== 'done') {
            student.streak += 1;
            student.completedHomeworks += 1;
        } else if (status !== 'done' && previousStatus === 'done') {
            student.streak = 0; // Break streak
            student.completedHomeworks = Math.max(0, student.completedHomeworks - 1);
        } else if (status === 'not done') {
            student.streak = 0; // Break streak
        }

        await student.save();

        // Dynamically update everyone's rank based on their new percentages
        const allStudents = await Student.find({});

        // Sort first by percentage (desc), then by streak (desc) to break ties
        allStudents.sort((a, b) => {
            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }
            return b.streak - a.streak;
        });

        // Update ranks in the database
        for (let i = 0; i < allStudents.length; i++) {
            const calculatedRank = i + 1;
            if (allStudents[i].rank !== calculatedRank) {
                allStudents[i].rank = calculatedRank;
                await allStudents[i].save();
            }
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- ATTENDANCE MANAGEMENT ---

// @desc Get attendance for a specific date
// @route GET /api/admin/attendance
export const getAttendanceByDate = async (req, res) => {
    try {
        const date = req.query.date; // Expecting YYYY-MM-DD
        if (!date) return res.status(400).json({ message: 'Date is required' });

        const records = await Attendance.find({ date }).populate('studentId', 'username');
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Mark or update attendance for a specific date
// @route POST /api/admin/attendance
export const markAttendance = async (req, res) => {
    try {
        const { date, attendanceRecords } = req.body;
        // attendanceRecords = [{ studentId: '...', status: 'present' }, ...]
        if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const updatedRecords = [];

        // Best to use a bulk operation or loop through since it's a small app
        for (let record of attendanceRecords) {
            let att = await Attendance.findOne({ studentId: record.studentId, date });

            if (!record.status) {
                // If it was unmarked (null/undefined), delete any existing record
                if (att) {
                    await Attendance.deleteOne({ _id: att._id });
                }
                continue; // Skip creating or updating
            }

            if (att) {
                // Update existing
                att.status = record.status;
                await att.save();
                updatedRecords.push(att);
            } else {
                // Create new
                att = new Attendance({ studentId: record.studentId, date, status: record.status });
                await att.save();
                updatedRecords.push(att);
            }
        }

        res.status(200).json({ message: 'Attendance updated successfully', records: updatedRecords });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
