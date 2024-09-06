import path from 'path';
import dotenv from 'dotenv-safe';

dotenv.config({
    path: path.join(__dirname, '../../.env'),
    sample: path.join(__dirname, '../../.env.example'),
});

export const PORT: number = parseInt(process.env.PORT) || 3000;
export const MONGODB_URL: string = process.env.MONGODB_URI;
export const ACCESS_TOKEN: string = process.env.ACCESS_TOKEN;
export const REFETCH_TOKEN: string = process.env.REFETCH_TOKEN;
export const REDIS_URL: string = process.env.REDIS_URI;
export const EMAIL_ACCOUNT: string = process.env.MAILER_ACCOUNT;
export const EMAIL_PASSWORD: string = process.env.MAILER_PASSWORD;
