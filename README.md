# CCAR-P Luyện thi

App React luyện tập 160 câu và thi thử với đề ngẫu nhiên 63 câu. Mỗi câu nhiều đáp án được tính điểm theo tỷ lệ đáp án đúng đã chọn. Tổng điểm được quy đổi sang thang 1000, với ngưỡng đạt 720 điểm. Dùng phím ← hoặc → để chuyển câu trên máy tính. Trên điện thoại, các nút chuyển câu nằm ở đáy màn hình. Tiến độ được lưu trong trình duyệt.

## Chạy trên máy

Với Node.js 22, chạy các lệnh sau rồi mở tệp CCAR-P-Luyen-Thi.html trong trình duyệt.

    npm ci
    npm run build

## Triển khai trên Vercel

Import repo này vào Vercel. Tệp vercel.json cấu hình lệnh build và thư mục xuất dist. Trang luyện thi được phục vụ tại đường dẫn gốc của dự án.
