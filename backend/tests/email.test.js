const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

// Load env từ backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmailConfig() {
    try {
        console.log('🚀 Bắt đầu test cấu hình email...\n');

        // Test 1: Kiểm tra biến môi trường
        console.log('Test 1: Kiểm tra biến môi trường email');
        const requiredEnvVars = [
            'EMAIL_HOST',
            'EMAIL_PORT',
            'EMAIL_USER',
            'EMAIL_PASS'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Thiếu các biến môi trường: ${missingVars.join(', ')}`);
        }
        console.log('✅ Đã có đầy đủ biến môi trường email');
        console.log('Email Host:', process.env.EMAIL_HOST);
        console.log('Email Port:', process.env.EMAIL_PORT);
        console.log('Email User:', process.env.EMAIL_USER);
        console.log('Email Pass: [HIDDEN]');

        // Test 2: Tạo transporter
        console.log('\nTest 2: Khởi tạo transporter');
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log('✅ Khởi tạo transporter thành công');

        // Test 3: Verify kết nối
        console.log('\nTest 3: Verify kết nối SMTP');
        await transporter.verify();
        console.log('✅ Kết nối SMTP thành công');

        // Test 4: Gửi email test
        console.log('\nTest 4: Gửi email test');
        const testMailOptions = {
            from: `"Test Reset Password" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Gửi cho chính mình
            subject: 'Test Reset Password - NodeMailer',
            text: 'Đây là email test cho chức năng reset password.',
            html: `
                <h2>Test Reset Password</h2>
                <p>Đây là email test cho chức năng reset password.</p>
                <p>Token giả: <strong>test-reset-token-123</strong></p>
                <p>Link reset giả: <a href="http://localhost:3000/reset-password/test-reset-token-123">http://localhost:3000/reset-password/test-reset-token-123</a></p>
            `
        };

        const info = await transporter.sendMail(testMailOptions);
        console.log('✅ Gửi email test thành công');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

        // Kết luận
        console.log('\n🎉 Tất cả các test đều thành công!');
        console.log('✓ Cấu hình email đầy đủ');
        console.log('✓ Kết nối SMTP thành công');
        console.log('✓ Gửi email test thành công');
        console.log('\n→ Sẵn sàng tích hợp với API /auth/forgot-password');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        if (error.response) {
            console.error('Chi tiết lỗi:', error.response.data);
        }
        process.exit(1);
    }
}

// Chạy test
testEmailConfig();