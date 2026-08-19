export interface IBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  publishedYear: number;
  synopsis: string;
}

export class Book implements IBook {
  constructor(
    public id: number,
    public title: string,
    public author: string,
    public genre: string,
    public isbn: string,
    public publishedYear: number,
    public synopsis: string
  ) {}

  public matches(term: string): boolean {
    const lowerTerm = term.toLowerCase();
    return (
      this.title.toLowerCase().includes(lowerTerm) ||
      this.author.toLowerCase().includes(lowerTerm) ||
      this.genre.toLowerCase().includes(lowerTerm) ||
      this.isbn.includes(lowerTerm)
    );
  }
}