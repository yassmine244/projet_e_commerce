import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value = 0, text }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));

  const stars = Array.from({ length: 5 }, (_, i) => {
    const position = i + 1;
    if (v >= position) return <FaStar key={i} />;
    if (v >= position - 0.5) return <FaStarHalfAlt key={i} />;
    return <FaRegStar key={i} />;
  });

  return (
    <span
      className="rating"
      aria-label={`Rating: ${v.toFixed(1)} out of 5`}
    >
      <span className="rating__stars">{stars}</span>
      {text !== undefined && <span className="rating__text">{text}</span>}
    </span>
  );
};

export default Rating;
