declare global {
    namespace Express {
        interface Response {
            sendJson(error_code?: unknown, status?: number , message?: unknown,data?: unknown): this;
        }
    }
}

export {};