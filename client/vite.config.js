import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	define: {
		"process.env": {},
	},
	server: {
    host: true, // or '0.0.0.0' to listen on all addresses
    allowedHosts: true // Needed if you are using specific hostnames/DNS
  }
});
