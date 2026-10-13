import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DUPLICATE_REGISTRATION"
  | "EVENT_FULL"
  | "EVENT_NOT_PUBLISHED"
  | "VENUE_CONFLICT"
  | "INVALID_TICKET"
  | "DUPLICATE_CHECKIN"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required. Please log in.") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class DuplicateRegistrationError extends AppError {
  constructor(message = "You are already registered for this event.") {
    super(message, 409, "DUPLICATE_REGISTRATION");
  }
}

export class EventFullError extends AppError {
  constructor(message = "This event has reached maximum seating capacity.") {
    super(message, 409, "EVENT_FULL");
  }
}

export class VenueConflictError extends AppError {
  constructor(
    message = "The selected venue has a scheduling conflict with another active event during this time interval."
  ) {
    super(message, 409, "VENUE_CONFLICT");
  }
}

export class InvalidTicketError extends AppError {
  constructor(message = "Invalid or unrecognized ticket token.") {
    super(message, 400, "INVALID_TICKET");
  }
}

export class DuplicateCheckInError extends AppError {
  constructor(message = "This attendee has already been checked into the event.") {
    super(message, 409, "DUPLICATE_CHECKIN");
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: { timestamp },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const formatted = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: formatted,
        },
        meta: { timestamp },
      },
      { status: 422 }
    );
  }

  // Never expose internal stack traces or database connection strings to the client
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred. Please try again later.",
      },
      meta: { timestamp },
    },
    { status: 500 }
  );
}

export function jsonResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    },
    { status }
  );
}
