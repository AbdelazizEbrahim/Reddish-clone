import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Community from "@/models/Community"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    await dbConnect()

    const community = await Community.findOne({ name: params.name })
      .populate("creator", "username displayName avatar")
      .populate("moderators", "username displayName avatar")

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    return NextResponse.json({ community })
  } catch (error) {
    console.error("Get community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { name: string } }) {
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

    // Check if user is moderator
    if (!community.moderators.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { description, rules } = body

    const updatedCommunity = await Community.findByIdAndUpdate(
      community._id,
      { description, rules },
      { new: true },
    ).populate("creator", "username displayName avatar")

    return NextResponse.json({ community: updatedCommunity })
  } catch (error) {
    console.error("Update community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
