import mongoose from 'mongoose';
import { MONGODB_URL } from '@config/enviroment';

export class DatabaseConnect {
    static async connectionDB(): Promise<void> {
        try {
            await mongoose.connect(MONGODB_URL, {});
            console.log('ConnectDB :: Sucess');
        } catch (err) {
            console.error('ConnectDB:: Err', err);
        }
    }
}
