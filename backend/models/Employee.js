import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: '', trim: true },
    department: { type: String, required: [true, 'Department is required'], trim: true },
    designation: { type: String, required: [true, 'Designation is required'], trim: true },
    /** Job / organizational role (distinct from account role on User) */
    role: { type: String, default: 'Staff', trim: true },
    joiningDate: { type: Date, required: [true, 'Joining date is required'] },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
      default: 0,
    },
    profileImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
    },
  },
  { timestamps: true }
);

employeeSchema.index({ fullName: 'text', email: 1, department: 1 });

export default mongoose.model('Employee', employeeSchema);
