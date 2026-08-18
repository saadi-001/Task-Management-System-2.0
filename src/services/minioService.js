const { minioClient, bucketName } = require("../config/minio");

// Upload File to MinIO
const uploadFile = async (fileBuffer, fileName, contentType) => {
    try {
        await minioClient.putObject(
            bucketName,
            fileName,
            fileBuffer,
            fileBuffer.length,
            {
                "Content-Type": contentType,
            }
        );

        const fileUrl = `http://localhost:9000/${bucketName}/${fileName}`;

        return fileUrl;

    } catch (error) {
        console.error("MinIO upload failed:", error);
        throw new Error("Failed to upload file to MinIO");
    }
};

module.exports = {
    uploadFile,
};