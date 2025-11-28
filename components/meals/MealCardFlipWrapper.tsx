'use client';

import { useState, useEffect } from 'react';
import { MealCard } from './MealCard';
import { MealCardBack } from './MealCardBack';

interface Meal {
  id: number;
  title: string;
  imageUrl: string | null;
  rating: number;
  recipeText: string | null;
  category?: {
    name: string;
    color: string | null;
  } | null;
}

interface MealCardFlipWrapperProps {
  meal: Meal;
  onEdit?: (meal: Meal) => void;
  onDelete?: (mealId: number) => void;
}

export function MealCardFlipWrapper({
  meal,
  onEdit,
  onDelete,
}: MealCardFlipWrapperProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Listen for ESC key to close card back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFlipped) {
        setIsFlipped(false);
      }
    };

    if (isFlipped) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFlipped]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleClose = () => {
    setIsFlipped(false);
  };

  const handleEdit = () => {
    setIsFlipped(false);
    onEdit?.(meal);
  };

  const handleDelete = () => {
    setIsFlipped(false);
    onDelete?.(meal.id);
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        style={{
          position: 'relative',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            display: isFlipped ? 'none' : 'block',
          }}
        >
          <MealCard
            id={meal.id}
            title={meal.title}
            imageUrl={meal.imageUrl}
            rating={meal.rating}
            categoryName={meal.category?.name}
            categoryColor={meal.category?.color || undefined}
            onClick={handleFlip}
          />
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: isFlipped ? 'block' : 'none',
          }}
        >
          <MealCardBack
            title={meal.title}
            recipeText={meal.recipeText}
            onClose={handleClose}
            onEdit={onEdit ? handleEdit : undefined}
            onDelete={onDelete ? handleDelete : undefined}
          />
        </div>
      </div>
    </div>
  );
}
