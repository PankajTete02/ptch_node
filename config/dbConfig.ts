import { DB_NAME, DB_PASSWORD, DB_SERVER, DB_USER } from "./environment";

export const sqlConfig = {
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    server: DB_SERVER,
    connectionTimeout: 30000,
    requestTimeout: 60000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    authentication: {
        type: 'default'
    },
    options: {
      encrypt: true,
      trustServerCertificate: true
    },
  }

