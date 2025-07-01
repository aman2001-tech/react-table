import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  TableOptions,
  Row,
  TableState,
  HeaderGroup,
  Column,
  Cell,
} from 'react-table';

import { COLUMNS } from './columns';
import './table.css';
import GlobalFilter from './GlobalFilter';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface EditInput {
  name: string;
  email: string;
  role: string;
}

interface ActionCellProps {
  row: Row<User>;
}

export default function Final(): JSX.Element {
  const [tableData, setTableData] = useState<User[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState<EditInput>({
    name: '',
    email: '',
    role: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pageError, setPageError] = useState<string>('');


  const editingRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    axios
      .get<User[]>(
        'https://excelerate-profile-dev.s3.ap-south-1.amazonaws.com/1681980949109_users.json'
      )
      .then((response) =>
        setTableData(
          response.data
        )
      )
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const onEditRow = (row: User) => {
    setEditingRowId(row.id);
    setEditInput({
      name: row.name,
      email: row.email,
      role: row.role,
    });
    setErrorMessage('');
  };

 const handleAutoSave = (id: number) => {
   const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editInput.email);
   const isNameValid = editInput.name.trim() !== '';

   if (!isEmailValid) {
     setErrorMessage('Invalid email');
     return;
   }

   if (!isNameValid) {
     setErrorMessage('Name cannot be empty');
     return;
   }

   const updatedData = tableData.map((row) =>
     row.id === id ? { ...row, ...editInput } : row
   );
   setTableData(updatedData);
   setEditingRowId(null);
   setErrorMessage('');
 };


  const handleDelete = (id: number) => {
    const filtered = tableData.filter((row) => row.id !== id);
    setTableData(filtered);
  };

  const columns: Column<User>[] = useMemo(() => [
    ...COLUMNS,
    {
      id: 'actions',
      Header: 'Actions',
      Cell: ({ row }: ActionCellProps) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <FaEdit
            style={{ cursor: 'pointer' }}
            onClick={() => onEditRow(row.original)}
            title="Edit"
          />
          <FaTrash
            style={{ cursor: 'pointer' }}
            onClick={() => handleDelete(row.original.id)}
            title="Delete"
          />
        </div>
      ),
    },
  ], [tableData]);

  const data = useMemo(() => tableData, [tableData]);

  const tableInstance = useTable<User>(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      autoResetPage: false,
    } as TableOptions<User>,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'selection',
          Header: ({ page }: { page: Row<User>[] }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  page.forEach((row) => row.toggleRowSelected(isChecked));
                }}
                checked={page.every((row) => row.isSelected)}
                ref={(input) => {
                  if (input) input.indeterminate = false;
                }}
              />
              <label style={{ fontSize: '14px', color: '#eee' }}>Select All</label>
            </div>
          ),
          Cell: ({ row }: { row: Row<User> }) => (
            <div>
              <input type="checkbox" {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    prepareRow,
    selectedFlatRows,
    state,
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state as TableState<User>;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editInput.email);
  const isNameValid = editInput.name.trim() !== '';


  return (
      <>
      <div className="table-wrapper">
    <div className="global_filter">
      <GlobalFilter
        filter={globalFilter}
        setFilter={(value) => {
          setGlobalFilter(value);
          gotoPage(0); //  Go to first page on search
        }}
      />
      </div>




      {/* take all props to make correct table from react-table hook */}
      <div className="table-container">
      <table {...getTableProps()}>
        <thead>
        {/* every headerGroup represent a row of headers

*/}
          {headerGroups.map((headerGroup: HeaderGroup<User>) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {/* make tr for every row of headers and take attributes accordingly by getheadergropsprops()
                <tr key="header_0">...</tr>*/}
             {/*make th for every column*/}
              {headerGroup.headers.map((column: any) => (
                <th
                //{/*column.id is a unique identifier for each column.
//                     headerGroups (1 group)
//                     |
//                     |-- headers (3 items)
//                         |-- column 1: { Header: "Name" }  ->  <th>Name</th>
//                         |-- column 2: { Header: "Email" } ->  <th>Email</th>
//                         |-- column 3: { Header: "Role" }  ->  <th>Role</th>
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={column.id}

                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row: Row<User>) => {
            prepareRow(row);
            const isEditing = editingRowId === row.original.id;
            return (
              <tr
                {...row.getRowProps()}
                key={row.id}
                ref={isEditing ? editingRef : null}
                onBlur={(e) => {
                  if (editingRowId === row.original.id) {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!editingRef.current?.contains(relatedTarget)) {
                      handleAutoSave(row.original.id);
                    }
                  }
                }}
              >
                {row.cells.map((cell: Cell<User>) => {
                  if (
                    isEditing &&
                    ['name', 'email', 'role'].includes(cell.column.id)
                  ) {
                    return (
                      <td {...cell.getCellProps()} key={cell.column.id}>
                        {cell.column.id === 'role' ? (
                          <select
                            value={editInput.role}
                            onChange={(e) =>
                              setEditInput({ ...editInput, role: e.target.value })
                            }
                          >
                            <option value="admin">admin</option>
                            <option value="member">member</option>
                          </select>
                        ) : cell.column.id === 'email' ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <input
                              type="text"
                              value={editInput.email || ''}
                              onChange={(e) =>
                                setEditInput({
                                  ...editInput,
                                  email: e.target.value,
                                })
                              }
                              style={{
                                border: !isEmailValid ? '2px solid red' : '1px solid #ccc',
                                backgroundColor: '#454444',
                                padding: '4px',
                                outline: 'none',
                              }}
                            />
                            {!isEmailValid && (
                              <span style={{ color: 'red', fontSize: '12px' }}>
                                Invalid email
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <input
                              type="text"
                              value={(editInput as any)[cell.column.id] || ''}
                              onChange={(e) =>
                                setEditInput({
                                  ...editInput,
                                  [cell.column.id]: e.target.value,
                                })
                              }
                              style={{
                                border: !isNameValid && cell.column.id === 'name' ? '2px solid red' : '1px solid #ccc',
                               outline: 'none',
                               padding: '4px',
                              }}
                            />
                            {!isNameValid && cell.column.id === 'name' && (
                              <span style={{ color: 'red', fontSize: '12px' }}>
                                Name cannot be empty
                              </span>
                            )}
                          </div>

                        )}
                      </td>
                    );
                  }
                  return (
                    <td {...cell.getCellProps()} key={cell.column.id}>
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
     <div className="delete-button-container">
           <button
                       className="delete-button"
                       onClick={() => {
                         const selectedIds = new Set(selectedFlatRows.map((row) => row.original.id));
                         const filtered = tableData.filter((row) => !selectedIds.has(row.id));
                         setTableData(filtered);
                       }}
                       disabled={selectedFlatRows.length === 0}
                       type="button"
                     >
                       Delete Selected
                     </button>
    </div>

      </div>




      <div className="pagination">

        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          {[10, 15, 20, 30].map((pageSizeOption) => (
            <option key={pageSizeOption} value={pageSizeOption}>
              Show {pageSizeOption}
            </option>
          ))}
        </select>

        <span>
          Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
        </span>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} type="button">
          {'<<'}
        </button>

        <button onClick={() => previousPage()} disabled={!canPreviousPage} type="button">
          Prev
        </button>
        <button onClick={() => nextPage()} disabled={!canNextPage} type="button">
          Next
        </button>

        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} type="button">
          {'>>'}
        </button>
       <span>
         | Go to page:{' '}
         <input
           type="number"
//            defaultValue={pageIndex + 1}
           onChange={(e) => {
             const value = e.target.value;
             const page = value ? Number(value) - 1 : 0;

             if (page < 0) {
               setPageError('Page number cannot be negative');
             } else if (page >= pageCount) {
               setPageError('Invalid page number');
             } else {
               setPageError('');
               gotoPage(page);
             }
           }}
           style={{ width: '50px' }}
         />
       </span>

        {pageError && (
                       <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                         {pageError}
                       </div>
                     )}

      </div>



    </>
  );
}

