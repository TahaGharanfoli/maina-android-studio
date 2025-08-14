/* Sonic AI - User Data Helper */
(function (w) {
  const API = 'https://api.seektir.com/v2';

  async function ensureTokenManager(timeoutMs = 4000) {
    const start = Date.now();
    while (!w.tokenManager) {
      if (Date.now() - start > timeoutMs) break;
      await new Promise(r => setTimeout(r, 50));
    }
    if (!w.tokenManager) throw new Error('Token manager not available');
    return w.tokenManager;
  }

  async function fetchUserData() {
    const tm = await ensureTokenManager();

    // Initialize auth check and refresh if needed
    if (!tm.isAuthenticated()) throw new Error('User not authenticated');
    if (tm.isTokenExpired()) {
      try { await tm.refreshAccessToken(); } catch (e) { throw new Error('Unable to refresh token'); }
    }

    // Use built-in authenticated request helper (auto refreshes on 401)
    const json = await tm.makeAuthenticatedRequest('/user-data');
    if (!json.success) throw new Error(json.message || 'Failed to load user data');
    const data = json.data?.data || {};
    try { localStorage.setItem('sonicai.userData', JSON.stringify(data)); } catch {}
    w.dispatchEvent(new CustomEvent('userData:loaded', { detail: data }));
    return data;
  }

  function getCachedUserData() {
    try {
      const s = localStorage.getItem('sonicai.userData');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }

  w.userData = { fetchUserData, getCachedUserData };
})(window);


