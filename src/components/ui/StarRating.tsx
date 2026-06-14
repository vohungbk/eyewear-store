interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: false;
}

interface InteractiveStarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive: true;
  onRate: (rating: number) => void;
}

type Props = StarRatingProps | InteractiveStarRatingProps;

export default function StarRating(props: Props) {
  const { rating, max = 5, size = "md" } = props;

  const sizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const iconSize = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type={props.interactive ? "button" : undefined}
            onClick={
              props.interactive
                ? () => (props as InteractiveStarRatingProps).onRate(i + 1)
                : undefined
            }
            className={props.interactive ? "hover:scale-110 transition-transform" : ""}
            disabled={!props.interactive}
            aria-label={props.interactive ? `Rate ${i + 1} star${i !== 0 ? "s" : ""}` : undefined}
          >
            <svg
              className={`${iconSize} ${filled ? "text-amber-400" : "text-neutral-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
