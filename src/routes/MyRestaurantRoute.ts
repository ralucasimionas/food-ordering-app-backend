import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

//define multer settings
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

//requests to api/my/restaurant

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);

//the middleware upload.single checks the post request for an imageFile
//multer is going to store the image in memory and perform validation on it
//multer will append an object bases on the imageFile that we can use in our app
router.post(
  "/",
  jwtCheck,
  jwtParse,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  MyRestaurantController.createMyRestaurant
);

router.put(
  "/",
  jwtCheck,
  jwtParse,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  MyRestaurantController.updateMyRestaurant
);
export default router;
