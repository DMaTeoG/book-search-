import { Book } from '../moduls/Book';

export type EngineStrategy = 'sync' | 'microtask' | 'macrotask';

export interface ProgressCallback {
  (processedChunks: number, totalChunks: number): void;
}

export class BookSearchEngine {
  private catalog: Book[] = [];
  private readonly chunkSize: number = 2500;

  constructor(catalogSize: number = 50000) {
    this.catalog = this.generateCatalog(catalogSize);
  }

  public getCatalog(): Book[] {
    return this.catalog;
  }

  public getTotalChunks(): number {
    return Math.ceil(this.catalog.length / this.chunkSize);
  }

  private generateCatalog(count: number): Book[] {
    const genres = ['Ciencia Ficción', 'Fantasía', 'Historia', 'Biografía', 'Novela Negra', 'Poesía', 'Tecnología', 'Filosofía'];
    const authors = ['Gabriel García Márquez', 'Isabel Allende', 'J.R.R. Tolkien', 'Isaac Asimov', 'George Orwell', 'Stephen King', 'Agatha Christie'];
    const prefixes = ['El secreto de', 'La sombra de', 'Crónicas de', 'El misterio de', 'Viaje a través de', 'Los ecos de'];
    const nouns = ['el Viento', 'el Olvido', 'las Estrellas', 'el Tiempo', 'el Universo', 'la Noche'];

    const books: Book[] = [];
    for (let i = 1; i <= count; i++) {
      const prefix = prefixes[i % prefixes.length];
      const noun = nouns[(i * 3) % nouns.length];
      const author = authors[(i * 5) % authors.length];
      const genre = genres[(i * 7) % genres.length];

      books.push(
        new Book(
          i,
          `${prefix} ${noun} Vol. ${i}`,
          author,
          genre,
          `978-958-${(1000 + i).toString().padStart(5, '0')}-${i % 10}`,
          1950 + (i % 76),
          `Obra magistral del género ${genre.toLowerCase()} escrita por ${author}.`
        )
      );
    }
    return books;
  }

  public searchSync(term: string): Book[] {
    return this.catalog.filter((book) => book.matches(term));
  }

  public searchMicrotask(
    term: string,
    onProgress: ProgressCallback,
    onComplete: (results: Book[]) => void
  ): void {
    const results: Book[] = [];
    let index = 0;
    let chunksProcessed = 0;
    const total = this.catalog.length;

    const processChunk = () => {
      const limit = Math.min(index + this.chunkSize, total);
      for (let i = index; i < limit; i++) {
        if (this.catalog[i].matches(term)) {
          results.push(this.catalog[i]);
        }
      }
      index = limit;
      chunksProcessed++;
      onProgress(chunksProcessed, this.getTotalChunks());

      if (index < total) {
        queueMicrotask(processChunk);
      } else {
        onComplete(results);
      }
    };

    queueMicrotask(processChunk);
  }

  public searchMacrotask(
    term: string,
    onProgress: ProgressCallback,
    onComplete: (results: Book[]) => void
  ): void {
    const results: Book[] = [];
    let index = 0;
    let chunksProcessed = 0;
    const total = this.catalog.length;

    const processChunk = () => {
      const limit = Math.min(index + this.chunkSize, total);
      for (let i = index; i < limit; i++) {
        if (this.catalog[i].matches(term)) {
          results.push(this.catalog[i]);
        }
      }
      index = limit;
      chunksProcessed++;
      onProgress(chunksProcessed, this.getTotalChunks());

      if (index < total) {
        setTimeout(processChunk, 0);
      } else {
        onComplete(results);
      }
    };

    setTimeout(processChunk, 0);
  }
}
