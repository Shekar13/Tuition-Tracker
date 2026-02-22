import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    createStudent,
    getStudents,
    uploadHomework,
    getHomeworks,
    getHomeworkSubmissions,
    updateSubmissionStatus,
    deleteStudent,
    getStudentSubmissions,
    getAttendanceByDate,
    markAttendance
} from '../controllers/adminController.js';

const router = express.Router();

router.route('/students')
    .post(protect, adminOnly, createStudent)
    .get(protect, adminOnly, getStudents);

router.route('/students/:id')
    .delete(protect, adminOnly, deleteStudent);

router.route('/students/:id/submissions')
    .get(protect, adminOnly, getStudentSubmissions);

router.route('/homework')
    .post(protect, adminOnly, uploadHomework)
    .get(protect, adminOnly, getHomeworks);

router.route('/homework/:id/submissions')
    .get(protect, adminOnly, getHomeworkSubmissions);

router.route('/submissions/:id')
    .put(protect, adminOnly, updateSubmissionStatus);

router.route('/attendance')
    .get(protect, adminOnly, getAttendanceByDate)
    .post(protect, adminOnly, markAttendance);

export default router;
