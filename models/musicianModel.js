import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const musicianSchema = new Schema(
    {
        firstName: {
            type: String,
            maxLength: 10,
            minLength: 1,
        },
        lastName: {
            type: String,
            maxLength: 10,
            minLength: 1,
        },
        artName: {
            type: String,
            maxLength: 15,
            required: true,
        },
        age: {
            type: Number,
            max: 100,
        },
    },
    {
        timestamps: true,
    }
);

const musicianModel = model("Musician", musicianSchema);

export default musicianModel;
