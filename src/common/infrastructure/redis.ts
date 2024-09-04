import { QueueOptions } from 'bull';
import { REDIS_URL } from './../../config/enviroment';
import IORedis, { Redis } from 'ioredis';

export class RedisConnect {
    private static client: Redis;
    private static allClients: Redis[] = [];

    public static getClient = async (): Promise<Redis> => {
        if (!RedisConnect.client) {
            await RedisConnect.connect();
        }
        return RedisConnect.client;
    };

    public static connect = async (overrideClient = true): Promise<Redis> => {
        const temp = new IORedis(REDIS_URL, {
            lazyConnect: true,
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            },
        });

        temp.on('ready', () => {
            console.log('Connect redis :: Success');
        });
        temp.on('end', () => {
            console.log('Connect redis end');
        });
        temp.on('error', () => {
            console.log('Connect redis error');
        });

        if (!overrideClient) {
            RedisConnect.client = temp;
        }

        RedisConnect.allClients.push(temp);

        return temp;
    };

    public static serialize = (value: unknown): string => {
        if (value) {
            return JSON.stringify(value);
        }
        return value as string;
    };

    public static deserialize = (value: unknown): unknown => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        }
        return value;
    };

    public static get = async (key: string, shoudConver = false): Promise<unknown> => {
        const value = await (await RedisConnect.getClient()).get(key);
        return shoudConver ? RedisConnect.deserialize(value) : value;
    };

    public static set = async (key: string, value: unknown, ttl = 0, should = false): Promise<unknown> => {
        const stringValue = should ? RedisConnect.serialize(value) : (value as string);
        if (ttl > 0) {
            return await (await RedisConnect.getClient()).set(key, stringValue, 'EX', ttl);
        }
        return await (await RedisConnect.getClient()).set(key, stringValue);
    };

    public static del = async (key: string): Promise<unknown> => {
        return (await RedisConnect.getClient()).del(key);
    };
}
