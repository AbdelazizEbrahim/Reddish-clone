import mongoose, { type Document, Schema } from "mongoose"

export interface ICommunity extends Document {
  _id: string
  name: string
  displayName: string
  description: string
  avatar?: string
  banner?: string
  creator: string
  moderators: string[]
  members: string[]
  memberCount: number
  rules: string[]
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 3,
      maxlength: 21,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    avatar: String,
    banner: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    memberCount: {
      type: Number,
      default: 0,
    },
    rules: [String],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Community || mongoose.model<ICommunity>("Community", CommunitySchema)
