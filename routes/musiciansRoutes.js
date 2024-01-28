import Album from "../models/albumModel.js";
import Musician from "../models/musicianModel.js";
import express from "express";
const router = express.Router();

//GET musicianS
router.get("/", async (req, res) => {
    try {
        const musicians = await Musician.find().select("-__v");
        res.send(musicians);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(`Server error.`);
    }
});

//GET SINGLE musician
router.get("/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
        const musician = await Musician.findBySlug(slug).populate({
            path: "albums",
            select: "title slug",
        });
        if (!musician) {
            res.status(404).send(`musician with ID ${slug} not found.`);
        } else {
            res.send(musician);
        }
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
        const { _id } = await Musician.create(req.body);
        const musician = await Musician.findById(_id);
        res.status(201).send(musician);
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
        const musician = await Musician.findBySlug(slug);
        if (!musician) {
            res.status(400).send(`The is no musician  with SLUG ${slug} `);
        }
        newProperties.forEach(([key, value]) => {
            musician[key] = value;
        });
        await musician.save();
        res.send(musician);
    } catch (err) {
        console.error(err.stack);
        res.status(404).send(err.message);
    }
});

//DELETE
router.delete("/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
        const musician = await Musician.findBySlug(slug);
        await musician.removeFromAlbum();
        await Musician.findByIdAndDelete(musician._id);
        res.send(`Data with SLUG ${slug} deleted`);
    } catch (err) {
        console.error(err.message);
        res.status(404).send(err.message);
    }
});

export default router;
