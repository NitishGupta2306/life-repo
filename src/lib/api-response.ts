import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export class ApiResponseHelper {
  static success<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static error(error: string, statusCode: number = 400): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }

  static created<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        message: message || 'Resource created successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  }

  static noContent(): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: true,
        message: 'Operation completed successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 204 }
    );
  }

  static notFound(message: string = 'Resource not found'): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  }

  static serverError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  static validationError(message: string): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: `Validation error: ${message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 422 }
    );
  }
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiResponse>> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        return ApiResponseHelper.serverError(error.message);
      }
      
      return ApiResponseHelper.serverError();
    }
  };
}