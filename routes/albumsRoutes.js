import Album from "../models/albumModel.js";
import express from "express";
const router = express.Router();

//GET RESOURCES
router.get("/", async (req, res) => {
    try {
        const albums = await Album.find();
        console.error(error.message);
        res.send(albums);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(`Server error.`);
    }
});

//GET SINGLE RESOURCE
router.get("/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
        const album = await Album.findOne(slug).select("-slug");
        if (!album) {
            throw new Error(`Resource with ID ${slug} not found.`);
        }
        res.send(album);
    } catch (err) {
        console.error(error.message);
        res.status(500).send(err.message);
    }
});

//POST
router.post("/", async (req, res) => {
    if (!req.body) {
        res.status(400).send("You must send a body");
    }

    try {
        const { _id } = await Album.create(req.body);
        const album = await Album.findByOne(_id).select("-_id -__v");
        console.error(error.message);
        res.status(201).send(album);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//PATCH
router.patch("/:slug", async (req, res) => {
    if (!req.body || Object.keys(req.body).length) {
        return res
            .status(400)
            .send(`YOU must pass a body with at least one properties`);
    }
    const { slug } = req.params;
    const newProperties = Object.entries(req.body);

    try {
        const album = await Album.findBySlug(slug);
        if (!album) {
            res.status(400).send(`The is no resource  with SLUG ${slug} `);
        }
        newProperties.forEach(([key, value]) => {
            album[key] = value;
        });
        await album.save();
        res.send(album);
    } catch (err) {
        console.error(err.message);
        res.status(404).send(err.message);
    }
});

//DELETE
router.delete("/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
        const album = await Album.findBySlug(slug);
        await Album.deleteOne({ slug });
        await album.removeFromAuthor();
        res.send(`Data with SLUG ${slug} deleted`);
    } catch (err) {
        console.error(error.message);
        res.status(404).send(err.message);
    }
});

export default router;
