import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Comment from "@/models/Comment"
import Post from "@/models/Post"
import { authOptions } from "@/lib/auth"
import { createCommentSchema } from "@/lib/validations"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const comments = await Comment.find({
      post: params.id,
      isDeleted: false,
    })
      .populate("author", "username displayName avatar")
      .populate("replies")
      .sort({ createdAt: 1 })

    // Build comment tree
    const commentMap = new Map()
    const rootComments: any[] = []

    comments.forEach((comment) => {
      commentMap.set(comment._id.toString(), { ...comment.toObject(), replies: [] })
    })

    comments.forEach((comment) => {
      if (comment.parent) {
        const parent = commentMap.get(comment.parent.toString())
        if (parent) {
          parent.replies.push(commentMap.get(comment._id.toString()))
        }
      } else {
        rootComments.push(commentMap.get(comment._id.toString()))
      }
    })

    return NextResponse.json({ comments: rootComments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, parentId } = createCommentSchema.parse({
      ...body,
      postId: params.id,
    })

    await dbConnect()

    // Check if post exists
    const post = await Post.findById(params.id)
    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    let depth = 0
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (parentComment) {
        depth = parentComment.depth + 1
      }
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author: session.user.id,
      post: params.id,
      parent: parentId || null,
      depth,
    })

    // Update parent comment replies
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { replies: comment._id },
      })
    }

    // Update post comment count
    await Post.findByIdAndUpdate(params.id, {
      $inc: { commentCount: 1 },
    })

    const populatedComment = await Comment.findById(comment._id).populate("author", "username displayName avatar")

    return NextResponse.json({ comment: populatedComment })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
