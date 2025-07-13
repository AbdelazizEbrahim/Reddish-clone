import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  _id: string
  email: string
  password?: string
  username: string
  displayName: string
  bio?: string
  avatar?: string
  joinedCommunities: string[]
  karma: number
  createdAt: Date
  updatedAt: Date
  bannedFrom: string[]
  isEmailVerified: boolean
  resetPasswordToken?: string
  resetPasswordExpires?: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Optional for OAuth users
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatar: {
      type: String,
    },
    joinedCommunities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Community",
      },
    ],
    karma: {
      type: Number,
      default: 0,
    },
    bannedFrom: [
      {
        type: Schema.Types.ObjectId,
        ref: "Community",
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
