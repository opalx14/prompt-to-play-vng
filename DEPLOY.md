# Deploy Echo Relay

Echo Relay là một Next.js app tĩnh ở route `/` và không yêu cầu environment variables.

## Option A — GitHub + Vercel

1. Tạo repository trống trên GitHub.
2. Tại thư mục dự án:

```bash
git add .
git commit -m "Build Echo Relay portfolio game"
git branch -M main
git remote add origin <GITHUB_REPOSITORY_URL>
git push -u origin main
```

3. Mở Vercel và chọn **Add New → Project**.
4. Import GitHub repository.
5. Giữ framework preset là **Next.js**.
6. Không thêm environment variables.
7. Deploy.

Vercel tự nhận các lệnh:

```text
Install: pnpm install
Build:   pnpm build
Output:  Next.js default
```

## Option B — Vercel CLI

Sau khi cài và đăng nhập Vercel CLI:

```bash
pnpm dlx vercel
pnpm dlx vercel --prod
```

## Pre-deploy verification

```bash
pnpm install --frozen-lockfile
pnpm verify
```

Kết quả yêu cầu:

- 7 unit tests passed.
- 6 Chromium E2E tests passed.
- TypeScript passed.
- ESLint passed.
- Production build passed.

## Post-deploy smoke test

- Mở public URL trong cửa sổ ẩn danh.
- Xác nhận Level 1 xuất hiện và Canvas render.
- Chơi hết Level 1.
- Refresh và kiểm tra progress còn lưu.
- Mở Level Select.
- Kiểm tra mobile viewport.
- Chia sẻ URL thử để xác nhận Open Graph image.

## No secrets required

Dự án không dùng Shopify, Liveblocks, database, OpenAI API hoặc API key nào. Không cần tạo `.env` cho production.
