import mongoose from 'mongoose';
import { MONGODB_URL } from '@config/enviroment';

export class DatabaseAdapter {
    public static async connection(): Promise<void> {
        try {
            await mongoose.connect(MONGODB_URL, {});
            console.log('ConnectDB :: Sucess');
        } catch (err) {
            console.error('ConnectDB:: Err', err);
        }
    }

    public static async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
        } catch (err) {
            console.error('DisconnectDB:: Err', err);
        }
    }
}
