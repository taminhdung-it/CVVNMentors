export default () => ({
  app: {
    name: process.env.APPLICATION_NAME || 'WebquanlyCV',
    env: process.env.APPLICATION_ENV || 'production',
    debug: process.env.APPLICATION_DEBUG === 'true',
    port: parseInt(process.env.SERVER_PORT ?? '3000', 10),
    host: process.env.SERVER_HOST || 'localhost',
  },
  database: {
    firebase_project_id: process.env.FIREBASE_PROJECT_ID,
    firebase_client_email: process.env.FIREBASE_CLIENT_EMAIL,
    firebase_private_key: process.env.FIREBASE_PRIVATE_KEY,
    google_application_credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    firebase_api_key: process.env.FIREBASE_API_KEY,
    firebase_auth_domain: process.env.FIREBASE_AUTH_DOMAIN,
    firebase_storage_bucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
  jwt: {},
});
