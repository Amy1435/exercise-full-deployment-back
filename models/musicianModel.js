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
            unique: true,
            sparse: true,
        },
        age: {
            type: Number,
            max: 100,
        },
        hobbies: {
            type: [String],
        },
        awards: {
            type: [String],
        },
        url_img: {
            type: String,
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
            unique: true,
            validate: {
                validator: async function (slug) {
                    const Author = this.constructor;
                    const isValid =
                        this.slug === slug || !(await Author.exists({ slug }));
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
musicianSchema.methods.createSlug = async function () {
    const Musician = this.constructor;
    const { art_name, first_name, last_name } = this;
    let slug_name = art_name || `${first_name}-${last_name}`;
    if (slug_name !== art_name) {
        const musicians = await Musician.find({ first_name, last_name }).sort({
            createdAt: -1,
        });
        const ids = musicians.map((a) => a._id.toString());
        const index = ids.indexOf(this._id.toString());
        if (index > 0) {
            slug_name += "-" + index;
        }
    }
    this.slug = slug_name.replaceAll(" ", "-").toLowerCase();
};

//METHOD TO REMOVE THE ALBUM FROM THE MUSICIAN
musicianSchema.methods.removeAlbum = async function (albumId) {
    const Musician = this.constructor;
    const albumIds = this.albums.map((a) => a._id.toString());
    if (albumIds.includes(albumId)) {
        albumIds.splice(albumId.indexOf(albumId), 1);
        await Musician.findByIdAndUpdate(this._id, { albums: albumIds });
        console.log(
            `An album was removed from musician ${this.first_name} ${this.last_name}`
        );
    }
};

//METHOD TO ADD AN ALBUM TO A MUSICIAN
musicianSchema.methods.addAlbum = async function (albumId) {
    const Musician = this.constructor;
    const albumIds = this.albums.map((a) => a._id.toString());
    if (!albumIds.includes(albumId)) {
        albumIds.push(albumId);
        await Musician.findByIdAndUpdate(this._id, { albums: albumIds });
        console.log(
            `A new album was added to Musician ${this.first_name} ${this.last_name}`
        );
    }
};

//STATIC METHOD TO USE IN THE ROUTES TO FIND ALBUM BY THE SLUG
musicianSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug });
};

// METHOD TO TAKE AWAIT THE MUSICIANS FROM THE ALBUMS WHEN DELETED
musicianSchema.methods.removeFromAlbum = async function () {
    const albumIds = this.albums.map((a) => a._id.toString());
    albumIds.forEach(async (albumId) => {
        const album = await Album.findById(albumId);
        await album.changeMusician(null);
    });
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
        }
    }
    next();
});

//SCHEMA MIDDLEWARE POST SAVE
musicianSchema.post("save", async function (doc, next) {
    const { oldAlbums, _id } = doc;
    if (oldAlbums) {
        const newAlbums = doc.albums.map((a) => a._id.toString());
        oldAlbums.forEach(async (oldAlbumId) => {
            if (!newAlbums.includes(oldAlbumId)) {
                const album = await Album.findById(oldAlbumId);
                if (album) {
                    await album.changeMusician(null);
                    console.log(`Musician remove from Album ${album.title}`);
                }
            }
        });
        newAlbums.forEach(async (newAlbumId) => {
            if (!oldAlbums.includes(newAlbumId)) {
                const album = await Album.findById(newAlbumId);
                if (album) {
                    await album.changeMusician(_id);
                    console.log(`Musician changed on Album ${album.title}`);
                }
            }
        });
    }

    next();
});
const musicianModel = model("Musician", musicianSchema);

export default musicianModel;
