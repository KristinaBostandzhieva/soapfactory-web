export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid-skeleton" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="product-skeleton-card" key={index}>
          <div className="product-skeleton-image" />
          <div className="product-skeleton-line short" />
          <div className="product-skeleton-line" />
          <div className="product-skeleton-price" />
        </div>
      ))}
    </div>
  );
}
