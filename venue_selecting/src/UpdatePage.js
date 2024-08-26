import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Modal,
  Box,
  Typography,
  IconButton,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const EditableTable = () => {
  const [rows, setRows] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);

  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  const handleOpenEditModal = (row) => {
    setEditForm({ name: row.name, email: row.email });
    setEditingRow(row);
  };

  const handleCloseEditModal = () => {
    setEditingRow(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleUpdate = () => {
    setRows(rows.map(row => 
      row.id === editingRow.id ? { ...row, ...editForm } : row
    ));
    handleCloseEditModal();
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditModal(row)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={!!editingRow}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Edit Row
          </Typography>
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} mt={2}>
              <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleCloseEditModal} sx={{ ml: 2 }}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export default EditableTable;
