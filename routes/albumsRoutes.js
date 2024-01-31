import Album from "../models/albumModel.js";
import express from "express";
const router = express.Router();

//GET RESOURCES
router.get("/", async (req, res) => {
    try {
        const albums = await Album.find().populate({
            path: "musician",
            select: "first_name last_name art_name",
        });
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
        const album = await Album.findBySlug(slug).populate({
            path: "musician",
            select: "first_name last_name art_name slug age",
        });
        if (!album) {
            throw new Error(`Resource with ID ${slug} not found.`);
        }
        res.send(album);
    } catch (err) {
        console.error(err.message);
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
        const album = await Album.findById(_id);
        res.status(201).send(album);
    } catch (err) {
        console.error(err.message);
        res.status(400).send(err.message);
    }
});

//PATCH
router.patch("/:slug", async (req, res) => {
    if (!req.body || !Object.keys(req.body).length) {
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
        const albumSend = await Album.findById(album._id).populate({
            path: "musician",
            select: "first_name last_name art_name _id",
        });
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
        await album.removeFromAuthor();
        await Album.deleteOne({ slug });
        res.send(`Data with SLUG ${slug} deleted`);
    } catch (err) {
        console.error(err.message);
        res.status(404).send(err.message);
    }
});

export default router;
