import React, { useState, useEffect } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Modal, Button, Breadcrumb} from 'react-bootstrap';
import CreateUser from './CreateUser';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';
import EditIcon from "../../../assets/img/icon/editIcon.png";
import BinIcon from "../../../assets/img/icon/binIcon.png";

DataTable.use(DT);

function UserTable() {
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch data from API
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/getAllUsers`)
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching user data:', error));
  }, []);

  // Handle Modal Toggle
  const handleCreateUser = () => setShowCreateModal(true);
  const handleEditUser = (userId) => {
    const user = users.find((user) => user._id === userId);
    setSelectedUser(user); 
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((user) => user._id === userId);
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  window.MyFunction = (id, action) => {
    if (action === 'edit') {
      //console.log(id);
      handleEditUser(id);
    } else if (action === 'delete') {
      //console.log(id)
      handleDeleteUser(id);
    }
  };

  const columns = [
    { title: 'No', data: null, render: (data, type, row, meta) => meta.row + 1 },
    { title: 'First Name', data: 'firstname' },
    { title: 'Last Name', data: 'lastname' },
    { title: 'Email', data: 'email' },
    { title: 'Role', data: 'role_ids', render: (data) => {
      if (data && data.length > 0) {
        return data.map((role) => {
          const textcolor = role.role_name === 'Admin' ? '#004EFB' : role.role_name === 'Student' ? '#857D7D' : '#F68B00';
          return `<span style="color: ${textcolor}; margin-right: 5px; font-weight: bold;">${role.role_name}</span>`;
        }).join(', ');
      }
      return '';
    }
  },
    {
      title: 'Action', data: '_id', render: (data, type, row) => (`
        <div>
          <button onclick="MyFunction('${data}', 'edit')" class="btn btn-warning"> 
          <img src= ${EditIcon} alt="Edit" width="20" /> </button>
          <button onclick="MyFunction('${data}', 'delete')" class="btn btn-danger"> 
          <img src= ${BinIcon} alt="Delete" width="20" /> </button>
        </div>`
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item href={`${import.meta.env.VITE_API_PAGE}/usermanagement`}> User Management </Breadcrumb.Item>
        <Breadcrumb.Item active>User List</Breadcrumb.Item>
      </Breadcrumb>
      <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
        <Button variant="warning" onClick={handleCreateUser}><strong>+ Add User</strong></Button>
      </div>


      <DataTable
        data={users}
        columns={columns}
        className="display"
        options={{
          paging: true,
          searching: true,
          ordering: true,
          info: true,
          buttons: true,
          searchbuilder: true
        }}
      />

      {/* Modal for Create User */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <CreateUser onClose={() => setShowCreateModal(false)} />
      </Modal>

      {/* Modal for Edit User */}
      {selectedUser && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <EditUser userId={selectedUser._id} onClose={() => setShowEditModal(false)} />
        </Modal>
      )}

      {/* Modal for Delete User */}
      {selectedUser && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <DeleteUser userId={selectedUser._id} onClose={() => setShowDeleteModal(false)} />
        </Modal>
      )}
    </div>
  );
}

export default UserTable;
