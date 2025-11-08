const mongoose = require('mongoose');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const dotenv = require('dotenv');
const path = require('path');

// Load env từ backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Test cases cho RefreshToken
async function testRefreshToken() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công');

        // Tạo user test
        const testUser = new User({
            name: 'Test User',
            email: 'test_refresh@example.com',
            password: 'password123'
        });
        await testUser.save();
        console.log('✅ Đã tạo user test');

        // Test case 1: Tạo refresh token mới
        const newToken = new RefreshToken({
            token: 'test_refresh_token_' + Date.now(),
            userId: testUser._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày
        });
        await newToken.save();
        console.log('✅ Test 1: Tạo refresh token thành công');

        // Test case 2: Tìm token theo userId
        const foundToken = await RefreshToken.findOne({ userId: testUser._id });
        console.log('✅ Test 2: Tìm token theo userId thành công:', foundToken.token);

        // Test case 3: Cập nhật token
        const updatedToken = await RefreshToken.findOneAndUpdate(
            { userId: testUser._id },
            { token: 'updated_token_' + Date.now() },
            { new: true }
        );
        console.log('✅ Test 3: Cập nhật token thành công:', updatedToken.token);

        // Test case 4: Xóa token (logout)
        await RefreshToken.deleteOne({ userId: testUser._id });
        const deletedToken = await RefreshToken.findOne({ userId: testUser._id });
        console.log('✅ Test 4: Xóa token thành công:', deletedToken === null);

        // Clean up
        await User.deleteOne({ _id: testUser._id });
        console.log('✅ Đã xóa dữ liệu test');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Đã đóng kết nối MongoDB');
    }
}

// Chạy test
console.log('🚀 Bắt đầu test RefreshToken...');
testRefreshToken();