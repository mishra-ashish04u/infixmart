import { NextResponse } from "next/server";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function ok(data, status = 200) {
  return json(data, status);
}

function fail(status, message) {
  return json({ message, error: true, success: false }, status);
}

function handleRouteError(error) {
  if (error instanceof HttpError) {
    return fail(error.status, error.message);
  }

  console.error("[native-api]", error);
  return fail(500, "Internal server error");
}

export { HttpError, fail, handleRouteError, json, ok };
