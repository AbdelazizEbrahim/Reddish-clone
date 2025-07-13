import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Community from "@/models/Community"
import User from "@/models/User"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const community = await Community.findOne({ name: params.name })
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    // Check if user is banned
    const user = await User.findById(session.user.id)
    if (user?.bannedFrom.includes(community._id)) {
      return NextResponse.json({ error: "You are banned from this community" }, { status: 403 })
    }

    // Check if already a member
    if (community.members.includes(session.user.id)) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 })
    }

    // Add user to community
    await Community.findByIdAndUpdate(community._id, {
      $push: { members: session.user.id },
      $inc: { memberCount: 1 },
    })

    // Add community to user's joined communities
    await User.findByIdAndUpdate(session.user.id, {
      $push: { joinedCommunities: community._id },
    })

    return NextResponse.json({ message: "Joined community successfully" })
  } catch (error) {
    console.error("Join community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const community = await Community.findOne({ name: params.name })
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    // Remove user from community
    await Community.findByIdAndUpdate(community._id, {
      $pull: { members: session.user.id },
      $inc: { memberCount: -1 },
    })

    // Remove community from user's joined communities
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { joinedCommunities: community._id },
    })

    return NextResponse.json({ message: "Left community successfully" })
  } catch (error) {
    console.error("Leave community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
