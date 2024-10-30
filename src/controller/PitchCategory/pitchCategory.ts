import { sqlConfig } from '../../../src/config/dbConfig';
import { PitchCategory } from '../../models/pitchCategory';
import { verifyToken } from '../../utils/jwtUtils';
import { jwtMiddleware } from '../../middleware/jwtMiddelware';
import { Request, Response } from 'express';

const sql = require('mssql');


export async function inserPitchCategory(req: Request, res: Response): Promise<void> {
    console.log(`Processing request for URL: ${req.url}`);

    let body: PitchCategory;
    try {
        body = req.body;
    } catch (error) {
        console.log('Invalid JSON in request body:', error);
        res.status(400).json({ code: 400, error: 'Invalid JSON in the request body' });
        return; // Exit the function early
    }

    const authHeader = req.headers['authorization'];
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

    const { CategoryName, CategoryModelDetails, KeyPoints, PitchGoodPoints, PointsNotAddedIntoPitch } = body;

    if (!CategoryName || !CategoryModelDetails || !KeyPoints) {
        res.status(400).json({
            code: 400,
            error: 'Missing required fields: CategoryName, CategoryModelDetails, and KeyPoints',
        });
        return; // Exit the function early
    }

    const pitchCategory: PitchCategory = {
        userId: decodedToken.id,
        CategoryName,
        CategoryModelDetails,
        KeyPoints,
        PitchGoodPoints,
        PointsNotAddedIntoPitch,
        created_by: decodedToken.clientId,
    };

    const keyPointsJson = KeyPoints ? JSON.stringify(KeyPoints) : null;
    const pitchGoodPointsJson = PitchGoodPoints ? JSON.stringify(PitchGoodPoints) : null;
    const pointsNotAddedJson = PointsNotAddedIntoPitch ? JSON.stringify(PointsNotAddedIntoPitch) : null;

    try {
        const pool = await sql.connect(sqlConfig);

        const query = `
            INSERT INTO pitchCategory
            (userId, CategoryName, CategoryModelDetails, KeyPoints, PitchGoodPoints, PointsNotAddedIntoPitch, created_by, created_at, is_active) 
            VALUES (@userId, @CategoryName, @CategoryModelDetails, @KeyPoints, @PitchGoodPoints, @PointsNotAddedIntoPitch, @created_by, GETDATE(), 1)
        `;

        await pool
            .request()
            .input('userId', sql.Int, pitchCategory.userId)
            .input('CategoryName', sql.NVarChar(255), pitchCategory.CategoryName)
            .input('CategoryModelDetails', sql.NVarChar(sql.MAX), pitchCategory.CategoryModelDetails)
            .input('KeyPoints', sql.NVarChar(sql.MAX), keyPointsJson)
            .input('PitchGoodPoints', sql.NVarChar(sql.MAX), pitchGoodPointsJson)
            .input('PointsNotAddedIntoPitch', sql.NVarChar(sql.MAX), pointsNotAddedJson)
            .input('created_by', sql.Int, pitchCategory.created_by)
            .query(query);

        console.log(`Inserted category with CategoryName: ${CategoryName}`);
        res.status(201).json({ code: 201, message: 'Pitch category inserted successfully' });
    } catch (error) {
        console.log('Error inserting pitch category:', error);
        res.status(500).json({ code: 500, error: 'Error inserting pitch category' });
    }
}

