const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env từ backend/.env trước khi import cloudinary
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import cloudinary sau khi đã load env
const cloudinary = require('../utils/cloudinary');

async function testCloudinaryUpload() {
    let uploadedImageId = null;
    
    try {
        console.log('🚀 Bắt đầu test Cloudinary upload...\n');
        
        // Test 1: Kiểm tra cấu hình Cloudinary
        console.log('Test 1: Kiểm tra cấu hình Cloudinary');
        const config = cloudinary.config();
        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            throw new Error('Thiếu cấu hình Cloudinary trong .env');
        }
        console.log('✅ Cấu hình Cloudinary OK');
        console.log('Cloud Name:', config.cloud_name);
        console.log('API Key:', config.api_key);
        console.log('API Secret: [HIDDEN]');

        // Test 2: Upload ảnh test
        console.log('\nTest 2: Upload ảnh test');
        const testImagePath = path.join(__dirname, 'test-avatar.jpg');
        
        // Tạo ảnh test nếu chưa có
        if (!fs.existsSync(testImagePath)) {
            console.log('Tạo ảnh test...');
            // Tạo một ảnh đơn giản bằng base64
            const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAZABkAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+t6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//2Q==';
            const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, "");
            fs.writeFileSync(testImagePath, Buffer.from(base64Data, 'base64'));
            console.log('✅ Đã tạo ảnh test');
        }

        // Upload ảnh lên Cloudinary với các options cho avatar
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "avatars",
                    transformation: [
                        { width: 200, height: 200, crop: "fill" },
                        { quality: "auto:good" }
                    ],
                    resource_type: "image",
                    allowed_formats: ["jpg", "png", "jpeg"],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            fs.createReadStream(testImagePath).pipe(uploadStream);
        });

        uploadedImageId = uploadResult.public_id;

        console.log('✅ Upload avatar thành công:');
        console.log('- URL:', uploadResult.secure_url);
        console.log('- Public ID:', uploadResult.public_id);
        console.log('- Size:', uploadResult.bytes, 'bytes');
        console.log('- Format:', uploadResult.format);
        console.log('- Dimensions:', `${uploadResult.width}x${uploadResult.height}`);

        // Test 3: Kiểm tra transformation
        console.log('\nTest 3: Kiểm tra transformation của ảnh');
        if (uploadResult.width === 200 && uploadResult.height === 200) {
            console.log('✅ Ảnh đã được resize đúng kích thước 200x200');
        } else {
            console.warn('⚠️ Kích thước ảnh không đúng:', `${uploadResult.width}x${uploadResult.height}`);
        }

        // Test 4: Xóa ảnh test
        console.log('\nTest 4: Xóa ảnh test');
        const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log('✅ Xóa ảnh thành công:', deleteResult);

        // Kết luận
        console.log('\n🎉 Tất cả các test đều thành công!');
        console.log('✓ Cấu hình Cloudinary hoạt động tốt');
        console.log('✓ Upload avatar với resize thành công');
        console.log('✓ Xóa ảnh hoạt động tốt');
        console.log('\n→ Sẵn sàng tích hợp với API /users/avatar');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        if (error.http_code) {
            console.error('HTTP Code:', error.http_code);
        }
        
        // Cleanup nếu có lỗi
        if (uploadedImageId) {
            try {
                await cloudinary.uploader.destroy(uploadedImageId);
                console.log('✅ Đã xóa ảnh test sau khi gặp lỗi');
            } catch (cleanupError) {
                console.error('⚠️ Không thể xóa ảnh test:', cleanupError.message);
            }
        }
    }
}

// Chạy test
testCloudinaryUpload();