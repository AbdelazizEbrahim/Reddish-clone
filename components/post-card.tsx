"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, MessageSquare, Share, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: {
    _id: string
    title: string
    content?: string
    image?: string
    author: {
      username: string
      displayName: string
      avatar?: string
    }
    community: {
      name: string
      displayName: string
    }
    score: number
    commentCount: number
    createdAt: string
    upvotes: string[]
    downvotes: string[]
  }
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession()
  const [score, setScore] = useState(post.score)
  const [hasUpvoted, setHasUpvoted] = useState(session ? post.upvotes.includes(session.user.id) : false)
  const [hasDownvoted, setHasDownvoted] = useState(session ? post.downvotes.includes(session.user.id) : false)

  const handleVote = async (type: "up" | "down") => {
    if (!session) return

    try {
      const response = await fetch(`/api/posts/${post._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        const data = await response.json()
        setScore(data.score)
        setHasUpvoted(data.hasUpvoted)
        setHasDownvoted(data.hasDownvoted)
      }
    } catch (error) {
      console.error("Vote error:", error)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href={`/r/${post.community.name}`} className="hover:underline">
              <Badge variant="secondary">r/{post.community.name}</Badge>
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <Link href={`/u/${post.author.username}`} className="hover:underline">
              u/{post.author.username}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Link href={`/r/${post.community.name}/posts/${post._id}`}>
          <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 cursor-pointer">{post.title}</h2>
        </Link>

        {post.content && <p className="text-muted-foreground mb-3 line-clamp-3">{post.content}</p>}

        {post.image && (
          <div className="mb-3">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-lg object-cover max-h-96 w-full"
            />
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Button
              variant={hasUpvoted ? "default" : "ghost"}
              size="sm"
              onClick={() => handleVote("up")}
              disabled={!session}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="font-medium">{score}</span>
            <Button
              variant={hasDownvoted ? "destructive" : "ghost"}
              size="sm"
              onClick={() => handleVote("down")}
              disabled={!session}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/r/${post.community.name}/posts/${post._id}`}>
              <MessageSquare className="h-4 w-4 mr-1" />
              {post.commentCount} Comments
            </Link>
          </Button>

          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
