import React from 'react'

const PodcastDetails = async ({ params }: { params: Promise<{ podcastId: string }> }) => {
  const { podcastId } = await params;

  return (
    <p className="text-white-1">Podcast details for {podcastId}</p>
  )
}

export default PodcastDetails
