const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env từ backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleUsers = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin'
    },
    {
        name: 'Moderator User',
        email: 'mod@example.com',
        password: 'Mod@123',
        role: 'moderator'
    },
    {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'User@123',
        role: 'user'
    }
];

async function seedUsers() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công');

        // Xóa tất cả users hiện tại
        await User.deleteMany({});
        console.log('✅ Đã xóa dữ liệu users cũ');

        // Hash passwords và tạo users mới
        const hashedUsers = await Promise.all(sampleUsers.map(async user => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return {
                ...user,
                password: hashedPassword
            };
        }));

        // Thêm users mới
        const createdUsers = await User.insertMany(hashedUsers);
        console.log('✅ Đã tạo users mẫu:', createdUsers.map(u => ({
            name: u.name,
            email: u.email,
            role: u.role
        })));

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Đã đóng kết nối MongoDB');
    }
}

// Chạy seeder
console.log('🚀 Bắt đầu tạo dữ liệu mẫu...');
seedUsers();