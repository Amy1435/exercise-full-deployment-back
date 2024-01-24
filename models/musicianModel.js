import dayjs from "dayjs";
import Album from "../models/albumModel.js";
import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const musicianSchema = new Schema(
    {
        first_name: {
            type: String,
            maxLength: 15,
            minLength: 1,
            required: true,
            trim: true,
        },
        last_name: {
            type: String,
            maxLength: 15,
            minLength: 1,
            required: true,
            trim: true,
        },
        art_name: {
            type: String,
            maxLength: 15,
            trim: true,
            default: null,
            validate: {
                validator: async function (art_name) {
                    if (!art_name) {
                        return true;
                    }
                    const Musician = this.constructor;
                    const isValid = !(await Musician.exists({ art_name }));
                    return isValid;
                },
                message: (prop) => `${prop.value} is already used as art_name`,
            },
        },
        age: {
            type: Number,
            max: 100,
        },
        birth_date: {
            type: Date,
            required: true,
            max: () => {
                const now = dayjs();
                const sixYearsAgo = now.subtract(6, "years");
                return sixYearsAgo.format("YYYY-MM-DD");
            },
        },
        birth_place: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 15,
            trim: true,
        },
        albums: {
            type: [SchemaTypes.ObjectId],
            ref: "Album",
        },
        slug: {
            type: String,
            trim: true,
            validate: {
                validator: async function (slug) {
                    const Musician = this.constructor;
                    const isValid =
                        this.slug === slug ||
                        !(await Musician.exists({ slug }));
                    return isValid;
                },
                message: (props) => `${props.value} is already used as slug.`,
            },
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

//METHOD TO CREATE A SLUG FOR THE MUSICIAN
musicianSchema.methods.createSlug = function () {
    const Musician = this.constructor;
    const { art_name, first_name, last_name } = this;
    let slug_name = art_name || `${first_name}-${last_name}`;
    if (slug_name !== art_name) {
        const musicians = Musician.find({ first_name, last_name }).sort({
            createdAt: -1,
        });
        const ids = musicians.map((m) => m._id.toString());
        const index = ids.indexOf(this._id.toString());
        if (index > 0) {
            slug_name + "-" + index;
        }
    }
    this.slug = slug_name.replaceAll(" ", "-").toLowerCase();
};

//METHOD TO REMOVE THE ALBUM FROM THE MUSICIAN
musicianSchema.methods.removeAlbum = async function (albumId) {
    const albumIds = this.albums.map((a) => a._id.toString());
    if (albumIds.includes(albumId)) {
        albumIds.splice(albumId.indexOf(albumId), 1);
        this.albums = albumIds;
        await this.save();
        console.log(
            `An album was removed from musician ${this.first_name} ${this.last_name}`
        );
    }
};

//METHOD TO ADD AN ALBUM TO A MUSICIAN
musicianSchema.methods.addAlbum = async function (albumId) {
    const albumIds = this.albums.map((a) => a._id.toString());
    if (!albumIds.includes(albumId)) {
        albumIds.push(albumId);
        this.albums = albumIds;
        await this.save();
        console.log(
            `A new album was added to Musician ${this.first_name} ${this.last_name}`
        );
    }
};

//METHOD TO SYNC THE ALBUM
musicianSchema.methods.syncAlbums = async function () {
    const albumsId = this.albums.map((a) => a._id.toString());
    for (let i = 0; i < albumsId.length; i++) {
        const albumId = albumsId[i];
        const album = await Album.findById(albumId);
        const authorId = this._id.toString();
        if (album.author?.toString !== authorId) {
            await album.changeMusician(authorId);
        }
    }
};

//SCHEMA MIDDLEWARE PRE SAVE
musicianSchema.pre("save", async function (next) {
    const Musician = this.constructor;
    await this.createSlug();
    if (this.isModified("albums")) {
        const oldMusicianId = this._id.toString();
        const oldMusician = await Musician.findById(oldMusicianId);
        if (oldMusician) {
            this.albums = oldMusician.albums.map((a) => a._id.toString());
            await this.syncComics();
        }
    }
    next();
});

//SCHEMA MIDDLEWARE POST SAVE

const musicianModel = model("Musician", musicianSchema);

export default musicianModel;
