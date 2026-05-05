import { BlobServiceClient } from '@azure/storage-blob';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'images';

if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Ensure container exists AND has public blob access
export async function ensureContainer() {
    await containerClient.createIfNotExists();
    await containerClient.setAccessPolicy('blob');
}

export async function uploadToAzure(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
): Promise<{ storageKey: string; url: string }> {
    const ext = path.extname(originalName);
    const blobName = `images/${crypto.randomUUID()}${ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: mimeType },
    });

    return {
        storageKey: blobName,
        url: blockBlobClient.url,
    };
}

export async function deleteFromAzure(blobName: string): Promise<void> {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
}
