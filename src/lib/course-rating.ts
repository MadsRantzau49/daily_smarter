export function courseRating(ratings: { score: number }[]) {
  if (!ratings.length) return 0;
  return (
    ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length
  );
}
