export class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  error?: any;

  constructor(success: boolean, message: string, data: T, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    if (error) {
      this.error = error;
    }
  }

  static success<T>(data: T, message = 'Operation successful') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error?: any) {
    return {
      success: false,
      message,
      error: error || null,
      timestamp: new Date().toISOString(),
    };
  }
}
