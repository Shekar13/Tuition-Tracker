import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD format for easy querying
        required: true,
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true,
    }
}, { timestamps: true });

// Ensure a student only has one attendance record per date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
