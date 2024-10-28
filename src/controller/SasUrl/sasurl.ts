import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import {
    BlobClient,
    BlobSASPermissions,
    ContainerClient,
    generateBlobSASQueryParameters,
    StorageSharedKeyCredential,
    BlobServiceClient,
} from '@azure/storage-blob';
import { randomstring } from '../../../common/randomestring';
import { SASToken } from '../models/token';
import { jwtMiddleware } from '../middleware/jwtMiddleware';
import { HEADER_CONTAINER_NAME } from '../constants/constants';

/**
 * The client will make a call to this function to get a SAS URL to the BLOB to upload it.
 * In order to upload the BLOB, you will need to use the URL along with a header
 * x-ms-blob-type BlockBlob
 * Make it a PUT request
 * The url will also allow you to ONLY create the blob and not overwrite it.
 * We are going with extension as .webm for both audio and video.
 * @param request - HttpRequest object containing the request data.
 * @param context - InvocationContext object containing the context for the function execution.
 * @returns Promise<HttpResponseInit> - The response object.
 */
export async function sasurl(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const accountName = process.env.PORTFOLIO_STORAGE_ACCOUNT;
        const accountKey = process.env.PORTFOLIO_STORAGE_ACCOUNT_KEY;

        if (!accountName || !accountKey) {
            throw new Error('Account Name or Account Key missing');
        }

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

        const containerName = request.headers.get(HEADER_CONTAINER_NAME);
        if (!containerName) {
            throw new Error('Container Name is not provided');
        }

        const containerClient = await blobServiceClient.getContainerClient(containerName);
        const containerExists = await containerClient.exists();
        if (!containerExists) {
            throw new Error(`Container ${containerName} does not exist`);
        }

        const durationInMins = process.env.SAS_TOKEN_DURATION_MINS;
        if (!durationInMins) {
            throw new Error('Duration for SAS token not provided');
        }

        const blobClientAudio = await getBlobClient(containerClient, 'audio');
        const sasTokenAudio = getSASToken(containerName, blobClientAudio, sharedKeyCredential, durationInMins);

        const blobClientVideo = await getBlobClient(containerClient, 'video');
        const sasTokenVideo = getSASToken(containerName, blobClientVideo, sharedKeyCredential, durationInMins);

        const responseBody: SASToken = {
            sasTokenAudio: `${blobClientAudio.url}?${sasTokenAudio}`,
            sasTokenVideo: `${blobClientVideo.url}?${sasTokenVideo}`,
        };

        return { jsonBody: responseBody };
    } catch (error: any) {
        context.log.error(error);

        return {
            status: error.message === 'Container Name is not provided' ? 400 : 500,
            body: error.message || 'Unknown server error',
        };
    }
}

// Registering the function with JWT middleware
app.http('sasurl', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: jwtMiddleware(sasurl), // call the actual function wrapping it with jwtMiddleware to add JWT authentication
});

/**
 * Get a BlobClient for a given container client and type of blob.
 * @param containerClient - The ContainerClient object for the blob storage.
 * @param typeOfBlob - The type of blob, either 'audio' or 'video'.
 * @returns Promise<BlobClient> - The BlobClient object for the new blob.
 */
async function getBlobClient(containerClient: ContainerClient, typeOfBlob: string): Promise<BlobClient> {
    let blobClient: BlobClient;
    let cntr = 0;

    while (true) {
        const blobName = `${randomstring(16)}_${typeOfBlob}.webm`;
        blobClient = await containerClient.getBlockBlobClient(blobName);
        const doesBlobExist = await blobClient.exists();

        if (doesBlobExist) {
            cntr++;
            if (cntr > 4) {
                throw new Error('Blob name cannot be determined.');
            }
            continue;
        } else {
            break;
        }
    }

    return blobClient;
}

/**
 * Generate a SAS token for the specified blob.
 * @param containerName - The name of the container.
 * @param blobClient - The BlobClient object for which to generate the SAS token.
 * @param sharedKeyCredential - The shared key credential used for generating the SAS token.
 * @param durationInMins - The duration for which the SAS token is valid.
 * @returns string - The generated SAS token.
 */
function getSASToken(
    containerName: string,
    blobClient: BlobClient,
    sharedKeyCredential: StorageSharedKeyCredential,
    durationInMins: string,
): string {
    const sasOptions = {
        containerName: containerName,
        permissions: BlobSASPermissions.parse('w'), // Write permissions
        startsOn: new Date(),
        blobName: blobClient.name,
        expiresOn: new Date(Date.now() + parseInt(durationInMins, 10) * 60 * 1000), // Expiration time
    };

    return generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
}
