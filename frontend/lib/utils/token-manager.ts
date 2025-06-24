/**
 * Token Manager - Quản lý JWT tokens và xử lý expiry
 */

export interface TokenInfo {
  token: string;
  refreshToken: string;
  expiresIn: number;
  timestamp: number;
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly EXPIRES_IN_KEY = "token_expires_in";
  private static readonly TIMESTAMP_KEY = "token_timestamp";

  // Thời gian trước khi hết hạn để refresh (5 phút)
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000;

  private static refreshPromise: Promise<void> | null = null;

  /**
   * Lưu thông tin token
   */
  static setTokens(tokenInfo: TokenInfo): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenInfo.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenInfo.refreshToken);
    localStorage.setItem(this.EXPIRES_IN_KEY, tokenInfo.expiresIn.toString());
    localStorage.setItem(this.TIMESTAMP_KEY, tokenInfo.timestamp.toString());
  }

  /**
   * Lấy access token
   */
  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Lấy refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Lấy thông tin token đầy đủ
   */
  static getTokenInfo(): TokenInfo | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const expiresIn = localStorage.getItem(this.EXPIRES_IN_KEY);
    const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);

    if (!token || !refreshToken || !expiresIn || !timestamp) {
      return null;
    }

    return {
      token,
      refreshToken,
      expiresIn: parseInt(expiresIn),
      timestamp: parseInt(timestamp),
    };
  }

  /**
   * Xóa tất cả tokens
   */
  static clearTokens(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_IN_KEY);
    localStorage.removeItem(this.TIMESTAMP_KEY);
  }

  /**
   * Kiểm tra token có hết hạn không
   */
  static isTokenExpired(): boolean {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo) return true;

    const now = Date.now();
    const tokenAge = now - tokenInfo.timestamp;
    const expiryTime = tokenInfo.expiresIn * 1000;

    return tokenAge >= expiryTime;
  }

  /**
   * Kiểm tra token sắp hết hạn (trong vòng 5 phút)
   */
  static isTokenNearExpiry(): boolean {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo) return true;

    const now = Date.now();
    const tokenAge = now - tokenInfo.timestamp;
    const expiryTime = tokenInfo.expiresIn * 1000;

    return tokenAge >= expiryTime - this.REFRESH_THRESHOLD;
  }

  /**
   * Lấy thời gian còn lại trước khi hết hạn (milliseconds)
   */
  static getTimeUntilExpiry(): number {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo) return 0;

    const now = Date.now();
    const tokenAge = now - tokenInfo.timestamp;
    const expiryTime = tokenInfo.expiresIn * 1000;

    return Math.max(0, expiryTime - tokenAge);
  }

  /**
   * Format thời gian còn lại thành chuỗi dễ đọc
   */
  static formatTimeUntilExpiry(): string {
    const timeLeft = this.getTimeUntilExpiry();

    if (timeLeft === 0) return "Đã hết hạn";

    const minutes = Math.floor(timeLeft / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    if (minutes > 0) return `${minutes} phút`;

    return "Dưới 1 phút";
  }

  /**
   * Tạo custom event khi token hết hạn
   */
  static dispatchTokenExpiredEvent(
    message: string = "Phiên đăng nhập đã hết hạn"
  ): void {
    if (typeof window === "undefined") return;

    const event = new CustomEvent("tokenExpired", {
      detail: {
        message,
        redirectDelay: 3000,
        timeExpired: new Date().toISOString(),
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * Đảm bảo chỉ có một request refresh tại một thời điểm
   */
  static async ensureSingleRefresh(
    refreshFunction: () => Promise<void>
  ): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = refreshFunction().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  /**
   * Bắt đầu theo dõi token expiry trong background
   */
  static startTokenMonitoring(
    onNearExpiry?: () => void,
    onExpired?: () => void,
    checkInterval: number = 60000 // Check mỗi phút
  ): NodeJS.Timeout | null {
    if (typeof window === "undefined") return null;

    return setInterval(() => {
      if (this.isTokenExpired()) {
        onExpired?.();
        this.dispatchTokenExpiredEvent();
      } else if (this.isTokenNearExpiry()) {
        onNearExpiry?.();
      }
    }, checkInterval);
  }

  /**
   * Debug info về token
   */
  static getDebugInfo(): object {
    const tokenInfo = this.getTokenInfo();

    if (!tokenInfo) {
      return { status: "No tokens found" };
    }

    return {
      hasToken: !!tokenInfo.token,
      hasRefreshToken: !!tokenInfo.refreshToken,
      tokenLength: tokenInfo.token.length,
      expiresIn: `${tokenInfo.expiresIn} seconds`,
      timeUntilExpiry: this.formatTimeUntilExpiry(),
      isExpired: this.isTokenExpired(),
      isNearExpiry: this.isTokenNearExpiry(),
      timestamp: new Date(tokenInfo.timestamp).toISOString(),
    };
  }
}
