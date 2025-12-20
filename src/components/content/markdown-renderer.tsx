/**
 * Simple markdown renderer component
 * Converts basic markdown syntax to HTML
 * For full MDX support, consider installing next-mdx-remote
 */

type MarkdownRendererProps = {
  content: string;
};

/**
 * Generate ID from heading text (same logic as in guide-loader.ts)
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown to HTML conversion
  let html = content;

  // Headings with IDs for anchor links
  html = html.replace(/^### (.*$)/gim, (match, text) => {
    const id = generateHeadingId(text);
    return `<h3 id="${id}" class="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3 scroll-mt-20">${text}</h3>`;
  });
  html = html.replace(/^## (.*$)/gim, (match, text) => {
    const id = generateHeadingId(text);
    return `<h2 id="${id}" class="text-xl sm:text-2xl font-semibold mt-5 sm:mt-6 mb-3 sm:mb-4 scroll-mt-20">${text}</h2>`;
  });
  html = html.replace(/^# (.*$)/gim, (match, text) => {
    const id = generateHeadingId(text);
    return `<h1 id="${id}" class="text-2xl sm:text-3xl font-semibold mt-6 sm:mt-8 mb-4 sm:mb-5 scroll-mt-20">${text}</h1>`;
  });

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline-offset-4 hover:underline">$1</a>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
  html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/^(\d+)\. (.*$)/gim, "<li>$2</li>");

  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return `<ul class="list-disc pl-5 sm:pl-6 space-y-2 my-4">${match}</ul>`;
  });

  // Paragraphs (lines that aren't already wrapped)
  const lines = html.split("\n");
  const processedLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = line.startsWith("<li>");
    const isHeading = line.match(/^<h[1-6]>/);
    const isEmpty = line.trim() === "";

    if (isListItem) {
      if (!inList) {
        inList = true;
      }
      processedLines.push(line);
    } else {
      if (inList) {
        inList = false;
      }
      if (isEmpty) {
        processedLines.push("");
      } else if (isHeading) {
        processedLines.push(line);
      } else if (!line.startsWith("<")) {
        processedLines.push(`<p class="mb-3 sm:mb-4 text-sm sm:text-base leading-6 sm:leading-7 text-muted-foreground">${line}</p>`);
      } else {
        processedLines.push(line);
      }
    }
  }

  html = processedLines.join("\n");

  // Code blocks (simple)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto my-3 sm:my-4 text-xs sm:text-sm"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs sm:text-sm">$1</code>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-3 sm:pl-4 italic my-3 sm:my-4 text-sm sm:text-base text-muted-foreground">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-border" />');

  return (
    <div
      className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:mt-6 prose-headings:mb-4 prose-p:mb-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
