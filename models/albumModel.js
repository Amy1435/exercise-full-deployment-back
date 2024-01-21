import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const albumSchema = new Schema(
    {
        title: {
            type: String,
            maxLength: 15,
            minLength: 1,
            required: true,
        },
        numberOfSongs: {
            type: Number,
        },
        musician: {
            type: String,
            maxLength: 15,
        },
        genre: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const albumModel = model("Album", albumSchema);

export default albumModel;
