import { jwt_secret } from "../../config/environment";
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const envSecrectKey = jwt_secret
export const verifyJwt = (req: Request): JwtPayload | any => {
    // console.log(req.headers.authorization,"req.headers.authorization");
    
    if (!req.headers.authorization) {
        throw { message: "Authorization header not present!", code: 401 };
    }

    const token = req.headers.authorization.split(" ")[1];
    // console.log(token,"eeeee");
    
    try {
        // Verify the JWT token using the secret key
        const userDetails = jwt.verify(token, envSecrectKey as string);
        // console.log(userDetails, "Verified user details");
        return userDetails;
    } catch (error) {
        throw { message: "Invalid Signature!", code: 401 };
    }
};
