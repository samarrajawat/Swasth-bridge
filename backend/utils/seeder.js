const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');
const MedicineInventory = require('../models/MedicineInventory');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB for seeding...');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Bed.deleteMany({});
  await MedicineInventory.deleteMany({});

  const salt = await bcrypt.genSalt(10);

  // Create Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@swasthbridge.com',
    password: await bcrypt.hash('admin123', salt),
    role: 'admin',
    phone: '9000000001',
  });

  // Create Doctors
  const doctorUsers = await User.insertMany([
    { name: 'Dr. Priya Sharma', email: 'priya@swasthbridge.com', password: await bcrypt.hash('doctor123', salt), role: 'doctor', phone: '9000000002' },
    { name: 'Dr. Rajesh Kumar', email: 'rajesh@swasthbridge.com', password: await bcrypt.hash('doctor123', salt), role: 'doctor', phone: '9000000003' },
    { name: 'Dr. Anita Patel', email: 'anita@swasthbridge.com', password: await bcrypt.hash('doctor123', salt), role: 'doctor', phone: '9000000004' },
    { name: 'Dr. Vikram Singh', email: 'vikram@swasthbridge.com', password: await bcrypt.hash('doctor123', salt), role: 'doctor', phone: '9000000005' },
    { name: 'Dr. Meera Nair', email: 'meera@swasthbridge.com', password: await bcrypt.hash('doctor123', salt), role: 'doctor', phone: '9000000006' },
  ]);

  const doctorData = [
    { user_id: doctorUsers[0]._id, specialization: 'Cardiology', qualification: 'MD Cardiology', experience: 12, consultation_fee: 600, rating: 4.8 },
    { user_id: doctorUsers[1]._id, specialization: 'Orthopedics', qualification: 'MS Ortho', experience: 8, consultation_fee: 500, rating: 4.6 },
    { user_id: doctorUsers[2]._id, specialization: 'Pediatrics', qualification: 'MD Pediatrics', experience: 10, consultation_fee: 400, rating: 4.9 },
    { user_id: doctorUsers[3]._id, specialization: 'Neurology', qualification: 'DM Neurology', experience: 15, consultation_fee: 700, rating: 4.7 },
    { user_id: doctorUsers[4]._id, specialization: 'Dermatology', qualification: 'MD Dermatology', experience: 6, consultation_fee: 350, rating: 4.5 },
  ];

  await Doctor.insertMany(doctorData);

  // Create Patient
  await User.create({
    name: 'Test Patient',
    email: 'patient@swasthbridge.com',
    password: await bcrypt.hash('patient123', salt),
    role: 'patient',
    phone: '9000000010',
    age: 28,
    gender: 'Male',
  });

  // Create Beds
  const beds = [];
  const wardConfig = [
    { ward: 'ICU', type: 'ICU', floor: 1, count: 10 },
    { ward: 'General Ward A', type: 'General', floor: 2, count: 20 },
    { ward: 'General Ward B', type: 'General', floor: 3, count: 15 },
    { ward: 'Private Ward', type: 'Private', floor: 4, count: 10 },
    { ward: 'Emergency', type: 'Emergency', floor: 1, count: 5 },
  ];

  let bedNum = 1;
  for (const wc of wardConfig) {
    for (let i = 0; i < wc.count; i++) {
      beds.push({
        bed_number: `BED-${String(bedNum).padStart(3, '0')}`,
        type: wc.type,
        ward: wc.ward,
        floor: wc.floor,
        status: Math.random() < 0.4 ? 'Occupied' : 'Available',
      });
      bedNum++;
    }
  }
  await Bed.insertMany(beds);

  // Create Medicines
  await MedicineInventory.insertMany([
    { medicine_name: 'Paracetamol 500mg', category: 'Tablet', quantity: 500, expiry_date: new Date('2026-12-01'), price: 2, threshold: 50, manufacturer: 'Cipla', batch_number: 'BT001' },
    { medicine_name: 'Amoxicillin 250mg', category: 'Capsule', quantity: 15, expiry_date: new Date('2026-08-01'), price: 8, threshold: 30, manufacturer: 'Sun Pharma', batch_number: 'BT002' },
    { medicine_name: 'Aspirin 75mg', category: 'Tablet', quantity: 200, expiry_date: new Date('2025-12-01'), price: 3, threshold: 40, manufacturer: 'Bayer', batch_number: 'BT003' },
    { medicine_name: 'Metformin 500mg', category: 'Tablet', quantity: 10, expiry_date: new Date('2026-10-01'), price: 5, threshold: 50, manufacturer: 'USV', batch_number: 'BT004' },
    { medicine_name: 'Atorvastatin 10mg', category: 'Tablet', quantity: 300, expiry_date: new Date('2027-03-01'), price: 12, threshold: 30, manufacturer: 'Ranbaxy', batch_number: 'BT005' },
    { medicine_name: 'Cough Syrup 100ml', category: 'Syrup', quantity: 80, expiry_date: new Date('2026-06-01'), price: 45, threshold: 20, manufacturer: 'Himalaya', batch_number: 'BT006' },
    { medicine_name: 'Insulin 10ml', category: 'Injection', quantity: 5, expiry_date: new Date('2026-04-01'), price: 180, threshold: 10, manufacturer: 'Novo Nordisk', batch_number: 'BT007' },
    { medicine_name: 'Azithromycin 500mg', category: 'Tablet', quantity: 120, expiry_date: new Date('2026-09-01'), price: 25, threshold: 20, manufacturer: 'Abbott', batch_number: 'BT008' },
    { medicine_name: 'Omeprazole 20mg', category: 'Capsule', quantity: 250, expiry_date: new Date('2027-01-01'), price: 6, threshold: 30, manufacturer: 'Zydus', batch_number: 'BT009' },
    { medicine_name: 'Dolo 650mg', category: 'Tablet', quantity: 8, expiry_date: new Date('2026-11-01'), price: 3, threshold: 50, manufacturer: 'Micro Labs', batch_number: 'BT010' },
  ]);

  console.log('✅ Seed data inserted successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin   → admin@swasthbridge.com     / admin123');
  console.log('  Doctor  → priya@swasthbridge.com     / doctor123');
  console.log('  Patient → patient@swasthbridge.com   / patient123');
  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
