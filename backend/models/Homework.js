import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    }
}, { timestamps: true });

export default mongoose.model('Homework', homeworkSchema);
