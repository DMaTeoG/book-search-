import React from 'react';
import { Book } from '../moduls/Book';
import { User, Calendar, Hash } from 'lucide-react';

interface Props {
  book: Book;
}

export const BookCard: React.FC<Props> = ({ book }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-800/50">
            {book.genre}
          </span>
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {book.publishedYear}
          </span>
        </div>
        <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{book.title}</h4>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
          <User className="w-3 h-3 text-slate-500" /> {book.author}
        </p>
      </div>
      <div className="border-t border-slate-900 pt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-mono flex items-center gap-1">
          <Hash className="w-3 h-3" /> {book.isbn}
        </span>
        <span className="text-slate-600">ID #{book.id}</span>
      </div>
    </div>
  );
};