"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/types";

export type { NewsArticle };

interface ArticleReviewProps {
  articles: NewsArticle[];
  selectedIndexes: number[];
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ArticleReview = ({
  articles,
  selectedIndexes,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: ArticleReviewProps) => {
  const allSelected = selectedIndexes.length === articles.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-14 text-white-4">
          {selectedIndexes.length} of {articles.length} articles selected
        </p>
        <Button
          type="button"
          variant="plain"
          className="text-14 text-orange-1 font-bold uppercase tracking-wide hover:underline"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {articles.map((article, index) => {
          const isSelected = selectedIndexes.includes(index);

          return (
            <button
              key={index}
              type="button"
              onClick={() => onToggle(index)}
              className={`w-full text-left p-5 border-4 transition-all ${
                isSelected
                  ? "border-orange-1 bg-orange-1/5"
                  : "border-[var(--color-mid-gray)] bg-[var(--color-dark-gray)] hover:border-[var(--color-light-gray)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 w-5 h-5 flex-shrink-0 border-4 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-orange-1 bg-orange-1"
                      : "border-[var(--color-mid-gray)]"
                  }`}
                >
                  {isSelected && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="var(--color-charcoal)"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-16 font-bold text-white-1 mb-1">
                    {article.title}
                  </h3>
                  <p className="text-14 text-white-4 mb-2 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-2 text-12 text-white-4">
                    <span className="font-bold uppercase tracking-wide text-orange-1">
                      {article.source}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 hover:text-orange-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Source
                    </a>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleReview;
