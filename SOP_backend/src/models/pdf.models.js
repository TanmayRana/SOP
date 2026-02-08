import { Schema, model } from "mongoose"

const pdfSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    pdfName: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    chatId:
    {
        type: String
    },
    pdfVectors: [
        {
            type: Schema.Types.ObjectId,
            ref: "PdfVector"
        }
    ]
})

const Pdf = model("Pdf", pdfSchema);
export default Pdf;