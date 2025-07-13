import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Community from "@/models/Community"
import User from "@/models/User"
import { authOptions } from "@/lib/auth"
import { createCommunitySchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { displayName: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    }

    const communities = await Community.find(query)
      .populate("creator", "username displayName")
      .sort({ memberCount: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    return NextResponse.json({ communities })
  } catch (error) {
    console.error("Get communities error:", error)
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
    const { name, displayName, description } = createCommunitySchema.parse(body)

    await dbConnect()

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name })
    if (existingCommunity) {
      return NextResponse.json({ error: "Community with this name already exists" }, { status: 400 })
    }

    // Create community
    const community = await Community.create({
      name,
      displayName,
      description,
      creator: session.user.id,
      moderators: [session.user.id],
      members: [session.user.id],
      memberCount: 1,
    })

    // Add community to user's joined communities
    await User.findByIdAndUpdate(session.user.id, {
      $push: { joinedCommunities: community._id },
    })

    return NextResponse.json({ community })
  } catch (error) {
    console.error("Create community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
