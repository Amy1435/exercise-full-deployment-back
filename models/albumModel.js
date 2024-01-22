import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const albumSchema = new Schema(
    {
        title: {
            type: String,
            maxLength: 15,
            minLength: 1,
            required: true,
            trim: true,
        },
        numberOfSongs: {
            type: Number,
        },
        musician: {
            type: SchemaTypes.ObjectId,
            ref: "Musician",
            maxLength: 15,
        },
        genre: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
            validate: {
                validator: async function (slug) {
                    const Album = this.constructor;
                    const isValid = !(await Album.exists({ slug }));
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

albumSchema.pre("save", async function (next) {
    if (this.isModified("slug") || !this.slug) {
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
    }
    next();
});

const albumModel = model("Album", albumSchema);

export default albumModel;
