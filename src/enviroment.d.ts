declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string
    MAX_FILE_UPLOAD: string
    JWT_SECRET: string
    JWT_EXPIRE: string
    JWT_COOKIE_EXPIRE: string
  }
}
