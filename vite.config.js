import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  server: {
    host: true,
    port: 3000,
    allowedHosts: ["cabinet-dentaire-ivoire.local"],
    proxy: {
      "/api/v1": {
        target: "http://localhost:8090",
        changeOrigin: true,
        secure: false, // Set to false if your backend is not using HTTPS

        // --- ADVANCED CONFIGURATION TO FIX HEADER ISSUES ---
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // This event fires right before the request is sent to your backend.
            // We can manually set headers here.

            // Log the host header to see what's being sent.
            console.log(
              "Proxying request with Host header:",
              proxyReq.getHeader("host")
            );

            // Forcefully set the Host and Referer to match the backend target.
            // This makes the request look like it originated from the backend itself.
            proxyReq.setHeader("Host", "localhost:8090");
            proxyReq.setHeader("Referer", "http://localhost:8090/");
          });

          proxy.on("error", (err, req, res) => {
            // Log any errors that the proxy itself encounters.
            console.error("Proxy Error:", err);
          });
        },
      },
    },
  },

  // Note: This theme block doesn't belong in vite.config.js
  // It should be in your tailwind.config.js file. I'm leaving it
  // here since it was in your original, but it has no effect here.
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
      },
    },
  },
});
