import './Table.css';

export const Table = ({ children, striped = true, hover = true, className = '', ...props }) => {
  const classes = [
    'table-wrapper',
    striped && 'table-striped',
    hover && 'table-hover',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes}>
      <table className="table" {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className = '', ...props }) => (
  <thead className={`table-head ${className}`.trim()} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`table-body ${className}`.trim()} {...props}>
    {children}
  </tbody>
);

export const TableFoot = ({ children, className = '', ...props }) => (
  <tfoot className={`table-foot ${className}`.trim()} {...props}>
    {children}
  </tfoot>
);

export const TableRow = ({ children, className = '', ...props }) => (
  <tr className={`table-row ${className}`.trim()} {...props}>
    {children}
  </tr>
);

export const TableHeader = ({
  children,
  sortable = false,
  onSort,
  sortDir,
  className = '',
  ...props
}) => {
  const classes = [
    'table-header',
    sortable && 'table-header--sortable',
    sortDir && `table-header--sort-${sortDir}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <th
      className={classes}
      onClick={() => sortable && onSort?.()}
      role={sortable ? 'button' : 'columnheader'}
      tabIndex={sortable ? 0 : undefined}
      {...props}
    >
      {children}
      {sortable && (
        <span className="sort-indicator">
          {sortDir === 'asc' ? ' ↑' : sortDir === 'desc' ? ' ↓' : ' ↕'}
        </span>
      )}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`table-cell ${className}`.trim()} {...props}>
    {children}
  </td>
);

export const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  ...props
}) => (
  <div className={`pagination ${className}`.trim()} {...props}>
    <button
      className="btn btn--sm btn--secondary"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      ← Previous
    </button>
    <span className="pagination-info">
      Page {currentPage} of {totalPages}
    </span>
    <button
      className="btn btn--sm btn--secondary"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Next →
    </button>
  </div>
);

export default Table;
