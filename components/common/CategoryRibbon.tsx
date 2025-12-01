'use client';

interface CategoryRibbonProps {
  categoryName: string;
  categoryColor: string;
  size?: 'small' | 'full';
}

export function CategoryRibbon({
  categoryName,
  categoryColor,
  size = 'full',
}: CategoryRibbonProps) {
  const isFull = size === 'full';

  return (
    <div
      style={{
        position: 'absolute',
        top: isFull ? '12px' : '8px',
        left: isFull ? '-30px' : '-20px',
        transform: 'rotate(-45deg)',
        width: isFull ? '120px' : '80px',
        padding: isFull ? '4px 0' : '3px 0',
        textAlign: 'center',
        fontSize: isFull ? '11px' : '9px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        color: 'white',
        backgroundColor: categoryColor,
        zIndex: 10,
      }}
    >
      {categoryName}
    </div>
  );
}
