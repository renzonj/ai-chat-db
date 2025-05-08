/**
 * RESULTS TABLE COMPONENT
 *
 * This component renders a data table displaying query results from the database.
 * It displays raw column names and values directly without formatting.
 *
 * Features:
 * - Direct display of database column names
 * - Direct display of raw cell values
 * - Responsive layout with horizontal scrolling for many columns
 * - Empty state handling when no data is available
 */
import { Result } from '@/lib/type';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PhilvolcsEarthquake } from '@/db/schemas';

interface ResultsProps {
  results: Result[]; // Array of data objects
  columns: string[]; // Array of column names
}

export const Results = ({ results, columns }: ResultsProps) => {
  return (
    <div className="flex-grow flex flex-col w-full overflow-hidden rounded-xl">
      {/* Scrollable container for the table */}
      <div className="relative overflow-auto max-h-[50vh]">
        <Table className="min-w-full divide-y divide-border table-auto">
          {/* Table header with raw column names */}
          <TableHeader className="bg-secondary sticky top-0 shadow-sm">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* Table body with raw data values */}
          <TableBody className="bg-card divide-y divide-border">
            {results.map((data, index) => (
              <TableRow key={index} className="hover:bg-muted">
                {columns.map((column, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className="px-3 py-2 text-sm text-foreground max-w-[200px] overflow-hidden text-ellipsis"
                  >
                    {String(data[column as keyof PhilvolcsEarthquake])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
