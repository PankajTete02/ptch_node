const { BlobServiceClient } = require('@azure/storage-blob');
import { BlobClient, BlobSASPermissions, ContainerClient, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob';
import { sqlConfig } from '../../../config/dbConfig';
const sql = require('mssql');
const Groq = require('groq-sdk');
import {PORTFOLIO_STORAGE_ACCOUNT, PORTFOLIO_STORAGE_ACCOUNT_KEY , SAS_TOKEN_DURATION_MINS , GROQ_API_KEY} from '../../../config/environment'


async function generateSasUrl(containerName: string, blobName: string): Promise<string> {
    const accountName = PORTFOLIO_STORAGE_ACCOUNT;
    const accountKey = PORTFOLIO_STORAGE_ACCOUNT_KEY;
 
    if (!accountName || !accountKey) {
        throw new Error('Account Name or Account Key missing');
    }
 
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const containerExists = await containerClient.exists();
 
    if (!containerExists) {
        throw new Error(`Container ${containerName} does not exist`);
    }
 
    const durationInMins = SAS_TOKEN_DURATION_MINS;
 
    if (!durationInMins) {
        throw new Error('Duration for SAS token not provided');
    }
 
    const blobClientAudio = containerClient.getBlobClient(blobName);
    const sasToken = getSASToken(
        containerName,
        blobClientAudio,
        sharedKeyCredential,
        BlobSASPermissions.parse('r'),
        durationInMins,
    );
 
    return `${blobClientAudio.url}?${sasToken}`;
}
 
// Function to get SAS Token
function getSASToken(containerName: string, blobClient: BlobClient, sharedKeyCredential: StorageSharedKeyCredential, permissions: BlobSASPermissions, durationInMins: string): string {
    const sasOptions = {
        containerName: containerName,
        permissions: permissions,
        expiresOn: new Date(new Date().valueOf() + parseInt(durationInMins) * 60 * 1000),
    };
 
    return generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
}
 
// Function to extract base URL from SAS URL
function extractBaseUrl(sasUrl: string): string {
    return sasUrl.split('?')[0];
}
 
// Function to call Whisper API for transcription
async function callWhisperApi(sasUrl: string): Promise<{ text: string; start_time: number; end_time: number; }[]> {
    const sasUrlaudio = extractBaseUrl(sasUrl);
    const groq = new Groq({ apiKey: GROQ_API_KEY });
 
    const transcription = await groq.audio.transcriptions.create({
        url: sasUrlaudio,
        model: 'whisper-large-v3-turbo',
        prompt: 'Please transcribe the audio',
        response_format: 'verbose_json',
        language: 'en',
        temperature: 0.0,
    });
 
    return transcription.segments.map((segment:any) => ({
        text: segment.text.trim(),
        start_time: segment.start,
        end_time: segment.end,
    }));
}
 
// Function to insert segments into the database
async function insertSegments(segments: { text: string; start_time: number; end_time: number; }[], videoId: number, userId: number): Promise<void> {
    const poolConnection = await sql.connect(sqlConfig);
 
    for (const [index, segment] of segments.entries()) {
        const { text, start_time, end_time } = segment;
 
        const query = `
            INSERT INTO pitchDetails
            (videoId, segment_order, segments, start_time, end_time, created_by, created_at)
            VALUES (@videoId, @segmentOrder, @segments, @startTime, @endTime, @createdBy, @createdAt)
        `;
 
        const request = poolConnection.request();
        request.input('videoId', sql.Int, videoId);
        request.input('segmentOrder', sql.Int, index + 1);
        request.input('segments', sql.NVarChar(4000), text.trim());
        request.input('startTime', sql.Decimal(10, 2), parseFloat(start_time.toFixed(2)));
        request.input('endTime', sql.Decimal(10, 2), parseFloat(end_time.toFixed(2)));
        request.input('createdBy', sql.Int, userId);
        request.input('createdAt', sql.DateTime, new Date());
 
        try {
            await request.query(query);
            console.log(`Inserted segment ${index + 1} into the database.`);
        } catch (error) {
            console.error(`Error inserting segment ${index + 1}:`, error);
        }
    }
}
 
// Main function triggered by the storage queue
export async function audiotranscription(queueItem: unknown): Promise<void> {
    try {
        if (!queueItem) {
            throw new Error('Queue item is null or undefined');
        }
 
        const { videoID, containerName, audioBlobName, userId } = queueItem as any; // Cast to appropriate type
 
        const sasUrl = await generateSasUrl(containerName, audioBlobName);
        const segments = await callWhisperApi(sasUrl);
        await insertSegments(segments, videoID, userId);
    } catch (error) {
        console.error('Error processing queue item:', error);
        throw error;
    }
}
 
// // Define the storage queue trigger
// app.storageQueue('audiotranscription', {
//     queueName: 'mediauploadtrigger',
//     connection: 'PORTFOLIO_STORAGE_CONN_STRING',
//     handler: audiotranscription,
// });