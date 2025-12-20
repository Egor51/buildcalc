/**
 * Universal video embed component
 * Supports YouTube and Rutube video platforms
 * 
 * YouTube formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * 
 * Rutube formats:
 * - https://rutube.ru/video/VIDEO_ID/
 * - https://rutube.ru/play/embed/VIDEO_ID
 */

type VideoEmbedProps = {
  url: string;
  title?: string;
};

type VideoPlatform = "youtube" | "rutube" | null;

/**
 * Detect video platform from URL
 */
function detectPlatform(url: string): VideoPlatform {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("rutube.ru")) {
    return "rutube";
  }
  return null;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Rutube video ID from various URL formats
 */
function extractRutubeId(url: string): string | null {
  const patterns = [
    /rutube\.ru\/video\/([^\/\?]+)/,
    /rutube\.ru\/play\/embed\/([^\/\?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get embed URL for the video platform
 */
function getEmbedUrl(platform: VideoPlatform, videoId: string): string | null {
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}`;
    case "rutube":
      return `https://rutube.ru/play/embed/${videoId}`;
    default:
      return null;
  }
}

export function YouTubeVideo({ url, title }: VideoEmbedProps) {
  const platform = detectPlatform(url);
  
  if (!platform) {
    console.warn(`Unsupported video platform: ${url}`);
    return null;
  }

  let videoId: string | null = null;
  
  if (platform === "youtube") {
    videoId = extractYouTubeId(url);
  } else if (platform === "rutube") {
    videoId = extractRutubeId(url);
  }

  if (!videoId) {
    console.warn(`Invalid ${platform} URL: ${url}`);
    return null;
  }

  const embedUrl = getEmbedUrl(platform, videoId);
  
  if (!embedUrl) {
    return null;
  }

  const platformName = platform === "youtube" ? "YouTube" : "Rutube";

  return (
    <div className="my-6 sm:my-8">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={embedUrl}
          title={title || `${platformName} video player`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
