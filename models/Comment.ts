import mongoose, { type Document, Schema } from "mongoose"

export interface IComment extends Document {
  _id: string
  content: string
  author: string
  post: string
  parent?: string
  replies: string[]
  upvotes: string[]
  downvotes: string[]
  score: number
  depth: number
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
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
    depth: {
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

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)
