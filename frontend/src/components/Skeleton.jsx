/**
 * Base Skeleton component — animated grey pulse placeholder.
 * Props: width, height, borderRadius, className, style
 */
const Skeleton = ({
  width = '100%',
  height = '16px',
  borderRadius = '4px',
  className = '',
  style = {},
}) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{
      width,
      height,
      borderRadius,
      background: '#E0E0E0',
      ...style,
    }}
  />
);

export default Skeleton;
