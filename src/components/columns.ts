interface Column {
  Header: string;
  accessor: string;
  id: string;
}
// accessor is the "key" in the data
export const COLUMNS: Column[] = [
  {
    Header: 'Name',
    accessor: 'name',
     id: 'name'
  },
  {
    Header: 'Email',
    accessor: 'email',
     id: 'email'
  },
  {
    Header: 'Role',
    accessor: 'role',
    id: 'role'
  },
];