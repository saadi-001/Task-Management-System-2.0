const { minioClient, bucketName } = require("../config/minio");

// ==============================
// Upload File to MinIO
// ==============================
const uploadFile = async (
    fileBuffer,
    fileName,
    contentType
) => {
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

        return fileName;
    } catch (error) {
        console.error("MinIO upload failed:", error);

        throw new Error(
            "Failed to upload file to MinIO"
        );
    }
};


// ==============================
// Get File from MinIO
// ==============================
const getFile = async (fileName) => {
    try {
        return await minioClient.getObject(
            bucketName,
            fileName
        );
    } catch (error) {
        console.error(
            "MinIO get file failed:",
            error
        );

        throw new Error(
            "Failed to retrieve file from MinIO"
        );
    }
};


// ==============================
// Delete File from MinIO
// ==============================
const deleteFile = async (fileName) => {
    try {
        await minioClient.removeObject(
            bucketName,
            fileName
        );

        return true;
    } catch (error) {
        console.error(
            "MinIO delete file failed:",
            error
        );

        throw new Error(
            "Failed to delete file from MinIO"
        );
    }
};


module.exports = {
    uploadFile,
    getFile,
    deleteFile,
};