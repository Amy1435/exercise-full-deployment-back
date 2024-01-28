import mongoose from "mongoose";
import Musician from "../models/musicianModel.js";
const { Schema, SchemaTypes, model } = mongoose;

const albumSchema = new Schema(
    {
        title: {
            type: String,
            maxLength: 20,
            minLength: 1,
            required: true,
            trim: true,
        },
        number_of_songs: {
            type: Number,
        },
        musician: {
            type: SchemaTypes.ObjectId,
            ref: "Musician",
            maxLength: 20,
            required: true,
        },
        genre: {
            type: [String],
            trim: true,
        },
        year_of_publication: {
            type: Number,
        },
        url_album: {
            type: String,
        },
        slug: {
            type: String,
            trim: true,
            validate: {
                validator: async function (slug) {
                    const Album = this.constructor;
                    const isValid =
                        this.slug === slug || !(await Album.exists({ slug }));
                    return isValid;
                },
                message: (prop) => `${prop.value} is already used as slug`,
            },
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

//STATIC METHOD TO USE IN THE ROUTES TO FIND ALBUM BY THE SLUG
albumSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug });
};

//METHOD CHANGE MUSICIAN
albumSchema.methods.changeMusician = async function (musicianId) {
    const Album = this.constructor;
    await Album.findByIdAndUpdate(this._id, { author: musicianId });
};

//METHOD CREATE SLUG
albumSchema.methods.createSlug = async function () {
    const slug = this.title.replaceAll(" ", "-").toLowerCase();
    const Album = this.constructor;
    let isSlugValid = false;
    let currentSlug = slug;
    let i = 1;
    while (!isSlugValid) {
        isSlugValid = !(await Album.exists({ slug: currentSlug }));
        if (!isSlugValid) {
            currentSlug = slug + "-" + i;
            i++;
        }
    }
    this.slug = currentSlug;
};

//METHOD REMOVE ALBUM FROM MUSICIAN
albumSchema.methods.removeFromMusician = async function () {
    if (this.musician) {
        const oldMusician = await Musician.findById(this.musician);
        if (oldMusician) {
            await oldMusician.removeAlbum(this._id.toString());
        }
    }
};

//SCHEMA MIDDLEWARE PRE SAVE, IF MUSICIAN CHANGES IT REMOVES THE ALBUM FROM THE OLD ONE
albumSchema.pre("save", async function (next) {
    const Album = this.constructor;
    if (!this.slug) {
        await this.createSlug();
    }

    if (this.isModified("musician")) {
        this.isMusicianModifed = true;
        const oldAlbumId = this._id.toString();
        const oldAlbum = await Album.findById(oldAlbumId);
        if (oldAlbum) {
            await oldAlbum.removeFromMusician();
        }
    }
});

//MIDDLEWARE POST
albumSchema.post("save", async function (doc, next) {
    if (doc.isMusicianModifed) {
        const newMusicianId = doc.musician?.toString();
        if (newMusicianId) {
            const newMusician = await Musician.findById(newMusicianId);
            if (newMusician) {
                await newMusician.addAlbum(doc._id);
            }
        }
        delete doc.isMusicianModifed;
    }
    next();
});

const albumModel = model("Album", albumSchema);

export default albumModel;
