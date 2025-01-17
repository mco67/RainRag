export function splitMarkdown(text: string, maxSize: number = 4096) {
  const chunks = []
  let currentChunk = ''

  // Diviser le texte en lignes
  const lines = text.split('\n')

  for (const line of lines) {
    const lineSize = Buffer.byteLength(line, 'utf8') + 1 // +1 pour le saut de ligne

    // Si la ligne dépasse directement la taille maximale
    if (lineSize > maxSize) {
      throw new Error('Une seule ligne dépasse la taille maximale autorisée.')
    }

    // Vérifier si l'ajout de la ligne dépasse la taille maximale du chunk
    if (Buffer.byteLength(currentChunk, 'utf8') + lineSize > maxSize) {
      // Ajouter le chunk actuel aux morceaux et en commencer un nouveau
      chunks.push(currentChunk.trim())
      currentChunk = ''
    }

    // Ajouter la ligne actuelle au chunk
    currentChunk += line + '\n'
  }

  // Ajouter le dernier chunk s'il n'est pas vide
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}
