import React from 'react';

interface GlobalFilterProps {
  Filter: string;
  setFilter: (filterValue: string) => void;
}

export default function GlobalFilter({
  Filter,
  setFilter,
}: GlobalFilterProps): JSX.Element {


  return (
    <span >
      Search:{' '}
      <input
        type="text"
        placeholder="Type to search..."
        value={Filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          fontSize: '1.1rem',
          border: '0px',
          borderBottom: '1px solid #ccc',
          outline: 'none',
          padding: '0.5rem',
          marginBottom: '1rem',
          width: '94%',

        }}
      />
    </span>
  );
}