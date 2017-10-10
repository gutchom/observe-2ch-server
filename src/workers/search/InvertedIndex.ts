export interface Location {
  document: string
  position: number
}

export interface Ngram {
  locations: Location[]
  substring: string
}

/**
 * Invert index of N-gram (bi-gram)
 * @constructor
 * @param {string} docId - identifier of the document which this text belongs to
 * @param {string} text - body content of this document
 */
export default class InvertedIndex {
  private index: Ngram[]

  constructor(docId?: string, text?: string) {
    this.index = typeof docId !== 'undefined' && typeof text !== 'undefined'
      ? InvertedIndex.ngrams(docId, text).reduce(this.dedupe, []) : []
  }

  get all(): Ngram[] {
    return [...this.index]
  }

  locations(substring: string): Location[] {
    const ngram = this.index.find(ngram => ngram.substring === substring)

    return typeof ngram !== 'undefined' ? ngram.locations : []
  }

  merge(index: Ngram[]): this {
    this.index = this.index.reduce(this.dedupe, index)

    return this
  }

  private dedupe(ngrams: Ngram[], { substring, locations }: Ngram): Ngram[] {
    let matched = false

    const index = ngrams
      .map(ngram => (matched = substring === ngram.substring) ? {
        ...ngram,
        locations: ngram.locations.concat(locations).filter(
          (base, index, self) => index <= self.findIndex(({ document, position }) => base.document === document && base.position === position)
        )
      } : ngram)
      .filter((base, index, self) => index <= self.findIndex(({ substring }) => base.substring === substring))

    return matched ? index : index.concat({ substring, locations })
  }

  private static ngrams(document: string, text: string): Ngram[] {
    const ngrams: Ngram[] = []

    for (let i = text.length; 1 < i; i--) {
      const position = text.length - i
      const substring = text.substring(position, position + 2)
      ngrams.push({ substring, locations: [{ document, position }] })
    }

    return ngrams
  }
}
