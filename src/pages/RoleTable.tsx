import { useState, useEffect, useCallback } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Modal, Button, Breadcrumb } from 'react-bootstrap';
import MainDashboard from '../layouts/MainDashboard';
import CreateRole from '../components/Admin/roleManagement/CreateRole';
import EditRole from '../components/Admin/roleManagement/EditRole';
import DeleteRole from '../components/Admin/roleManagement/DeleteRole';
import EditIcon from '../assets/img/icon/editIcon.png';
import BinIcon from '../assets/img/icon/binIcon.png';
import { IFToggleSidebar } from '../app';

import "../assets/css/dataTable.min.css";
import "../assets/css/adminConfig/setting.css"

type Role = {
  _id: string;
  role_name: string;
};

type ConfigDataTable = {
    paging?: boolean;
    searching?: boolean;
    ordering?: boolean;
    info?: boolean;
    buttons?: boolean;
    searchBuilder?: boolean;
  }

export default function RoleTable({ toggleSidebar, setToggleSidebar }:IFToggleSidebar) {
  DataTable.use(DT);

  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Fetch data from API
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/getAllRoles`)
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error('Error fetching role data:', error));
  }, []);

  // Handle Modal Toggle
  const handleCreateRole = () => setShowCreateModal(true);
  const handleEditRole = useCallback((roleId: string) => {
      const role = roles.find((role) => role._id === roleId);
      setSelectedRole(role || null);
      setShowEditModal(true);
    }, [roles]);

  const handleDeleteRole = useCallback((roleId: string) => {
      const role = roles.find((role) => role._id === roleId);
      setSelectedRole(role || null);
      setShowDeleteModal(true);
    }, [roles]);

  const handleButtonClick = useCallback((event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest("button");
      if (!button) return;
    
      const id = button.getAttribute("data-id");
      const action = button.classList.contains("btn-edit")
        ? "edit"
        : button.classList.contains("btn-delete")
        ? "delete"
        : null;
    
      if (id && action) {
        if (action === "edit") {
          handleEditRole(id);
        } else if (action === "delete") {
          handleDeleteRole(id);
        }
      }
    }, [handleEditRole, handleDeleteRole]); 
  
    useEffect(() => {
      document.addEventListener("click", handleButtonClick);
      return () => {
        document.removeEventListener("click", handleButtonClick);
      };
    }, [handleButtonClick]);

  const columns = [
    { title: 'Role Name', 
      data: 'role_name',
      render: (data: string) => {
        let textColor, bgColor;

        switch (data) {
          case 'Admin':
            textColor = '#004EFB';
            bgColor = '#d5e0ff'; 
            break;
          case 'Student':
            textColor = '#8d44ad';
            bgColor = '#ece0f4'; 
            break;
          case 'Tutor':
            textColor = '#F68B00';
            bgColor = '#ffecd5'; 
            break;
          default:
            textColor = '#857D7D';
            bgColor = '#ebebeb'; 
        }

        return `
          <span style="
            color: ${textColor}; 
            background-color: ${bgColor}; 
            font-weight: bold; 
            padding: 5px 10px; 
            border-radius: 4px; 
            display: inline-block;">
            ${data}
          </span>`;
      },
    },
    {
      title: 'Actions',
      data: '_id',
      render: (data: string) =>
        `<div>
            <button class="btn-edit btn btn-warning" data-id="${data}"> 
                <img src="${EditIcon}" alt="Edit" width="20" />
            </button>
            <button class="btn-delete btn btn-danger" data-id="${data}"> 
                <img src="${BinIcon}" alt="Delete" width="20" />
            </button>
        </div>`,
    },
  ];

  return (
    <MainDashboard title="Role Management"
      toggleSidebar={toggleSidebar}
      setToggleSidebar={setToggleSidebar}
      title_sidebar="จัดการบทบาท"
      >
      <div className='role-form-container'>
        <Breadcrumb>
          <Breadcrumb.Item href={`/dashboard/role-management`}>
            Role Management
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Role List</Breadcrumb.Item>
        </Breadcrumb>
        <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
          <Button variant="warning" onClick={handleCreateRole}>
            <strong>+ Add Role</strong>
          </Button>
        </div>

        <DataTable
            data={roles}
            columns={columns} 
            className="display"
            options={{
              paging: true,
              searching: true,
              ordering: true,
              info: true,
              buttons: true,
              searchBuilder: true,
            } as ConfigDataTable}
          />
          
        {/* Modal for Create Role */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <CreateRole onClose={() => setShowCreateModal(false)} />
        </Modal>

        {/* Modal for Edit Role */}
        {selectedRole && (
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <EditRole roleId={selectedRole._id} onClose={() => setShowEditModal(false)} />
          </Modal>
        )}

        {/* Modal for Delete Role */}
        {selectedRole && (
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <DeleteRole roleId={selectedRole._id} onClose={() => setShowDeleteModal(false)} />
          </Modal>
        )}
      </div>
    </MainDashboard>
  );
}
