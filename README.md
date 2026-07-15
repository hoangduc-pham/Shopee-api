# Shopee Webhook Railway

Dự án Node.js Express để nhận webhook từ Shopee trên Railway.

## Cài đặt

```bash
npm install
```

## Chạy

```bash
npm start
```

## Cấu hình Shopee

Server hiện dùng mặc định:

```text
PARTNER_ID=2038751
PARTNER_KEY=shpk76484f6c656d46675a745457444e555a73454e694f444b5472785250636e
REDIRECT_URL=https://shopee-api-production.up.railway.app/shopee-webhook
```

Nếu bạn deploy lên Railway, hãy đảm bảo biến môi trường `PARTNER_KEY` được set đúng với key trên.

Webhook endpoint:

```text
POST /shopee-webhook
```
