// Wrapper for Table component - maps React-Bootstrap Table to MUI Table
import React from "react";
import MuiTable from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";

/**
 * Table wrapper component
 * Maps React-Bootstrap Table to MUI Table with TableContainer
 *
 * Props mapping:
 *   striped -> sx styling
 *   bordered -> sx styling
 *   hover -> sx styling
 *   responsive -> use TableContainer with Paper
 *
 * Usage:
 *   <Table striped bordered hover responsive>
 *     <thead>
 *       <tr>
 *         <th>Header</th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr>
 *         <td>Data</td>
 *       </tr>
 *     </tbody>
 *   </Table>
 */
export default function Table({
  striped,
  bordered,
  hover,
  responsive,
  size,
  children,
  ...props
}) {
  const sxStyles = {
    ...(striped && {
      "& tbody tr:nth-of-type(odd)": {
        backgroundColor: "action.hover",
      },
    }),
    ...(bordered && {
      border: "1px solid",
      borderColor: "divider",
      "& th, & td": {
        border: "1px solid",
        borderColor: "divider",
      },
    }),
    ...(hover && {
      "& tbody tr:hover": {
        backgroundColor: "action.hover",
      },
    }),
  };

  const tableContent = (
    <MuiTable
      size={size === "sm" ? "small" : "medium"}
      sx={sxStyles}
      {...props}
    >
      {children}
    </MuiTable>
  );

  if (responsive) {
    return (
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        {tableContent}
      </TableContainer>
    );
  }

  return tableContent;
}

// Export MUI table components for direct use with lowercase HTML-like tags
export {
  TableHead as thead,
  TableBody as tbody,
  TableRow as tr,
  TableCell as td,
  TableCell as th,
};
