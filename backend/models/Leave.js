import mongoose from 'mongoose';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Paid Leave'];

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveType: {
      type: String,
      enum: LEAVE_TYPES,
      required: [true, 'Leave type is required'],
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: [true, 'Reason is required'], trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNote: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

leaveSchema.index({ status: 1, createdAt: -1 });
leaveSchema.index({ employee: 1, fromDate: 1 });

export default mongoose.model('Leave', leaveSchema);
export { LEAVE_TYPES };
