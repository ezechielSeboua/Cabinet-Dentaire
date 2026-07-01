// authHeader.js
export function AuthHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return {};
  }

  // Try different response structure formats
  let token = null;

  // Format 1: { body: { accessToken: "..." } }
  if (user.body?.accessToken) {
    token = user.body.accessToken;
  }
  // Format 2: { accessToken: "..." }
  else if (user.accessToken) {
    token = user.accessToken;
  }
  // Format 3: { token: "..." }
  else if (user.token) {
    token = user.token;
  }
  // Format 4: Backend returned just { token: "..." }
  else if (user.data?.accessToken) {
    token = user.data.accessToken;
  }

  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
