import express from "express";
import { getDownloadURL, ref, uploadBytesResumable } from "@firebase/storage";
const app = express();
import multer from "multer";
import { storage } from "./firebase.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
const router = express.Router();
dotenv.config();

app.use("/file", router);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uploadFile = multer({
  storage: multer.memoryStorage(),
}).single("fileName");

router.post("/create", uploadFile, async (req, res) => {
  try {
    const storageRef = ref(
      storage,
      `${new Date().getTime()}_${req.file.originalname}`
    );

    const metatype = {
      contentType: req.file.mimetype,
      name: req.file.originalname,
    };
    //Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metatype
    );
    //Download the file
    const fileURL = await getDownloadURL(snapshot.ref);

    //Save the URL in DB
    //.....

    res.json({ fileUrl: fileURL });
  } catch (error) {
    res.send(error);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
