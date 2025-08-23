class ApiResponse{
    constructor(statuscode, data, message = "Success") {
        this.statuscode = statuscode;
        this.data = data;
        this.message = message;
        this.success = statuscode < 400;
    }
}

export {ApiResponse}

/**
 * Standardized API response class.
 * Provides a consistent response structure for successful and failed API calls.
 */