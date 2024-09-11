declare global {
    namespace Express {
        interface Response {
            sendJson(data: unknown): this;
        }
    }
}

export {};