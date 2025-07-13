import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Post from "@/models/Post"
import Community from "@/models/Community"
import { authOptions } from "@/lib/auth"
import { createPostSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const communityName = searchParams.get("community")
    const sort = searchParams.get("sort") || "hot"
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search")

    const query: any = { isDeleted: false }

    if (communityName) {
      const community = await Community.findOne({ name: communityName })
      if (community) {
        query.community = community._id
      }
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
    }

    let sortQuery: any = {}
    switch (sort) {
      case "new":
        sortQuery = { createdAt: -1 }
        break
      case "top":
        sortQuery = { score: -1 }
        break
      case "hot":
      default:
        // Hot algorithm: score / (age in hours + 2)^1.8
        sortQuery = { createdAt: -1 } // Simplified for now
        break
    }

    const posts = await Post.find(query)
      .populate("author", "username displayName avatar")
      .populate("community", "name displayName")
      .sort(sortQuery)
      .limit(limit)
      .skip((page - 1) * limit)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, image, communityId } = createPostSchema.parse(body)

    await dbConnect()

    // Check if community exists and user is a member
    const community = await Community.findById(communityId)
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    if (!community.members.includes(session.user.id)) {
      return NextResponse.json({ error: "You must be a member to post" }, { status: 403 })
    }

    // Create post
    const post = await Post.create({
      title,
      content,
      image,
      author: session.user.id,
      community: communityId,
    })

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username displayName avatar")
      .populate("community", "name displayName")

    return NextResponse.json({ post: populatedPost })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
