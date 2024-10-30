import { Request, Response, NextFunction } from 'express';
import {
    BlobClient,
    BlobSASPermissions,
    ContainerClient,
    generateBlobSASQueryParameters,
    StorageSharedKeyCredential,
    BlobServiceClient
} from '@azure/storage-blob';
import { randomstring } from '../../../src/common/randomestring';
import { SASToken } from '../../models/token';
import { HEADER_CONTAINER_NAME } from '../../constants/constant';
import {PORTFOLIO_STORAGE_ACCOUNT,PORTFOLIO_STORAGE_ACCOUNT_KEY, SAS_TOKEN_DURATION_MINS} from '../../../src/config/environment'
 


export async function generateSASTokens(req: Request, res: Response): Promise<void> {
    try {
        const accountName = PORTFOLIO_STORAGE_ACCOUNT;
        const accountKey = PORTFOLIO_STORAGE_ACCOUNT_KEY;

        if (!accountName || !accountKey) {
            res.status(400).json({ error: 'Account Name or Account Key missing' });
            return;
        }

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

        console.log("sharedKeyCredential",sharedKeyCredential);

        console.log("blobServiceClient",blobServiceClient);
        
        
        const containerName = req.headers[HEADER_CONTAINER_NAME] as string;
        console.log("containerName",containerName);
        
        if (!containerName) {
            res.status(400).json({ error: 'Container Name is not provided' });
            return;
        }

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const containerExists = await containerClient.exists();
        if (!containerExists) {
            res.status(404).json({ error: `Container ${containerName} does not exist` });
            return;
        }

        const durationInMins = SAS_TOKEN_DURATION_MINS;
        if (!durationInMins) {
            res.status(400).json({ error: 'Duration for SAS token not provided' });
            return;
        }

        const blobClientAudio = await getBlobClient(containerClient, 'audio');
        const sasTokenAudio = getSASToken(containerName, blobClientAudio, sharedKeyCredential, durationInMins);

        const blobClientVideo = await getBlobClient(containerClient, 'video');
        const sasTokenVideo = getSASToken(containerName, blobClientVideo, sharedKeyCredential, durationInMins);

        const responseBody: SASToken = {
            sasTokenAudio: `${blobClientAudio.url}?${sasTokenAudio}`,
            sasTokenVideo: `${blobClientVideo.url}?${sasTokenVideo}`,
        };
        
        res.status(200).json(responseBody);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unknown server error' });
    }
}

// Middleware for getting the BlobClient
async function getBlobClient(containerClient: ContainerClient, typeOfBlob: string): Promise<BlobClient> {
    let blobClient: BlobClient;
    let attempts = 0;

    while (true) {
        const blobName = `${randomstring(16)}_${typeOfBlob}.webm`;
        blobClient = containerClient.getBlockBlobClient(blobName);
        const doesBlobExist = await blobClient.exists();
        
        if (doesBlobExist) {
            attempts++;
            if (attempts > 4) throw new Error('Blob name cannot be determined.');
            continue;
        }
        break;
    }
    return blobClient;
}

// Function to generate SAS token
function getSASToken(containerName: string, blobClient: BlobClient, sharedKeyCredential: StorageSharedKeyCredential, durationInMins: string): string {
    const sasOptions = {
        containerName: containerName,
        permissions: BlobSASPermissions.parse('w'),
        startsOn: new Date(),
        blobName: blobClient.name,
        expiresOn: new Date(new Date().valueOf() + parseInt(durationInMins) * 60 * 1000),
    };
    return generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
}
 
 