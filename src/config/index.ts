import * as dotenv from 'dotenv';

dotenv.config();

// export enviroments
export default {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  db: process.env.POSTGRES_DB,
  serverPort: process.env.SERVER_PORT,
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    accessExpired: process.env.ACCESS_TOKEN_EXPIRATION,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpired: process.env.REFRESH_TOKEN_EXPIRATION,
  },
};
