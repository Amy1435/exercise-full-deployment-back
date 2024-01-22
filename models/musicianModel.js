import dayjs from "dayjs";
import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const musicianSchema = new Schema(
    {
        first_name: {
            type: String,
            maxLength: 15,
            minLength: 1,
            trim: true,
        },
        last_name: {
            type: String,
            maxLength: 15,
            minLength: 1,
            trim: true,
        },
        art_name: {
            type: String,
            maxLength: 15,
            required: true,
            trim: true,
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
        albums: {
            type: [SchemaTypes.ObjectId],
            ref: "Album",
        },
    },
    {
        timestamps: true,
    }
);

const musicianModel = model("Musician", musicianSchema);

export default musicianModel;
