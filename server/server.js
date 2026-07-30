const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let mongoServer;

async function connectDatabase() {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected to provided URI');
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected to in-memory server');
}

connectDatabase().catch((err) => {
  console.error('MongoDB error:', err);
  process.exit(1);
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  className: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, trim: true },
  schoolName: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/students', [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('fatherName').trim().isLength({ min: 2, max: 80 }).withMessage('Father name must be between 2 and 80 characters'),
  body('age').isInt({ min: 3, max: 25 }).withMessage('Age must be between 3 and 25'),
  body('className').trim().isLength({ min: 1, max: 20 }).withMessage('Class is required'),
  body('mobileNumber').trim().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
  body('schoolName').trim().isLength({ min: 2, max: 120 }).withMessage('School name must be between 2 and 120 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }

  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: 'Registration successful', student });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load students', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
