const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint nhận Callback từ Shopee
app.post('/shopee-webhook', (req, res) => {
    const body = req.body;

    // LƯU Ý 1: Bước xác thực URL từ Shopee Open Platform
    // Shopee sẽ gửi một field tên là "code" để kiểm tra xem webhook có hoạt động không
    if (body && body.code) {
        console.log('👉 Đang xác thực URL với Shopee. Code nhận được:', body.code);

        // Trả về đúng cấu trúc Shopee yêu cầu để hoàn tất xác thực
        return res.status(200).json({
            code: body.code
        });
    }

    // LƯU Ý 2: Xử lý dữ liệu thông báo thực tế từ Shopee (khi có đơn hàng, cập nhật kho...)
    console.log('📦 Nhận thông báo thực tế từ Shopee:', body);

    // Xử lý logic của bạn ở đây (Ví dụ: kiểm tra body.data, body.event_type...)

    // Luôn trả về 200 OK cho Shopee sau khi nhận dữ liệu thành công
    return res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Server Shopee Webhook đang chạy trên cổng ${PORT}`);
});
