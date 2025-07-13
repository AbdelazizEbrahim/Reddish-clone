"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState([])
  const [communities, setCommunities] = useState([])
  const [sortBy, setSortBy] = useState("hot")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    fetchCommunities()
  }, [sortBy])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?sort=${sortBy}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunities = async () => {
    try {
      const response = await fetch("/api/communities?limit=5")
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.communities)
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={sortBy} onValueChange={setSortBy} className="mb-6">
              <TabsList>
                <TabsTrigger value="hot">Hot</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="top">Top</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div>
                {posts.map((post: any) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">No posts found</p>
                  {session && (
                    <Button asChild>
                      <Link href="/submit">Create the first post</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {!session && (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Reddish</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join the community to create posts, comment, and vote!
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Popular Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communities.map((community: any) => (
                    <div key={community._id} className="flex items-center justify-between">
                      <Link href={`/r/${community.name}`} className="text-sm hover:underline">
                        r/{community.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{community.memberCount} members</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                  <Link href="/communities">View All</Link>
                </Button>
              </CardContent>
            </Card>

            {session && (
              <Card>
                <CardHeader>
                  <CardTitle>Create</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/submit">Create Post</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/communities/create">Create Community</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
