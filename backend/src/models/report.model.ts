import mongoose from "mongoose"

export type ReportType = {
    number: number;
    type: string;
    summary: string;
    updates:boolean;
    progress:boolean;
    modifier: {
        userId: string;
        modifiedAt: Date
    },
    createdAt: Date
    closedAt: Date
    isClosed: boolean
}

const reportSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    type: { type: String, required: true },
    summary: { type: String, required: true },
    updates: { type: Boolean, default: false },
    progress: { type: Boolean, default: false },
    modifiers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        modifiedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    isClosed: { type: Boolean, default: false },
});

const Report = mongoose.model<ReportType>('Report', reportSchema);

export default Report;