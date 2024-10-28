import { Request, Response } from 'express';
import express from "express";

// import { jwtMiddleware } from '../middleware/jwtMiddleware';

export const dashboard = async (req: express.Request, res: express.Response): Promise<void> => {
    console.log(`dashboard function processed request for url `);

    const responseData = {
        pitches_recorded: 35,
        average_score: 87,
        pitches_record_in_current_month: 10,
        total_score_in_current_month: 79,
        monthData: {
            January: 65,
            February: 59,
            March: 80,
            April: 81,
            May: 56,
            June: 55,
            July: 40,
            August: 80,
            September: 50,
            October: 50,
            November: 20,
            December: 40,
        },
    };

    res.status(200).json(responseData);
};