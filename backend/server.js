const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
// Fail fast with a clear message when MONGO_URI is not set
if (!process.env.MONGO_URI) {
    console.error('❌ Environment variable MONGO_URI is not set.');
    console.error('Create a .env file in the backend folder with:');
    console.error('  MONGO_URI=your-mongodb-connection-string');
    console.error('You can copy backend/.env.example and fill it in.');
    process.exit(1);
}
const app = express();
app.use(express.json());

// import route
const userRoutes = require('./routes/user');
app.use('/users', userRoutes); // prefix /users

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

