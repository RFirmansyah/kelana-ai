export interface DaySection {
  day: number
  title: string
  content: string
}

/**
 * Splits an AI-generated markdown itinerary into per-day sections.
 * Matches headings like:
 *   ## Day 1, ## Day 1:, ## Day 1 - Title, **Day 1**, ### Day 1, etc.
 */
export function parseItinerary(markdown: string): DaySection[] {
  // Split on any heading that starts with "Day N"
  const dayPattern = /^#{1,3}\s*\*{0,2}Day\s+(\d+)\*{0,2}(.*)/im

  const lines = markdown.split("\n")
  const sections: DaySection[] = []
  let current: DaySection | null = null

  for (const line of lines) {
    const match = line.match(/^#{1,3}\s*\*{0,2}Day\s+(\d+)\*{0,2}(.*)/i)
    if (match) {
      if (current) sections.push(current)
      const day = parseInt(match[1], 10)
      // Clean up the title: strip leading separators and whitespace
      const title = match[2].replace(/^[\s:–\-]+/, "").trim()
      current = { day, title, content: "" }
    } else if (current) {
      current.content += line + "\n"
    }
  }

  if (current) sections.push(current)

  // If no day headings found, return the whole thing as one block
  if (sections.length === 0 && markdown.trim()) {
    return [{ day: 0, title: "Itinerary", content: markdown }]
  }

  return sections
}
