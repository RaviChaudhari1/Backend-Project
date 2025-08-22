class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null // ??
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError };


/**
 * Custom error class for handling API-related errors.
 * Extends the native JavaScript `Error` object with additional properties
 * useful for API error responses.
 */