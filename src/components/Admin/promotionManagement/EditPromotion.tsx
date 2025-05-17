import { useState, useEffect, FormEvent } from 'react';
import { Modal, Button, Form, Row, Col, Stack } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';

// Define the course type
interface Course {
    value: string;
    label: string;
  }

// Define the course data type
interface CourseData {
    _id: string;
    title: string;
  }

// Define the form data type
interface FormData {
    name: string;
    for_course: string;
    code: string;
    courses: string[];
    status: boolean;
    type: string;
    discount: number;
    min_purchase_amount: number;
    max_discount: number;
    condition_type: string;
    quantity_per_day: number;
    quantity: number;
    remark: string;
    start_date: string;
    end_date: string;
    times: { start_time: string; end_time: string }[];
  }

type EditPromotionProps = {
    promotionId: string;
    onClose: () => void;
  };

export default function EditPromotion({ promotionId, onClose }: EditPromotionProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    for_course: '',
    code: '',
    courses: [],
    status: false,
    type: '',
    discount: 0,
    min_purchase_amount: 0,
    max_discount: 0,
    condition_type: '',
    quantity_per_day: 0,
    quantity: 0,
    remark: '',
    start_date: '',
    end_date: '',
    times: [{ start_time: '', end_time: '' }],
  });


    const [courses, setCourses] = useState<Course[]>([]);
    const [errorMessage] = useState<string>('');
    const requiredFields = ['name',
        'for_course',
        'code',
        'type',
        'discount',
        'min_purchase_amount',
        'max_discount',
        'condition_type',
        'quantity',
        'start_date',
        'end_date',] as const;

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/getPromotion/${promotionId}`)
            .then((response) => response.json())
            .then((data) => {
                setFormData({
                    name: data.name,
                    for_course: data.for_course,
                    code: data.code,
                    courses: data.courses ? data.courses.map((course: { _id: string }) => course._id) : [],
                    status: data.status,
                    type: data.type,
                    discount: data.discount,
                    min_purchase_amount: data.min_purchase_amount,
                    max_discount: data.max_discount,
                    condition_type: data.condition_type,
                    quantity_per_day: data.quantity_per_day,
                    quantity: data.quantity,
                    remark: data.remark,
                    start_date: data.start_date ? data.start_date.split('T')[0] : '',
                    end_date: data.end_date ? data.end_date.split('T')[0] : '',
                    times: data.times ? data.times.map((time: { start_time: string; end_time: string }) => ({
                      start_time: time.start_time ? new Date(time.start_time).toISOString().substring(11, 16) : '',
                      end_time: time.end_time ? new Date(time.end_time).toISOString().substring(11, 16) : '',
                    })) : [{ start_time: '', end_time: '' }],
                });
            })
            .catch((error) => console.error('Error fetching promotion data:', error));

    fetch(`${import.meta.env.VITE_API_URL}/getAllCourses`)
        .then((response) => response.json())
        .then((data : CourseData[]) => {
            setCourses(
                data.map((course) => ({
                    value: course._id,
                    label: course.title,
                }))
            );
        })
        .catch((error) => {
            console.error('Error fetching courses:', error);
        });
    }, [promotionId]);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
  
      setFormData((prevState) => {
          const updatedTimes = [...prevState.times];
  
            if (name === "start_time") {
                updatedTimes[0] = { ...updatedTimes[0], start_time: value || "" };
            } else if (name === "end_time") {
                updatedTimes[0] = { ...updatedTimes[0], end_time: value || "" }; 
            }
  
            return {
                ...prevState,
                times: updatedTimes,
            };
        });
    };

    const handleChange = (
      input: | { name: string; value: string | boolean } | ReadonlyArray<{ value: string }>,
      action?: { name: string }
      ) => {
        if (!input) return;
        
        if (action?.name === "courses" && Array.isArray(input)) {
          setFormData((prevState) => ({
            ...prevState,
            courses: input.map((option) => option.value),
          }));
        } else if (!Array.isArray(input) && "name" in input) {
          setFormData((prevState) => {
            const updatedData = { ...prevState, [input.name]: input.value };
            if (input.name === "for_course" && input.value === "all") {
              return { ...updatedData, courses: [] }; 
            }
            return updatedData;
          });
        }
      };  
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (emptyFields.length > 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Incomplete Form",
                    text: "Please fill in all required fields.",
                    confirmButtonText: "OK",
                });
                return;
            }
        
        if (formData.discount > 2000) {
          Swal.fire({
              icon: "warning",
              title: "Invalid Discount",
              text: "Discount cannot exceed 2000.",
              confirmButtonText: "OK",
          });
          return;
        }
        
        if (formData.code.length > 15) {
          Swal.fire({
              icon: "warning",
              title: "Invalid Code",
              text: "Code cannot be longer than 15.",
              confirmButtonText: "OK",
          });
          return;
        }
          
        if (formData.name.length > 100) {
          Swal.fire({
              icon: "warning",
              title: "Invalid Name",
              text: "Name cannot be longer than 100.",
              confirmButtonText: "OK",
          });
          return;
        }

        if (formData.discount <= 0) {
              Swal.fire({
                icon: 'warning',
                title: 'Invalid Discount',
                text: 'Discount must be greater than 0.',
                confirmButtonText: 'OK',
            });
            return;
        }       
        
        if (formData.min_purchase_amount <= 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid Minimum Purchase Amount',
              text: 'Minimum purchase amount must be greater than 0.',
              confirmButtonText: 'OK',
          });
          return;
        }
        
        if (formData.max_discount <= 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid Max Discount',
              text: 'Max discount must be greater than 0.',
              confirmButtonText: 'OK',
          });
          return;
        }

        if (formData.quantity <= 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid Quantity',
              text: 'Quantity must be greater than 0.',
              confirmButtonText: 'OK',
          });
          return;
        }
        
        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
        
            if (startDate > endDate) {
                Swal.fire({
                    icon: "error",
                    title: "Invalid Date Range",
                     text: "Start date cannot be later than end date.",
                    confirmButtonText: "OK",
                });
            return;
            }
        }

        if (formData.for_course === "specific" && formData.courses.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Applicable Courses Required",
                    text: "Please select at least one course when 'For Course' is set to 'Specific'.",
                    confirmButtonText: "OK",
                });
              return;
            }

        if (formData.for_course === "all") {
          formData.courses = [];  
          }
          
        const dataToSubmit = {
            name: formData.name,
            for_course: formData.for_course,
            code: formData.code,
            courses: formData.courses,
            status: formData.status,
            type: formData.type,
            discount: Number(formData.discount),
            min_purchase_amount: Number(formData.min_purchase_amount),
            max_discount: Number(formData.max_discount),
            condition_type: formData.condition_type,
            quantity_per_day: Number(formData.quantity_per_day),
            quantity: Number(formData.quantity),
            remark: formData.remark,
            start_date: formData.start_date,
            end_date: formData.end_date,
            times: formData.times.map((t) => ({
              start_time: t.start_time, 
              end_time: t.end_time
            })),
        };

        fetch(`${import.meta.env.VITE_API_URL}/updatePromotion/${promotionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSubmit),
        })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            if (data.message === 'Promotion name is already in use') {
              Swal.fire({
                icon: 'error',
                title: 'Promotion Name Already Exists',
                text: 'The promotion name you entered is already in use. Please try another one.',
                confirmButtonText: 'OK',
              });
            } else if (data.message === 'Promotion code is already in use') {
              Swal.fire({
                icon: 'error',
                title: 'Promotion Code Already Exists',
                text: 'The promotion code you entered is already in use. Please try another one.',
                confirmButtonText: 'OK',
              });
            } else {
              Swal.fire({
                  icon: 'success',
                  title: 'Promotion Created',
                  text: 'Promotion created successfully!',
                  confirmButtonText: 'OK',
                }).then(() => {
                  onClose();
                  window.location.reload();
                });
              }
            }
          }) .catch((error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error creating promotion. Please try again later.',
                confirmButtonText: 'OK',
              });
              console.error('Error creating promotion:', error);
            });
    };

    return (
        <div>
      <Modal.Header closeButton>
        <Modal.Title>Edit Promotion</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '68vh', overflowY: 'auto' }}>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group controlId="name">
              <Form.Label>Promotion Name <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Control type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            placeholder="Enter Promotion Name" />
            </Form.Group>
          </Row>
  
          <Row className="mb-3">
            <Form.Group as={Col} controlId="for_course">
              <Form.Label>For Course <span style={{ color: "red" }}>*</span></Form.Label>
              <Form.Select name="for_course" 
                           value={formData.for_course || ''} 
                           onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}>
                <option value=""  hidden>For Course</option>
                <option value="all">All</option>
                <option value="specific">Specific</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="code">
              <Form.Label>Promotion Code</Form.Label>
              <Form.Control type="text" 
                            name="code" 
                            value={formData.code} 
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            placeholder="Enter Promotion Code"
                            disabled
                          />
            </Form.Group>
          </Row>
  
          <Row className="mb-3">
            <Form.Group as={Col} xs={12} controlId="type">
                <Form.Label>Type <span style={{ color: "red" }}>*</span> </Form.Label>
                <Form.Select name="type" 
                             value={formData.type || ''} 
                             onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}>
                <option value="" hidden>Select Type</option>
                <option value="amount">Amount</option>
                <option value="percent">Percent</option>
                </Form.Select>
            </Form.Group>
           </Row>

           <Row className="mb-3">
            <Form.Group controlId="courses">
              <Form.Label>Applicable Courses</Form.Label>
              <Select
                isMulti
                name="courses"
                options={courses}
                value={courses.filter((course) => formData.courses.includes(course.value))}
                onChange={(selectedOptions) => handleChange(selectedOptions, { name: 'courses' })}
                className="basic-multi-select"
                classNamePrefix="select"
                isDisabled={formData.for_course === "all" || formData.for_course === ""}
              />
            </Form.Group>
          </Row>
  
          <Row className="mb-3">
            <Form.Group as={Col} controlId="condition_type">
              <Form.Label>Condition Type <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Select name="condition_type" 
                           value={formData.condition_type || ''}
                           onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}>
                <option value="" hidden>Select Condition</option>
                <option value="Once">Once</option>
                <option value="Unlimited">Unlimited</option>
                <option value="LimitPerDay">Limit Per Day</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="discount">
              <Form.Label>Discount <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Control type="number" 
                            name="discount" 
                            value={formData.discount || ''}
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            placeholder="0" />
            </Form.Group>
          </Row>
  
          <Row className="mb-3">
            <Form.Group as={Col} controlId="min_purchase_amount">
              <Form.Label>Min Purchase Amount <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Control type="number" 
                            name="min_purchase_amount" 
                            value={formData.min_purchase_amount || ''}
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            placeholder="0" />
            </Form.Group>
            <Form.Group as={Col} controlId="max_discount">
              <Form.Label>Max Discount <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Control type="number" 
                            name="max_discount" 
                            value={formData.max_discount || ''}
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })} 
                            placeholder="0" />
            </Form.Group>
            
          </Row>
  
          <Row className="mb-3">
            <Form.Group as={Col} controlId="quantity_per_day">
                <Form.Label>Quantity Per Day</Form.Label>
                <Form.Control 
                  type="number" 
                  name="quantity_per_day" 
                  value={formData.quantity_per_day ? String(formData.quantity_per_day) : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange({ name: e.target.name, value: value || String(formData.quantity) }); 
                  }}
              placeholder="0" 
            />
            </Form.Group>
            <Form.Group as={Col} controlId="quantity">
              <Form.Label>Quantity <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Control type="number" 
                            name="quantity" 
                            value={formData.quantity || ''}
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            placeholder="0" />
            </Form.Group>
          </Row>
  
          <Row className="mb-3">
            <Form.Group as={Col} controlId="start_date">
              <Form.Label>Start Date <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Control type="date" 
                            name="start_date" 
                            value={formData.start_date} 
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            pattern="\d{2}/\d{2}/\d{4}" />
            </Form.Group>
            <Form.Group as={Col} controlId="end_date">
              <Form.Label>End Date <span style={{ color: "red" }}>*</span> </Form.Label>
              <Form.Control type="date" 
                            name="end_date" 
                            value={formData.end_date} 
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            pattern="\d{2}/\d{2}/\d{4}" />
            </Form.Group>
          </Row>
  
          <Row className="mb-3">
            <Form.Group controlId="remark">
              <Form.Label>Remark</Form.Label>
              <Form.Control as="textarea" rows={3} 
                            name="remark" 
                            value={formData.remark} 
                            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                            placeholder="Enter Remark" />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="start_time">
              <Form.Label>Start Time</Form.Label>
              <Form.Control type="time" 
                            name="start_time" 
                            value={formData.times[0]?.start_time} 
                            onChange={handleTimeChange}
                          />
            </Form.Group>
            <Form.Group as={Col} controlId="end_time">
              <Form.Label>End Time</Form.Label>
              <Form.Control type="time" 
                            name="end_time" 
                            value={formData.times[0]?.end_time} 
                            onChange={handleTimeChange}
                          />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId='status'>
                <Form.Check
                type='checkbox'
                label='Active Promotion'
                name='status'
                checked={formData.status}
                onChange={(e) => {
                    setFormData((prevState) => ({
                        ...prevState,
                        status: e.target.checked,
                    }));
                }}
                />
            </Form.Group>
          </Row>
            
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

          <Stack>
            <Button variant="success" type="submit">
              Save
            </Button>
          </Stack>
        </Form>
      </Modal.Body>
    </div>
    );  
}
    
    