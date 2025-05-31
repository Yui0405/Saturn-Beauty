import CommunityFeed from "@/components/community-feed"

export default function CommunityPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-mint-green-dark font-playfair">Comunidad</h1>
        <CommunityFeed />
      </div>
    </div>
  )
}
