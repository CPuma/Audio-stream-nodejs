import { Router, Request, Response } from "express";
import { uploadTrack, getTrack } from "../controller/tracks.controller";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Tracks");
});
router.get("/:trackId", getTrack);
router.post("/", uploadTrack);

export default router;