export async function updatePitchCategory(req: Request, res: Response): Promise<void> {
    console.log(`Processing request for URL: ${req.url}`);

    // Verify the Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ code: 401, error: 'Authorization header is missing' });
        return; // Exit early
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ code: 401, error: 'JWT token is missing' });
        return; // Exit early
    }

    let decodedToken;
    try {
        decodedToken = await verifyToken(token);
    } catch (error) {
        res.status(401).json({ code: 401, error: 'Invalid JWT token' });
        return; // Exit early
    }

    // Parse the request body
    let body: PitchCategory;
    try {
        body = req.body; // Assuming the body is parsed correctly
    } catch (error) {
        res.status(400).json({ code: 400, error: 'Invalid JSON in the request body' });
        return; // Exit early
    }

    const {
        CategoryId,
        CategoryName,
        CategoryModelDetails,
        KeyPoints,
        PitchGoodPoints,
        PointsNotAddedIntoPitch,
    } = body;

    // Validate required fields
    if (!CategoryId || !CategoryName || !CategoryModelDetails || !KeyPoints) {
        res.status(400).json({
            code: 400,
            error: 'Missing required fields: CategoryId, CategoryName, CategoryModelDetails, and KeyPoints',
        });
        return; // Exit early
    }

    // Prepare pitch category object
    const pitchCategory: PitchCategory = {
        CategoryId,
        userId: decodedToken.id,
        CategoryName,
        CategoryModelDetails,
        KeyPoints,
        PitchGoodPoints,
        PointsNotAddedIntoPitch,
        created_by: decodedToken.clientId,
    };

    const keyPointsJson = KeyPoints ? JSON.stringify(KeyPoints) : null;
    const pitchGoodPointsJson = PitchGoodPoints ? JSON.stringify(PitchGoodPoints) : null;
    const pointsNotAddedJson = PointsNotAddedIntoPitch ? JSON.stringify(PointsNotAddedIntoPitch) : null;

    try {
        const pool = await sql.connect(sqlConfig);

        const query = `
            UPDATE pitchCategory
            SET 
                CategoryName = @CategoryName,
                CategoryModelDetails = @CategoryModelDetails,
                KeyPoints = @KeyPoints,
                PitchGoodPoints = @PitchGoodPoints,
                PointsNotAddedIntoPitch = @PointsNotAddedIntoPitch,
                created_by = @created_by,
                created_at = GETDATE() 
            WHERE CategoryID = @CategoryId AND userId = @userId
        `;

        await pool
            .request()
            .input('CategoryId', sql.Int, CategoryId)
            .input('userId', sql.Int, pitchCategory.userId)
            .input('CategoryName', sql.NVarChar(255), CategoryName)
            .input('CategoryModelDetails', sql.NVarChar(sql.MAX), CategoryModelDetails)
            .input('KeyPoints', sql.NVarChar(sql.MAX), keyPointsJson)
            .input('PitchGoodPoints', sql.NVarChar(sql.MAX), pitchGoodPointsJson)
            .input('PointsNotAddedIntoPitch', sql.NVarChar(sql.MAX), pointsNotAddedJson)
            .input('created_by', sql.Int, pitchCategory.created_by)
            .query(query);

        res.status(200).json({ code: 200, message: 'Pitch category updated successfully' });
    } catch (error) {
        res.status(500).json({ code: 500, error: `Error updating pitch category: ${error}` });
    }
}

export async function deletePitchCategory(req: Request, res: Response): Promise<void> {
    console.log(`Processing request for URL: ${req.url}`);

    // Verify the Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ code: 401, error: 'Authorization header is missing' });
        return; // Exit early
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ code: 401, error: 'JWT token is missing' });
        return; // Exit early
    }

    let decodedToken;
    try {
        decodedToken = await verifyToken(token);
    } catch (error) {
        res.status(401).json({ code: 401, error: 'Invalid JWT token' });
        return; // Exit early
    }

    // Parse the request body
    let body;
    try {
        body = req.body; // Assuming the body is parsed correctly
    } catch (error) {
        res.status(400).json({ code: 400, error: 'Invalid JSON in the request body' });
        return; // Exit early
    }

    const { CategoryId } = body;

    // Validate required fields
    if (!CategoryId) {
        res.status(400).json({ code: 400, error: 'Missing required field: CategoryId' });
        return; // Exit early
    }

    try {
        const pool = await sql.connect(sqlConfig);

        const query = `
            UPDATE pitchCategory
            SET is_active = 0
            WHERE CategoryId = @CategoryId 
        `;

        const result = await pool.request()
            .input('CategoryId', sql.Int, CategoryId)
            .query(query);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ code: 404, message: `Pitch category with CategoryId ${CategoryId} not found` });
            return; // Exit early
        }

        res.status(200).json({ code: 200, message: 'Pitch category deleted successfully' });
    } catch (error) {
        console.error('Error deleting pitch category:', error);
        res.status(500).json({ code: 500, error: `Error deleting pitch category: ${error}` });
    }
}

