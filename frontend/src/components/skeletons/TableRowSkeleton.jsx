/**
 * Skeleton placeholder for an admin table row.
 * Props:
 *   cols — number of columns (default 5)
 *   widths — optional array of pixel widths per column
 */
const TableRowSkeleton = ({ cols = 5, widths }) => {
  const defaultWidths = [40, 160, 110, 80, 70];
  const colWidths = widths || defaultWidths.slice(0, cols);

  return (
    <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '0.75rem 1rem' }}>
          <div
            className='shimmer'
            style={{ height: 14, width: colWidths[i] || 80, borderRadius: 4 }}
          />
        </td>
      ))}
    </tr>
  );
};

export default TableRowSkeleton;
