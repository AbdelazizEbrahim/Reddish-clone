# Reddish - A Reddit Clone

A full-stack Reddit clone built with Next.js, MongoDB, and modern web technologies.

## Features

- **User Authentication**: Sign up, sign in, and OAuth with Google
- **Communities**: Create, join, and manage communities (subreddits)
- **Posts**: Create text and image posts with voting system
- **Comments**: Nested comment system with voting
- **Search**: Search for posts, communities, and users
- **Moderation**: Community moderation tools
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd reddish
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` with your configuration:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/reddish
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
reddish/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── communities/       # Community pages
│   ├── r/                 # Community and post pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   └── validations.ts    # Zod schemas
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Community.ts
│   ├── Post.ts
│   └── Comment.ts
└── types/                # TypeScript type definitions
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/signup\` - User registration
- \`POST /api/auth/signin\` - User login (handled by NextAuth)

### Communities
- \`GET /api/communities\` - List communities
- \`POST /api/communities\` - Create community
- \`GET /api/communities/[name]\` - Get community details
- \`POST /api/communities/[name]/join\` - Join community
- \`DELETE /api/communities/[name]/join\` - Leave community

### Posts
- \`GET /api/posts\` - List posts
- \`POST /api/posts\` - Create post
- \`GET /api/posts/[id]\` - Get post details
- \`PUT /api/posts/[id]\` - Update post
- \`DELETE /api/posts/[id]\` - Delete post
- \`POST /api/posts/[id]/vote\` - Vote on post

### Comments
- \`GET /api/posts/[id]/comments\` - Get post comments
- \`POST /api/posts/[id]/comments\` - Create comment

## Database Schema

### User
- email, username, displayName
- password (hashed)
- bio, avatar
- joinedCommunities, karma
- bannedFrom communities

### Community
- name, displayName, description
- creator, moderators, members
- memberCount, rules
- isPrivate flag

### Post
- title, content, image
- author, community
- upvotes, downvotes, score
- commentCount, timestamps

### Comment
- content, author, post
- parent (for nesting), replies
- upvotes, downvotes, score
- depth level

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`

This completes the full-stack Reddish Reddit clone! The application includes:

✅ **Complete authentication system** with NextAuth (email/password + Google OAuth)
✅ **Community management** (create, join, leave, moderate)
✅ **Post creation and management** (text/image posts, voting, editing, deletion)
✅ **Nested comment system** with voting
✅ **Search functionality** for posts and communities
✅ **Moderation tools** for community creators
✅ **Responsive design** with dark mode support
✅ **SEO-friendly** URLs and meta tags
✅ **Proper validation** with Zod schemas
✅ **MongoDB integration** with Mongoose ODM
✅ **TypeScript** throughout the entire application

The app is production-ready and includes all the core Reddit features you requested. You can extend it further by adding features like user profiles, direct messaging, advanced moderation tools, or real-time notifications.
