import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'student',
    },
    streak: {
        type: Number,
        default: 0,
    },
    rank: {
        type: Number,
        default: 1, // Optional: higher numbers or lower numbers to represent rank.
    },
    completedHomeworks: {
        type: Number,
        default: 0,
    },
    totalHomeworksAssigned: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for percentage
studentSchema.virtual('percentage').get(function () {
    if (this.totalHomeworksAssigned === 0) return 100; // default 100% if no HW given
    return Math.round((this.completedHomeworks / this.totalHomeworksAssigned) * 100);
});

export default mongoose.model('Student', studentSchema);
