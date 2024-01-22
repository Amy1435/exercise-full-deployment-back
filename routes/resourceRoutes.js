import Album from "../models/albumModel.js";
import Musician from "../models/musicianModel.js";
import express from "express";

const reasourceRouter = (ResourceModel) => {
    const router = express.Router();
    //GET RESOURCES
    router.get("/", async (req, res) => {
        try {
            const resources = await ResourceModel.find().select("-_id -__v");
            res.send(resources);
        } catch (err) {
            console.error(err.message);
            res.status(500).send(`Server error.`);
        }
    });

    //GET SINGLE RESOURCE
    router.get("/:slug", async (req, res) => {
        const { slug } = req.params;
        try {
            const resource = await ResourceModel.findOne({ slug }).select(
                "-slug"
            );
            if (!resource) {
                res.status(404).send(`Resource with ID ${slug} not found.`);
            } else {
                res.send(resource);
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    //POST
    router.post("/", async (req, res) => {
        if (!req.body) {
            res.status(400).send("You must send a body");
        }

        try {
            const { _id } = await ResourceModel.create(req.body);
            const resource = await ResourceModel.findByOne(_id).select(
                "-_id -__v"
            );
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
