import Album from "../models/albumModel.js";
import Musician from "../models/musicianModel.js";
import express from "express";

const reasourceRouter = (ResourceModel) => {
    const router = express.Router();
    //GET RESOURCES
    router.get("/", async (req, res) => {
        try {
            const resources = await ResourceModel.find();
            res.send(resources);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    //GET SINGLE RESOURCE
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const resource = await ResourceModel.findById(id);
            if (!resource) {
                res.status(404).send(resource);
            } else {
                res.send(resource);
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    //POST
    router.post("/", async (req, res) => {
        try {
            const resource = await ResourceModel.create(req.body);
            res.status(201).send(resource);
        } catch (err) {
            res.status(400).send(err.message);
        }
    });

    //PATCH
    router.patch("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const resource = await ResourceModel.findByIdAndUpdate(
                id,
                req.body,
                {
                    runValidators: true,
                    new: true,
                }
            );
            res.send(resource);
        } catch (err) {
            res.status(404).send(err.message);
        }
    });

    //DELETE
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            await ResourceModel.findByIdAndDelete(id);
            res.send(`Data with ID ${id} deleted`);
        } catch (err) {
            res.status(404).send(err.message);
        }
    });
    return router;
};

const albumRouter = reasourceRouter(Album);
const musicianRouter = reasourceRouter(Musician);

export { albumRouter, musicianRouter };
