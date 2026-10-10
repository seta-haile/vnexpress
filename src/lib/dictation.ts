import { ArticleDetail } from "@/types/news";

export interface MaskedWord {
  id: string;
  wordIndex: number;
  originalText: string; // The token as it appeared in sentence e.g. "Germany,"
  cleanWord: string;    // Normalized word for checking e.g. "germany"
  displayWord: string;  // Word without surrounding punctuation e.g. "Germany"
  prefixPunct: string;  // e.g. '"' or '('
  suffixPunct: string;  // e.g. ',' or '.'
  isMasked: boolean;
  hintLetter: string;   // first letter e.g. "G"
}

export interface DictationChunk {
  id: number;
  text: string;
  words: MaskedWord[];
  maskedWordIds: string[];
  paragraphIndex: number;
}

export type DictationDifficulty = "easy" | "medium" | "hard";

const COMMON_STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "as", "is", "am", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "he", "she", "it", "they", "we",
  "i", "you", "his", "her", "its", "their", "our", "my", "your", "that", "this",
  "these", "those", "which", "who", "whom", "whose", "if", "then", "so", "than"
]);

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export function isWordMatch(userInput: string, target: string): boolean {
  const cleanInput = normalizeWord(userInput);
  const cleanTarget = normalizeWord(target);
  return cleanInput.length > 0 && cleanInput === cleanTarget;
}

/**
 * Splits text into natural sentence chunks of approximately 15-25 words.
 */
function splitIntoNaturalChunks(text: string, maxWordsPerChunk: number = 24): string[] {
  if (!text || text.trim().length === 0) return [];

  // Split by sentence boundaries (. ! ?)
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const chunks: string[] = [];

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    if (words.length <= maxWordsPerChunk) {
      chunks.push(sentence);
    } else {
      // If a sentence is long, split by clause boundaries (, ; : -)
      const clauses = sentence.split(/(?<=[,;:\u2014])\s+/);
      let currentChunkWords: string[] = [];

      for (const clause of clauses) {
        const clauseWords = clause.trim().split(/\s+/);
        if (currentChunkWords.length + clauseWords.length <= maxWordsPerChunk) {
          currentChunkWords.push(...clauseWords);
        } else {
          if (currentChunkWords.length > 0) {
            chunks.push(currentChunkWords.join(" "));
            currentChunkWords = [];
          }
          if (clauseWords.length > maxWordsPerChunk) {
            // Further subdivide if a single clause is very long
            for (let i = 0; i < clauseWords.length; i += maxWordsPerChunk) {
              chunks.push(clauseWords.slice(i, i + maxWordsPerChunk).join(" "));
            }
          } else {
            currentChunkWords.push(...clauseWords);
          }
        }
      }

      if (currentChunkWords.length > 0) {
        chunks.push(currentChunkWords.join(" "));
      }
    }
  }

  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * Parses article into structured dictation chunks with masked words according to difficulty level.
 */
export function buildDictationChunks(
  article: ArticleDetail,
  difficulty: DictationDifficulty = "medium"
): DictationChunk[] {
  const allTexts: { text: string; pIdx: number }[] = [];

  if (article.lead && article.lead.trim().length > 0) {
    allTexts.push({ text: article.lead.trim(), pIdx: -1 });
  }

  article.paragraphs.forEach((p, idx) => {
    if (p.text && p.text.trim().length > 0) {
      allTexts.push({ text: p.text.trim(), pIdx: idx });
    }
  });

  const chunks: DictationChunk[] = [];
  let chunkCounter = 0;

  for (const item of allTexts) {
    const rawChunks = splitIntoNaturalChunks(item.text, 22);

    for (const rawChunk of rawChunks) {
      const tokens = rawChunk.split(/\s+/).filter((t) => t.length > 0);
      if (tokens.length < 3) continue; // Skip overly trivial chunks

      // Parse tokens into MaskedWord objects
      const parsedWords: MaskedWord[] = tokens.map((token, wordIdx) => {
        // Extract prefix and suffix punctuation
        const prefixMatch = token.match(/^[^a-zA-Z0-9]+/);
        const suffixMatch = token.match(/[^a-zA-Z0-9]+$/);
        const prefixPunct = prefixMatch ? prefixMatch[0] : "";
        const suffixPunct = suffixMatch ? suffixMatch[0] : "";
        const displayWord = token.slice(prefixPunct.length, token.length - (suffixPunct.length || 0));
        const clean = normalizeWord(displayWord);

        return {
          id: `chunk-${chunkCounter}-word-${wordIdx}`,
          wordIndex: wordIdx,
          originalText: token,
          cleanWord: clean,
          displayWord: displayWord || token,
          prefixPunct,
          suffixPunct,
          isMasked: false,
          hintLetter: displayWord ? displayWord.charAt(0) : ""
        };
      });

      // Filter eligible candidates for masking (prefer meaningful words with length >= 3 and not stop words)
      const eligibleIndices = parsedWords
        .map((w, idx) => ({ w, idx }))
        .filter(
          ({ w }) =>
            w.cleanWord.length >= 3 &&
            !COMMON_STOP_WORDS.has(w.cleanWord)
        )
        .map(({ idx }) => idx);

      // Determine target number of blanks based on difficulty
      let targetBlankCount = 2;
      if (difficulty === "easy") {
        targetBlankCount = Math.max(1, Math.min(2, Math.floor(eligibleIndices.length * 0.25)));
      } else if (difficulty === "medium") {
        targetBlankCount = Math.max(2, Math.min(4, Math.floor(eligibleIndices.length * 0.45)));
      } else {
        // hard
        targetBlankCount = Math.max(3, Math.min(6, Math.floor(eligibleIndices.length * 0.7)));
      }

      // Pick spaced out indices to avoid masking adjacent words when possible
      const chosenIndices = new Set<number>();
      const candidateList = [...eligibleIndices];

      // Shuffle candidate list
      for (let i = candidateList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidateList[i], candidateList[j]] = [candidateList[j], candidateList[i]];
      }

      for (const idx of candidateList) {
        if (chosenIndices.size >= targetBlankCount) break;
        // Check if neighbor is already masked
        if (!chosenIndices.has(idx - 1) && !chosenIndices.has(idx + 1)) {
          chosenIndices.add(idx);
        }
      }

      // If we couldn't get enough spaced words, just add without neighbor constraint
      if (chosenIndices.size < targetBlankCount) {
        for (const idx of candidateList) {
          if (chosenIndices.size >= targetBlankCount) break;
          chosenIndices.add(idx);
        }
      }

      // Apply masking
      const maskedWordIds: string[] = [];
      parsedWords.forEach((w, idx) => {
        if (chosenIndices.has(idx)) {
          w.isMasked = true;
          maskedWordIds.push(w.id);
        }
      });

      chunks.push({
        id: chunkCounter++,
        text: rawChunk,
        words: parsedWords,
        maskedWordIds,
        paragraphIndex: item.pIdx
      });
    }
  }

  return chunks;
}
