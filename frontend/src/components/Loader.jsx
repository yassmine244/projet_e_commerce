const Loader = ({ size = 48 }) => {
  return (
    <div
      className="loader"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
    />
  );
};

export default Loader;
