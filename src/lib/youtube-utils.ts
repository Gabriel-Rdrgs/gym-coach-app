/**
 * Converte URLs do YouTube para formato de embed
 * Suporta vários formatos de URL do YouTube
 */
export function convertYouTubeUrlToEmbed(url: string | null | undefined): string | null {
  if (!url) return null;

  // Se já é uma URL de embed, retorna como está
  if (url.includes('youtube.com/embed/') || url.includes('youtu.be/embed/')) {
    return url;
  }

  // Extrair o ID do vídeo de diferentes formatos
  let videoId: string | null = null;

  // Formato: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // Se não encontrou o ID, retorna null
  if (!videoId) {
    return null;
  }

  // Retornar URL de embed
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Verifica se uma URL é do YouTube
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Extrai o ID do vídeo do YouTube de uma URL
 */
export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;

  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (watchMatch) {
    return watchMatch[1];
  }

  const embedMatch = url.match(/youtube\.com\/embed\/([^&\n?#]+)/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}

