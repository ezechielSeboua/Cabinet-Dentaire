// Development
// export const API_URL = "http://localhost:8090/api/v1";

// Deployment
// export const API_URL = "https://cabinetdentaireivoire.com/api/v1";
export const API_URL = "http://95.217.183.200:2000/api/v1";
// export const API_URL = "http://95.217.183.200:2025/api/v1";

const BASE_URL = API_URL.replace("/api/v1", "");

export const TELEGRAM_URL = "https://t.me/cabdentivoire";

// Rewrites any stored file URL (old IP-based or new) to the current domain.
// Extracts the filename and rebuilds: BASE_URL/api/v1/file/<filename>
export const normalizeFileUrl = (url) => {
  if (!url) return url;
  const filename = url.substring(url.lastIndexOf("/") + 1);
  return `${BASE_URL}/api/v1/file/${filename}`;
};
