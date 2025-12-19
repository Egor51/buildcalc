import { Star } from "lucide-react";

type Props = {
  rating: number;
  label?: string;
};

export const RatingStars = ({ rating, label }: Props) => {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? "fill-amber-400" : "text-muted-foreground"}`}
        />
      ))}
      {label ? <span className="ml-2 text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
};


