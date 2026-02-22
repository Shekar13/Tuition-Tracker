import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    homeworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'done', 'not done'],
        default: 'pending',
    },
    remark: {
        type: String,
        default: '',
    },
}, { timestamps: true });

// Ensure one submission per student per homework
submissionSchema.index({ studentId: 1, homeworkId: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
