"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users } from "lucide-react"

export default function CommunitiesPage() {
  const { data: session } = useSession()
  const [communities, setCommunities] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunities()
  }, [searchQuery])

  const fetchCommunities = async () => {
    try {
      const url = searchQuery ? `/api/communities?search=${encodeURIComponent(searchQuery)}` : "/api/communities"

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.communities)
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCommunities()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Communities</h1>
          {session && (
            <Button asChild>
              <Link href="/communities/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Link>
            </Button>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search communities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community: any) => (
              <Card key={community._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      <Link href={`/r/${community.name}`} className="hover:text-blue-600">
                        r/{community.name}
                      </Link>
                    </CardTitle>
                    <Badge variant="secondary" className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {community.memberCount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{community.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Created by u/{community.creator.username}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/r/${community.name}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && communities.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No communities found matching your search." : "No communities found."}
              </p>
              {session && (
                <Button asChild>
                  <Link href="/communities/create">Create the first community</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
