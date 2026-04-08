/**
 * Formats a date into "Mon DD, YYYY" (e.g., "Apr 8, 2026").
 */
export function formatDate(date: Date): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const d = new Date(date);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Maps internal post type keys to human-readable display strings.
 */
export function getReadablePostType(type: string): string {
  const typeMap: Record<string, string> = {
    text: 'Text',
    image: 'Picture',
    audio: 'Audio',
    video: 'Video',
    link: 'Link',
  };
  return typeMap[type] ?? type;
}
