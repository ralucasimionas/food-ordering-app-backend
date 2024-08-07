import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import User from "../models/User";

//adds custom proprerties to express requests, like userId and auth0Id

declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}

// JWT  = JSON Web Tookens -
//defines a compact and self-contained way for securely transmitting information between parties as a JSON object
//when we use the jwtCheck function as a middleware to our routes,
//express is going to pass the request to the auth function
//the jwtCheck will check the auth header or the bearer token belongs to an user on auth0

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

//we use this in jwtParse and not in controller because it is repetitive and this way it can be added to all the requests
export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  //check if the header has an auth property on it
  //check if the auth property starts with Bearer
  //if not, the user is not auth to have access to the request
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  //get token
  const token = authorization.split(" ")[1];

  //decode the token using jsonwebtoken
  try {
    const decodedToken = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decodedToken.sub;

    //find user in database based on auth0Id
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();

    //next() - the middleware part is ok and the logic can go to next action
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
