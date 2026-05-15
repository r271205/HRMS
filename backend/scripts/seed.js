/**
 * Seeds an admin user and sample employees for local/demo use.
 * Run: npm run seed (from backend folder)
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import { connectDB } from '../config/db.js';

const SAMPLE = [
  {
    fullName: 'Aisha Khan',
    email: 'aisha@hrms.demo',
    phone: '+1 555-0101',
    department: 'Engineering',
    designation: 'Senior Developer',
    role: 'Individual Contributor',
    joiningDate: new Date('2022-03-15'),
    salary: 92000,
    status: 'active',
  },
  {
    fullName: 'Marcus Chen',
    email: 'marcus@hrms.demo',
    phone: '+1 555-0102',
    department: 'Product',
    designation: 'Product Manager',
    role: 'Lead',
    joiningDate: new Date('2021-08-01'),
    salary: 105000,
    status: 'active',
  },
  {
    fullName: 'Elena Rossi',
    email: 'elena@hrms.demo',
    phone: '+1 555-0103',
    department: 'People & Culture',
    designation: 'HR Specialist',
    role: 'HR',
    joiningDate: new Date('2023-01-10'),
    salary: 68000,
    status: 'active',
  },
];

async function run() {
  await connectDB();
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@hrms.demo').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const empPassword = process.env.SEED_EMPLOYEE_PASSWORD || 'Employee@123';

  await Promise.all([Attendance.deleteMany({}), Leave.deleteMany({})]);

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    admin = await User.create({
      email: adminEmail,
      password: hashed,
      role: 'admin',
      avatar: '',
      employee: null,
    });
    console.log('Created admin:', adminEmail, '/', adminPassword);
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  /**
   * Primary owner account (your login). Override with SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD in .env
   * Re-run seed to reset password if you forget it.
   */
  const ownerEmail = (process.env.SEED_OWNER_EMAIL || 'rajan@gmail.com').toLowerCase().trim();
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'Rajan@123';
  const ownerHashed = await bcrypt.hash(ownerPassword, 12);
  let ownerUser = await User.findOne({ email: ownerEmail });
  if (!ownerUser) {
    await User.create({
      email: ownerEmail,
      password: ownerHashed,
      role: 'admin',
      avatar: '',
      employee: null,
    });
    console.log('Created owner admin:', ownerEmail, '/', ownerPassword);
  } else {
    ownerUser.password = ownerHashed;
    ownerUser.role = 'admin';
    await ownerUser.save();
    console.log('Reset owner admin password:', ownerEmail, '/', ownerPassword);
  }

  for (const row of SAMPLE) {
    const email = row.email.toLowerCase();
    let user = await User.findOne({ email });
    if (user) {
      console.log('Skip existing user:', email);
      continue;
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const hashed = await bcrypt.hash(empPassword, 12);
      const [u] = await User.create(
        [{ email, password: hashed, role: 'employee', avatar: '', employee: null }],
        { session }
      );
      const [e] = await Employee.create(
        [
          {
            user: u._id,
            fullName: row.fullName,
            email,
            phone: row.phone,
            department: row.department,
            designation: row.designation,
            role: row.role,
            joiningDate: row.joiningDate,
            salary: row.salary,
            profileImage: '',
            status: row.status,
          },
        ],
        { session }
      );
      u.employee = e._id;
      await u.save({ session });
      await session.commitTransaction();
      console.log('Created employee:', email, '/', empPassword);
    } catch (err) {
      await session.abortTransaction();
      console.error(err.message);
    } finally {
      session.endSession();
    }
  }

  console.log('\nSeed complete. Demo logins:');
  console.log('  Owner:   ', ownerEmail, '/', ownerPassword);
  console.log('  Admin:   ', adminEmail, '/', adminPassword);
  console.log('  Employee:', SAMPLE[0].email, '/', empPassword);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
