import config from 'config';
import { dbConfig } from '@/entity/db.interface';

// const { host, port, database }: dbConfig = config.get('dbConfig');
const env_host = process.env.MONGO_HOST;
export const dbConnection = {
  url: `mongodb://${env_host}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};

console.log(dbConnection);
