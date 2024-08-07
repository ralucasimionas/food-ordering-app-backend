import { create } from "domain";
import { Request, Response } from "express";
import User from "../models/User";

const createCurrentUser = async (req: Request, res: Response) => {
  try {
    // Check if the user exists
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      console.log("user exists");
      return res.status(200).send();
    }
    console.log("user doesnt exist");
    //Create the user if it doesnt exist
    const newUser = new User(req.body);
    //req.body has auth0id and email -> passed to the front end
    await newUser.save();

    //Return User object to the froentend (the calling client)
    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error, "eror");
    res.status(500).json({ message: "Error creating user" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, country, city } = req.body;
    //request support userId because we crated an interface in auth.ts where we added userId as a request property
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //we send the info like this because we want to be very specific
    //we dont want to update the auth0Id and email from user Model
    user.name = name;
    user.addressLine1 = addressLine1;
    user.city = city;
    user.country = country;

    await user.save();

    //we send back to user because the frontend might do something with the new propreties
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating user" });
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      console.log("Eroare din backend");
      return res.status(404).json({ message: "User not found!" });
    }

    res.json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
export default { createCurrentUser, updateCurrentUser, getCurrentUser };
