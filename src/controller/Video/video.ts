const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const { QueueClient } = require('@azure/storage-queue');
const { dbconfig } = require('../../../config/dbConfig'); // Adjust the path as necessary
const { HEADER_CONTAINER_NAME, HEADER_USER_ID } = require('../../constants/constant');
const { verifyToken } = require('../../utils/jwtUtils');
import { Media } from '../../models/media';
import { Request, Response } from 'express';
import { jwt_secret,PORTFOLIO_STORAGE_CONN_STRING ,QUEUE_NAME} from '../../config/environment';
 
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
 
async function saveVideo(media: Media, userId: number): Promise<number> {
    var poolConnection = await sql.connect(dbconfig);
 
    var resultSet = await poolConnection.request().query(`
        Insert into videos(userId, categoryId, videoBlobName, videoBlobUrl, audioBlobName, audioBlobUrl)
        output Inserted.ID values(
        ${userId}, '${media.categoryId}', '${media.blobNameVideo}', '${media.blobUrlVideo}', '${media.blobNameAudio}', '${media.blobUrlAudio}')
    `);
 
    console.log(`${resultSet.recordset.length} rows returned.`);
 
    return resultSet.recordset[0].ID;
}
 
 
async function postMessageToQueue(id: number, media: Media, containerName: string, userId: number) {
    const queueClient = new QueueClient(PORTFOLIO_STORAGE_CONN_STRING,QUEUE_NAME);
 
    const messagePayload = {
        videoID: id,
        containerName: containerName,
        videoBlobName: media.blobNameVideo,
        videoBlobUrl: media.blobUrlVideo,
        audioBlobName: media.blobNameAudio,
        audioBlobUrl: media.blobUrlAudio,
        userId: userId,
    };
    let resp = await queueClient.sendMessage(btoa(JSON.stringify(messagePayload)));
    console.log('Message sent to the queue:', messagePayload);
}
 
 
export async function videos(req: Request, res: Response):Promise<void> {
    const authHeader = req.headers['authorization'];
    const secretKey = jwt_secret;
 
    if (!authHeader) {
        console.log('Missing Authorization header');
        res.status(401).json({ code: 401, error: 'Authorization header is missing' });
        return; // Exit the function early
    }
 
    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('Missing JWT token');
        res.status(401).json({ code: 401, error: 'JWT token is missing' });
        return; // Exit the function early
    }
 
    let decodedToken;
    try {
        decodedToken = await verifyToken(token);
    } catch (error) {
        console.log('Error verifying JWT token:', error);
        res.status(401).json({ code: 401, error: 'Invalid JWT token' });
        return; // Exit the function early
    }
 
    try {
        let media;
        try {
            media = req.body; // Assuming the media data is sent in the request body
        } catch (error) {
            res.status(400).json({ code: 400, error: 'Invalid JSON format' });
            return
        }
 
        if (!media || !media.categoryId || !media.blobNameVideo || !media.blobUrlVideo || !media.blobNameAudio || !media.blobUrlAudio) {
             res.status(400).json({ code: 400, error: 'BlobNameVideo, BlobUrlVideo, BlobNameAudio, BlobUrlAudio is missing' });
             return
        }
 
        const userId = req.headers[HEADER_USER_ID];
        const mediaId = await saveVideo(media, Number(userId));
 
        const newResource = {
            id: mediaId,
        };
 
        const decoded = jwt.verify(token, secretKey);
        req.headers[HEADER_CONTAINER_NAME] = decoded.cname;
        const containerName: any = req.headers[HEADER_CONTAINER_NAME];
 
        await postMessageToQueue(mediaId, media, containerName, Number(userId));
        res.status(201).json({ code: 201, newResource, message: 'Pitch inserted successfully' });
        return
    } catch (error) {
        if (error === 'JWTValueMissing') {
             res.status(400).json({ code: 400, error: 'JWT claim is missing' });
             return
        } else {
             console.error(error);
             res.status(500).json({ code: 500, error: 'Unknown server error' });
             return
        }
    }
}