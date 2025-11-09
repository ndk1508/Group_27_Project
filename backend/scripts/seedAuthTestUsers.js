const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: __dirname + '/../.env' });

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/test';
  // Use default mongoose connection options (newer drivers ignore legacy flags)
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for seeding:', mongoUri);

  const users = [
    { name: 'Admin User', email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
    { name: 'Regular User', email: 'user@example.com', password: 'User123!', role: 'user' },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User ${u.email} already exists, skipping`);
      continue;
    }

    const hashed = await bcrypt.hash(u.password, 10);
    const newUser = new User({ name: u.name, email: u.email, password: hashed, role: u.role });
    await newUser.save();
    console.log(`Created user ${u.email} with password: ${u.password}`);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seeder error:', err);
  process.exit(1);
});
