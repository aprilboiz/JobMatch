/**
 * Token Management Test Script
 *
 * Chạy trong Developer Console để test các tính năng xử lý token
 */

window.TokenTestUtils = {
  /**
   * Tạo một token giả với thời gian hết hạn tùy chỉnh
   */
  createTestToken(expiresInSeconds = 300) {
    const fakeToken =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNjQwOTk1MjAwfQ.test_signature";
    const fakeRefreshToken = "refresh_token_" + Date.now();

    localStorage.setItem("access_token", fakeToken);
    localStorage.setItem("refresh_token", fakeRefreshToken);
    localStorage.setItem("token_expires_in", expiresInSeconds.toString());
    localStorage.setItem("token_timestamp", Date.now().toString());

    console.log("✅ Test token created:", {
      expiresIn: expiresInSeconds + " seconds",
      willExpireAt: new Date(
        Date.now() + expiresInSeconds * 1000
      ).toLocaleString(),
    });
  },

  /**
   * Tạo token sắp hết hạn (còn 2 phút)
   */
  createNearExpiryToken() {
    this.createTestToken(120); // 2 minutes
    console.log("⚠️ Near expiry token created (2 minutes remaining)");
  },

  /**
   * Tạo token đã hết hạn
   */
  createExpiredToken() {
    this.createTestToken(-60); // Already expired 1 minute ago
    console.log("❌ Expired token created");
  },

  /**
   * Tạo token với thời gian dài
   */
  createLongLivedToken() {
    this.createTestToken(3600); // 1 hour
    console.log("✅ Long-lived token created (1 hour)");
  },

  /**
   * Xóa tất cả tokens
   */
  clearAllTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_in");
    localStorage.removeItem("token_timestamp");
    console.log("🗑️ All tokens cleared");
  },

  /**
   * Hiển thị thông tin token hiện tại
   */
  showTokenInfo() {
    const tokenInfo = {
      accessToken: localStorage.getItem("access_token"),
      refreshToken: localStorage.getItem("refresh_token"),
      expiresIn: localStorage.getItem("token_expires_in"),
      timestamp: localStorage.getItem("token_timestamp"),
    };

    if (tokenInfo.timestamp && tokenInfo.expiresIn) {
      const tokenAge = Date.now() - parseInt(tokenInfo.timestamp);
      const expiryTime = parseInt(tokenInfo.expiresIn) * 1000;
      const timeUntilExpiry = expiryTime - tokenAge;

      tokenInfo.tokenAge = Math.floor(tokenAge / 1000) + " seconds";
      tokenInfo.timeUntilExpiry =
        Math.floor(timeUntilExpiry / 1000) + " seconds";
      tokenInfo.isExpired = timeUntilExpiry <= 0;
      tokenInfo.isNearExpiry = timeUntilExpiry <= 5 * 60 * 1000; // 5 minutes
    }

    console.table(tokenInfo);
    return tokenInfo;
  },

  /**
   * Test token expiry event
   */
  triggerTokenExpiredEvent() {
    const event = new CustomEvent("tokenExpired", {
      detail: {
        message: "Test token expiry event",
        redirectDelay: 3000,
      },
    });
    window.dispatchEvent(event);
    console.log("🔔 Token expired event dispatched");
  },

  /**
   * Test auto-refresh by creating near expiry token
   */
  testAutoRefresh() {
    // Create token that will trigger auto-refresh (4 minutes remaining)
    this.createTestToken(240);
    console.log(
      "🔄 Auto-refresh test setup - token will trigger refresh in next check"
    );
    console.log("Watch for refresh attempts in console...");
  },

  /**
   * Simulate network error for refresh
   */
  simulateRefreshError() {
    // Override fetch temporarily
    const originalFetch = window.fetch;
    window.fetch = function (url, options) {
      if (url.includes("/auth/refresh")) {
        console.log("🚫 Simulating refresh error");
        return Promise.reject(new Error("Simulated network error"));
      }
      return originalFetch.apply(this, arguments);
    };

    // Create expired token to trigger refresh
    this.createExpiredToken();

    // Restore fetch after 5 seconds
    setTimeout(() => {
      window.fetch = originalFetch;
      console.log("✅ Fetch restored");
    }, 5000);
  },

  /**
   * Reload page (useful after token changes)
   */
  reloadPage() {
    console.log("🔄 Reloading page...");
    window.location.reload();
  },

  /**
   * Run comprehensive test suite
   */
  runTestSuite() {
    console.log("🧪 Starting Token Management Test Suite");
    console.log("=====================================");

    // Test 1: Show current state
    console.log("\n1. Current token state:");
    this.showTokenInfo();

    // Test 2: Create and show long-lived token
    console.log("\n2. Testing long-lived token:");
    this.createLongLivedToken();
    this.showTokenInfo();

    // Test 3: Near expiry token
    console.log("\n3. Testing near expiry token:");
    this.createNearExpiryToken();
    this.showTokenInfo();

    // Test 4: Expired token
    console.log("\n4. Testing expired token:");
    this.createExpiredToken();
    this.showTokenInfo();

    // Test 5: Clear tokens
    console.log("\n5. Testing token clearing:");
    this.clearAllTokens();
    this.showTokenInfo();

    console.log("\n✅ Test suite completed");
    console.log("📋 Available methods:", Object.keys(this));
  },

  /**
   * Help/Usage information
   */
  help() {
    console.log(`
🔧 Token Test Utils - Available Methods:

Basic Operations:
- TokenTestUtils.showTokenInfo()           // Show current token state
- TokenTestUtils.clearAllTokens()          // Clear all tokens
- TokenTestUtils.reloadPage()              // Reload page

Token Creation:
- TokenTestUtils.createTestToken(seconds)  // Create token with custom expiry
- TokenTestUtils.createLongLivedToken()    // Create 1-hour token
- TokenTestUtils.createNearExpiryToken()   // Create token expiring in 2 min
- TokenTestUtils.createExpiredToken()      // Create already expired token

Testing:
- TokenTestUtils.testAutoRefresh()         // Test auto-refresh behavior
- TokenTestUtils.triggerTokenExpiredEvent() // Trigger expiry event
- TokenTestUtils.simulateRefreshError()    // Test error handling
- TokenTestUtils.runTestSuite()            // Run all tests

Examples:
TokenTestUtils.createTestToken(60);        // Token expires in 1 minute
TokenTestUtils.showTokenInfo();            // Check current state
TokenTestUtils.reloadPage();               // Apply changes
    `);
  },
};

// Auto-run help on load
console.log("🚀 Token Test Utils loaded!");
console.log('Type "TokenTestUtils.help()" for usage information');
console.log('Type "TokenTestUtils.runTestSuite()" to run all tests');

// Export for easier access
window.TT = window.TokenTestUtils;
