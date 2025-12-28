import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Hoặc plugin bạn đang dùng

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Thêm đoạn dưới đây vào
    allowedHosts: [
      'host.docker.internal',
      'localhost',
      '.localhost' // Chấp nhận tất cả các sub-domain của localhost
    ]
  }
})