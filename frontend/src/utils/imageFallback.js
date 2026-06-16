export const FALLBACK_BOUQUET_IMAGE =
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=600&q=80';

export function handleImageError(event) {
  if (event.target.src !== FALLBACK_BOUQUET_IMAGE) {
    event.target.src = FALLBACK_BOUQUET_IMAGE;
  }
}
