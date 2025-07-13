import mongoose, { type Document, Schema } from "mongoose"

export interface IPost extends Document {
  _id: string
  title: string
  content?: string
  image?: string
  author: string
  community: string
  upvotes: string[]
  downvotes: string[]
  score: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      maxlength: 10000,
    },
    image: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema)
