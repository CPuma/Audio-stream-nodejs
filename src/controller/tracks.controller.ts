import { Request, Response } from "express";
import multer from "multer";
import { getConnection } from "../database";
import { GridFSBucket, ObjectID } from "mongodb";
import { Readable } from "stream";

export const getTrack = (req: Request, res: Response) => {
    let trackId;
    try {
        // validamos que sea un ID Valido para mongo
        trackId = new ObjectID(req.params.trackId);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "invalid track ID in URL" });
    }
    res.set("content-type", "audio/mp3");
    res.set("accept-ranges", "bytes");
    const db = getConnection();
    const bucket = new GridFSBucket(db, { bucketName: "tracks" });

    let downloadStream = bucket.openDownloadStream(trackId);
    downloadStream.on("data", chunk => {
        res.write(chunk);
    });
    downloadStream.on("error", err => {
        console.log("ERROR EN LA DESCARGA ::::",err);
        res.sendStatus(404);
    });
    downloadStream.on("end", () => {
        res.end();
    });
};

export const uploadTrack = (req: Request, res: Response) => {
    // Configuraciones de Multer
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fields: 1, fileSize: 10000000, files: 1, parts: 2 }
    });
    //   Middleware de carga ..Validacion y Manejo de Errores
    upload.single("track")(req, res, err => {
        // If Error in upload
        if (err) {
            console.log(err);
            return res.status(400).json({ message: err.message });
        }
        // Validamos nombre del Track
        if (!req.body.name) {
            return res
                .status(400)
                .json({ message: "No track name in request" });
        }
        // =========================================================================

        // Obtenemos el Name del Track
        let trackName = req.body.name;

        if (!req.file) return res.send("No hya archivo");

        //      req.file.buffer ... es el archivo de audio desde Multer
        // Lo convertiremos a un Readable Stream para guardarlo enla DB
        let readableTrackStream = new Readable();
        readableTrackStream.push(req.file.buffer); // cargamos y convertimos nuestro track
        readableTrackStream.push(null); // con null . terminamos la conversion

        // establecemos la conexion ala DB
        let db = getConnection();

        // Preparamos el Bucket dentro de la DB para almacenar Archivos
        const bucket = new GridFSBucket(db, {
            bucketName: "tracks"
        });

        //  Cargamos el nombre del Stream(track) al BUCKET
        let uploadStream = bucket.openUploadStream(trackName);
        const id = uploadStream.id; // obtenemos el id .. para mandarlo en el RESPONSe luego

        // cargamos el Stream
        readableTrackStream.pipe(uploadStream);

        // Manejamos eventos durante la Carga al Bucket
        uploadStream.on("error", () => {
            return res
                .status(500)
                .json({ message: "Error uploading your file" });
        });
        uploadStream.on("finish", () => {
            return res
                .status(201)
                .json({ message: "File Uploaded Successfully", id });
        });
    });
};
