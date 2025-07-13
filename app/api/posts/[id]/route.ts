import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Post from "@/models/Post"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const post = await Post.findById(params.id)
      .populate("author", "username displayName avatar")
      .populate("community", "name displayName")

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Get post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const post = await Post.findById(params.id)
    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is the author
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, content } = body

    const updatedPost = await Post.findByIdAndUpdate(params.id, { title, content }, { new: true })
      .populate("author", "username displayName avatar")
      .populate("community", "name displayName")

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error("Update post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const post = await Post.findById(params.id).populate("community")
    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is the author or a moderator
    const isAuthor = post.author.toString() === session.user.id
    const isModerator = post.community.moderators.includes(session.user.id)

    if (!isAuthor && !isModerator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await Post.findByIdAndUpdate(params.id, { isDeleted: true })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
