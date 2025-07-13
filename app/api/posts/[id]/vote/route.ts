import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Post from "@/models/Post"
import User from "@/models/User"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body // 'up' or 'down'

    await dbConnect()

    const post = await Post.findById(params.id)
    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const userId = session.user.id
    const hasUpvoted = post.upvotes.includes(userId)
    const hasDownvoted = post.downvotes.includes(userId)

    let updateQuery: any = {}
    let karmaChange = 0

    if (type === "up") {
      if (hasUpvoted) {
        // Remove upvote
        updateQuery = { $pull: { upvotes: userId } }
        karmaChange = -1
      } else {
        // Add upvote, remove downvote if exists
        updateQuery = {
          $push: { upvotes: userId },
          $pull: { downvotes: userId },
        }
        karmaChange = hasDownvoted ? 2 : 1
      }
    } else if (type === "down") {
      if (hasDownvoted) {
        // Remove downvote
        updateQuery = { $pull: { downvotes: userId } }
        karmaChange = 1
      } else {
        // Add downvote, remove upvote if exists
        updateQuery = {
          $push: { downvotes: userId },
          $pull: { upvotes: userId },
        }
        karmaChange = hasUpvoted ? -2 : -1
      }
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(params.id, updateQuery, { new: true })

    // Update score
    const score = updatedPost.upvotes.length - updatedPost.downvotes.length
    await Post.findByIdAndUpdate(params.id, { score })

    // Update author karma
    await User.findByIdAndUpdate(post.author, {
      $inc: { karma: karmaChange },
    })

    return NextResponse.json({
      score,
      hasUpvoted: updatedPost.upvotes.includes(userId),
      hasDownvoted: updatedPost.downvotes.includes(userId),
    })
  } catch (error) {
    console.error("Vote post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
