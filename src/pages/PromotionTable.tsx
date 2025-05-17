import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Breadcrumb } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import MainDashboard from '../layouts/MainDashboard';
import CreatePromotion from '../components/Admin/promotionManagement/CreatePromotion';
import EditPromotion from '../components/Admin/promotionManagement/EditPromotion';
import DeletePromotion from '../components/Admin/promotionManagement/DeletePromotion';
import EditIcon from '../assets/img/icon/editIcon.png';
import BinIcon from '../assets/img/icon/binIcon.png';
import { IFToggleSidebar } from '../app';

import "../assets/css/dataTable.min.css";
import "../assets/css/adminConfig/setting.css"

type Promotion = {
  _id: string;
  name: string;
  courses:{ title: string }[]
  code: string;
  type: string;
  discount: number;
  start_date: string;
  end_date: string;
};

type ConfigDataTable = {
    paging?: boolean;
    searching?: boolean;
    ordering?: boolean;
    info?: boolean;
    buttons?: boolean;
    searchBuilder?: boolean;
  }

export default function PromotionTable({ toggleSidebar, setToggleSidebar }:IFToggleSidebar) {
    DataTable.use(DT);
    
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    
    // Fetch data from API
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/getAllPromotions`)
        .then((response) => response.json())
        .then((data) => setPromotions(data))
        .catch((error) => console.error('Error fetching promotion data:', error));
    }, []);

    // Handle Modal Toggle
    const handleCreatePromotion = () => setShowCreateModal(true);
    const handleEditPromotion = useCallback((promotionId: string) => {
        const promotion = promotions.find((promotion) => promotion._id === promotionId);
        setSelectedPromotion(promotion || null);
        setShowEditModal(true);
      }, [promotions]);

    const handleDeletePromotion = useCallback((promotionId: string) => {
        const promotion = promotions.find((promotion) => promotion._id === promotionId);
        setSelectedPromotion(promotion || null);
        setShowDeleteModal(true);
      }, [promotions]);

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
            handleEditPromotion(id);
          } else if (action === "delete") {
            handleDeletePromotion(id);
          }
        }
      }, [handleEditPromotion, handleDeletePromotion]); 
    
      useEffect(() => {
        document.addEventListener("click", handleButtonClick);
        return () => {
          document.removeEventListener("click", handleButtonClick);
        };
      }, [handleButtonClick]);

    const columns = [
        { title: 'No', data: null, render: (_: unknown, __: unknown, ___: unknown, meta: { row: number }) => meta.row + 1 },
        { title: 'Promotion Name', data: 'name' },
        // { title: 'Courses', 
        //    data: 'courses',
        //    render: (data: { title: string }[]) => {
        //     if (data && data.length > 0) {
        //     return data
        //         .map(course => 
        //             `<span class="badge bg-primary me-1">${course.title}</span>`
        //         )
        //         .join('<br>');
        //       }
        //       return ''; 
        //     },
        // },            
        { title: 'Promotion Code', data: 'code' },
        { title: 'Promotion Type', data: 'type' },
        { title: 'Discount', data: 'discount' },
        { title: 'Start Date', data: 'start_date', render: (data: string) => {
            const date = new Date(data);
            return date.toLocaleDateString('en-GB');
        } },
        { title: 'End Date', data: 'end_date', render: (data: string) => {
            const date = new Date(data);
            return date.toLocaleDateString('en-GB'); 
        } },        
        { title: 'Action',
          data: '_id',
          render: (data: string) =>
          `<div>
            <button class="btn-edit btn btn-warning" data-id="${data}"> 
                <img src="${EditIcon}" alt="Edit" width="19" />
            </button>
            <button class="btn-delete btn btn-danger" data-id="${data}"> 
                <img src="${BinIcon}" alt="Delete" width="19" />
            </button>
          <div>`, 
        },
    ];

    return (
        <MainDashboard title="Promotion Management"
          toggleSidebar={toggleSidebar}
          setToggleSidebar={setToggleSidebar}
          title_sidebar="จัดการโปรโมชั่น"
          >
            <div className='promotion-from-container'>
                <Breadcrumb>
                    <Breadcrumb.Item href={`/dashboard/promotion-management`}>
                        Promotion Management
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>Promotion List</Breadcrumb.Item>
                </Breadcrumb>
                <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
                    <Button variant="warning" onClick={handleCreatePromotion}>
                        <strong>+ Add Promotion</strong>
                    </Button>
                </div>

                <DataTable
                    data={promotions}
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

                {/* Modal for Create Promotion */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                    <CreatePromotion onClose={() => setShowCreateModal(false)} />
                </Modal>

                {/* Modal for Edit Promotion */}
                {selectedPromotion && (
                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <EditPromotion promotionId={selectedPromotion._id} onClose={() => setShowEditModal(false)} />
                    </Modal>
                )}

                {/* Modal for Delete Promotion */}
                {selectedPromotion && (
                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                        <DeletePromotion promotionId={selectedPromotion._id} onClose={() => setShowDeleteModal(false)} />
                    </Modal>
                )}
            </div>
        </MainDashboard>
    )
};

