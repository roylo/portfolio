'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarouselCardData {
  id: string;
  title: string;
  description: string;
  details?: string;
  link?: string;
  linkText?: string;
  metadata?: {
    company?: string;
    role?: string;
    impact?: string;
    competencies?: string[];
  };
}

interface CarouselCardsProps {
  title: string;
  cards: CarouselCardData[];
  className?: string;
}

export function CarouselCards({ title, cards, className }: CarouselCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!cards || cards.length === 0) return null;

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-muted-foreground">📚 {title}</span>
        <div className="text-xs text-muted-foreground">
          {currentIndex + 1} of {cards.length}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Main Card */}
        <Card className="mb-3 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
                {cards[currentIndex].title}
              </CardTitle>
              {cards[currentIndex].link && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => window.open(cards[currentIndex].link, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Metadata */}
            {cards[currentIndex].metadata && (
              <div className="flex flex-wrap gap-1 mt-1">
                {cards[currentIndex].metadata?.company && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                    {cards[currentIndex].metadata.company}
                  </span>
                )}
                {cards[currentIndex].metadata?.impact && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                    {cards[currentIndex].metadata.impact}
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {cards[currentIndex].description}
            </p>
            
            {cards[currentIndex].details && (
              <p className="text-xs text-foreground mt-2 leading-relaxed">
                {cards[currentIndex].details}
              </p>
            )}

            {/* Competencies */}
            {cards[currentIndex].metadata?.competencies && (
              <div className="flex flex-wrap gap-1 mt-2">
                {cards[currentIndex].metadata.competencies.slice(0, 3).map((comp, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        {cards.length > 1 && (
          <>
            {/* Previous/Next Buttons */}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevCard}
                disabled={cards.length === 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                <span className="text-xs">Prev</span>
              </Button>
              
              <Button
                variant="outline" 
                size="sm"
                onClick={nextCard}
                disabled={cards.length === 1}
                className="h-7 px-2"
              >
                <span className="text-xs">Next</span>
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCard(index)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    index === currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}