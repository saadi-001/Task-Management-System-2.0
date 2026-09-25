const Minio = require("minio");

// Internal MinIO client
// Used by the backend container to communicate with MinIO.
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

// Public/browser MinIO client
// Used only for generating URLs that the browser can access.
const publicMinioClient = new Minio.Client({
    endPoint: process.env.MINIO_PUBLIC_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT),
    useSSL:
        process.env.MINIO_PUBLIC_USE_SSL === "true" ||
        process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const bucketName = process.env.MINIO_BUCKET;

module.exports = {
    minioClient,
    publicMinioClient,
    bucketName,
};