export async function getAllPitchCategory(req: Request, res: Response): Promise<void> {
    console.log(`Processing request for URL: ${req.url}`);

    // Verify the Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ code: 401, error: 'Authorization header is missing' });
        return; // Exit early
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ code: 401, error: 'JWT token is missing' });
        return; // Exit early
    }

    let decodedToken;
    try {
        decodedToken = await verifyToken(token);
    } catch (error) {
        res.status(401).json({ code: 401, error: 'Invalid JWT token' });
        return; // Exit early
    }

    // Parse the request body
    let body;
    try {
        body = req.body; // Assuming the body is parsed correctly
    } catch (error) {
        res.status(400).json({ code: 400, error: 'Invalid JSON in the request body' });
        return; // Exit early
    }

    // Extract page number and page size from the request body
    const page = parseInt(body.page || '1', 10);
    const pageSize = parseInt(body.pageSize || '10', 10);

    // Calculate offset
    const offset = (page - 1) * pageSize;

    try {
        const pool = await sql.connect(sqlConfig);

        const query = `
            SELECT *
            FROM pitchCategory
            ORDER BY CategoryId ASC
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY;

            -- Get the total count of records for pagination
            SELECT COUNT(*) AS totalRecords FROM pitchCategory 
        `;

        const result = await pool
            .request()
            .input('offset', sql.Int, offset)
            .input('pageSize', sql.Int, pageSize)
            .query(query);

        const categories = result.recordsets[0];
        const totalRecords = result.recordsets[1][0].totalRecords;
        const totalPages = Math.ceil(totalRecords / pageSize);

        res.status(200).json({
            code: 200,
            data: categories,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalRecords: totalRecords,
                totalPages: totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching all pitch categories with pagination:', error);
        res.status(500).json({ code: 500, error: 'Error fetching all pitch categories with pagination' });
    }
}

export async function getCategoryById(req: Request, res: Response): Promise<void> {
    console.log(`Processing request for URL: ${req.url}`);

    // Verify the Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ code: 401, error: 'Authorization header is missing' });
        return; // Exit early
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ code: 401, error: 'JWT token is missing' });
        return; // Exit early
    }

    let decodedToken;
    try {
        decodedToken = await verifyToken(token);
    } catch (error) {
        res.status(401).json({ code: 401, error: 'Invalid JWT token' });
        return; // Exit early
    }

    // Parse the request body
    let body;
    try {
        body = req.body; // Assuming the body is parsed correctly
    } catch (error) {
        res.status(400).json({ code: 400, error: 'Invalid JSON in the request body' });
        return; // Exit early
    }

    const { CategoryId } = body;
    if (!CategoryId) {
        res.status(400).json({ code: 400, error: 'Missing required field: CategoryId' });
        return; // Exit early
    }

    try {
        const pool = await sql.connect(sqlConfig);

        const query = `
            SELECT * FROM pitchCategory
            WHERE CategoryId = @CategoryId
        `;

        const result = await pool.request().input('CategoryId', sql.Int, CategoryId).query(query);

        if (result.recordset.length === 0) {
            res.status(404).json({ code: 404, message: `Pitch category with CategoryId ${CategoryId} not found or is inactive` });
            return; // Exit early
        }

        res.status(200).json({ code: 200, data: result.recordset[0] });
    } catch (error) {
        console.error('Error fetching pitch category by id:', error);
        res.status(500).json({ code: 500, error: 'Error fetching pitch category by id' });
    }
}











