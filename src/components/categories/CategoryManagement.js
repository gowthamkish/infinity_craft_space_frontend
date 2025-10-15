import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Breadcrumb, Button, Card, Row, Col, Table, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiTag, FiLayers, FiEye, FiEyeOff } from "react-icons/fi";
import Header from "../header";
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  addSubcategory, 
  updateSubcategory, 
  deleteSubcategory,
  clearCategoriesError,
  clearOperationError
} from "../../features/categoriesSlice";

const CategoryManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    categories, 
    categoriesLoading: loading, 
    categoriesError: error,
    creating,
    updating,
    deleting,
    operationError
  } = useSelector(state => state.categories);

  // Local state for success messages
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteItem, setDeleteItem] = useState({ type: null, categoryId: null, subcategoryId: null, name: "" });
  


  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories({ includeInactive: true }));
  }, [dispatch]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearCategoriesError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (operationError) {
      const timer = setTimeout(() => dispatch(clearOperationError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [operationError, dispatch]);

  // Handle category operations
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update category
        await dispatch(updateCategory({ 
          id: editingCategory._id, 
          ...categoryForm 
        })).unwrap();
        setSuccess("Category updated successfully!");
      } else {
        // Create category
        await dispatch(createCategory(categoryForm)).unwrap();
        setSuccess("Category created successfully!");
      }
      
      handleCloseCategoryModal();
    } catch (err) {
      console.error("Error saving category:", err);
      // Error will be handled by Redux state
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSubcategory) {
        // Update subcategory
        await dispatch(updateSubcategory({
          categoryId: selectedCategory._id,
          subcategoryId: editingSubcategory._id,
          subcategoryData: subcategoryForm
        })).unwrap();
        setSuccess("Subcategory updated successfully!");
      } else {
        // Create subcategory
        await dispatch(addSubcategory({
          categoryId: selectedCategory._id,
          subcategoryData: subcategoryForm
        })).unwrap();
        setSuccess("Subcategory added successfully!");
      }
      
      handleCloseSubcategoryModal();
    } catch (err) {
      console.error("Error saving subcategory:", err);
      // Error will be handled by Redux state
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteItem.type === 'category') {
        await dispatch(deleteCategory(deleteItem.categoryId)).unwrap();
        setSuccess("Category deleted successfully!");
      } else if (deleteItem.type === 'subcategory') {
        await dispatch(deleteSubcategory({
          categoryId: deleteItem.categoryId,
          subcategoryId: deleteItem.subcategoryId
        })).unwrap();
        setSuccess("Subcategory deleted successfully!");
      }
      
      setShowDeleteModal(false);
      setDeleteItem({ type: null, categoryId: null, subcategoryId: null, name: "" });
    } catch (err) {
      console.error("Error deleting:", err);
      // Error will be handled by Redux state
    }
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await dispatch(updateCategory({ 
        id: categoryId, 
        isActive: !currentStatus 
      })).unwrap();
      setSuccess(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error("Error toggling category status:", err);
      // Error will be handled by Redux state
    }
  };

  // Modal handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ 
      name: category.name, 
      description: category.description || "" 
    });
    setShowCategoryModal(true);
  };

  const handleAddSubcategory = (category) => {
    setSelectedCategory(category);
    setEditingSubcategory(null);
    setSubcategoryForm({ name: "", description: "" });
    setShowSubcategoryModal(true);
  };

  const handleEditSubcategory = (category, subcategory) => {
    setSelectedCategory(category);
    setEditingSubcategory(subcategory);
    setSubcategoryForm({ 
      name: subcategory.name, 
      description: subcategory.description || "" 
    });
    setShowSubcategoryModal(true);
  };

  const handleDeleteCategory = (category) => {
    setDeleteItem({
      type: 'category',
      categoryId: category._id,
      subcategoryId: null,
      name: category.name
    });
    setShowDeleteModal(true);
  };

  const handleDeleteSubcategory = (category, subcategory) => {
    setDeleteItem({
      type: 'subcategory',
      categoryId: category._id,
      subcategoryId: subcategory._id,
      name: subcategory.name
    });
    setShowDeleteModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
  };

  const handleCloseSubcategoryModal = () => {
    setShowSubcategoryModal(false);
    setEditingSubcategory(null);
    setSelectedCategory(null);
    setSubcategoryForm({ name: "", description: "" });
  };

  return (
    <>
      <Header />
      
      <Container fluid className="" style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
        minHeight: '100vh',
        paddingTop: '110px'
      }}>
        {/* Header Section */}
        <div className="mb-4">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item
              onClick={() => navigate("/admin/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: '#495057'
              }}
            >
              <FiArrowLeft style={{ marginRight: 4 }} />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: '#343a40' }}>
              Category Management
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h1 className="text-dark mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '700' }}>
                <FiLayers className="me-3" />
                Category Management
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                Manage product categories and subcategories
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddCategory}
              className="shadow-sm"
              style={{
                borderRadius: '12px',
                fontWeight: '600',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <FiPlus className="me-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Alert Messages */}
        {(error || operationError) && (
          <Alert 
            variant="danger" 
            dismissible 
            onClose={() => {
              if (error) dispatch(clearCategoriesError());
              if (operationError) dispatch(clearOperationError());
            }} 
            className="mb-4"
          >
            {error || operationError}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
            {success}
          </Alert>
        )}

        {/* Categories Table */}
        <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" style={{ color: 'var(--primary-color)' }}>
                  <span className="visually-hidden">Loading categories...</span>
                </Spinner>
                <p className="mt-3 text-muted">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-5">
                <FiLayers size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No categories found</h5>
                <p className="text-muted">Start by adding your first category</p>
                <Button variant="primary" onClick={handleAddCategory}>
                  <FiPlus className="me-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <tr>
                      <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>Category</th>
                      <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>Description</th>
                      <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>Subcategories</th>
                      <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>Status</th>
                      <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <React.Fragment key={category._id}>
                        <tr style={{ borderLeft: '4px solid var(--primary-color)' }}>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                            <div className="d-flex align-items-center">
                              <div 
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '12px'
                                }}
                              >
                                <FiTag size={18} style={{ color: 'white' }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: '#343a40' }}>{category.name}</div>
                                <small className="text-muted">
                                  Created by {category.createdBy?.username || 'Admin'}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                            <span className="text-muted">{category.description || 'No description'}</span>
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                            <div className="d-flex flex-wrap gap-1">
                              {category.subcategories?.filter(sub => sub.isActive).map((subcategory) => (
                                <Badge 
                                  key={subcategory._id} 
                                  bg="secondary" 
                                  className="me-1 mb-1"
                                  style={{ 
                                    cursor: 'pointer',
                                    padding: '0.3rem 0.6rem',
                                    fontSize: '0.75rem'
                                  }}
                                  onClick={() => handleEditSubcategory(category, subcategory)}
                                >
                                  {subcategory.name}
                                </Badge>
                              ))}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleAddSubcategory(category)}
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.7rem',
                                  borderRadius: '6px'
                                }}
                              >
                                <FiPlus size={12} />
                              </Button>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                            <Badge bg={category.isActive ? 'success' : 'danger'}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditCategory(category)}
                                style={{ borderRadius: '6px' }}
                              >
                                <FiEdit2 size={14} />
                              </Button>
                              <Button
                                variant={category.isActive ? 'outline-warning' : 'outline-success'}
                                size="sm"
                                onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                                style={{ borderRadius: '6px' }}
                              >
                                {category.isActive ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteCategory(category)}
                                style={{ borderRadius: '6px' }}
                              >
                                <FiTrash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {/* Subcategories rows */}
                        {category.subcategories?.filter(sub => !sub.isActive).map((subcategory) => (
                          <tr key={`${category._id}-${subcategory._id}`} style={{ backgroundColor: '#f8f9fa' }}>
                            <td style={{ padding: '0.8rem 1rem 0.8rem 3rem', verticalAlign: 'middle' }}>
                              <div className="d-flex align-items-center">
                                <div 
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    backgroundColor: '#6c757d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '8px'
                                  }}
                                >
                                  <FiTag size={12} style={{ color: 'white' }} />
                                </div>
                                <small style={{ fontWeight: '500', color: '#6c757d' }}>
                                  {subcategory.name} (Inactive)
                                </small>
                              </div>
                            </td>
                            <td style={{ padding: '0.8rem', verticalAlign: 'middle' }}>
                              <small className="text-muted">{subcategory.description || 'No description'}</small>
                            </td>
                            <td colSpan="2" style={{ padding: '0.8rem', verticalAlign: 'middle' }}>
                              <Badge bg="danger">Inactive Subcategory</Badge>
                            </td>
                            <td style={{ padding: '0.8rem', textAlign: 'center', verticalAlign: 'middle' }}>
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEditSubcategory(category, subcategory)}
                                  style={{ borderRadius: '6px' }}
                                >
                                  <FiEdit2 size={12} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteSubcategory(category, subcategory)}
                                  style={{ borderRadius: '6px' }}
                                >
                                  <FiTrash2 size={12} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Category Modal */}
        <Modal show={showCategoryModal} onHide={handleCloseCategoryModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FiTag className="me-2" />
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCategorySubmit}>
            <Modal.Body>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Category Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter category name..."
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                      style={{ borderRadius: '8px', padding: '10px 12px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter category description..."
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      style={{ borderRadius: '8px', padding: '10px 12px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseCategoryModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={creating || updating || !categoryForm.name.trim()}
              >
                {(creating || updating) ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {editingCategory ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Subcategory Modal */}
        <Modal show={showSubcategoryModal} onHide={handleCloseSubcategoryModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FiTag className="me-2" />
              {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              {selectedCategory && (
                <Badge bg="primary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                  {selectedCategory.name}
                </Badge>
              )}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubcategorySubmit}>
            <Modal.Body>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Subcategory Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter subcategory name..."
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                      required
                      style={{ borderRadius: '8px', padding: '10px 12px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter subcategory description..."
                      value={subcategoryForm.description}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                      style={{ borderRadius: '8px', padding: '10px 12px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseSubcategoryModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={creating || updating || !subcategoryForm.name.trim()}
              >
                {(creating || updating) ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {editingSubcategory ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {editingSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FiTrash2 className="me-2" />
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete the {deleteItem.type}{' '}
              <strong>"{deleteItem.name}"</strong>?
            </p>
            {deleteItem.type === 'category' && (
              <Alert variant="warning" className="mt-3">
                <small>
                  <strong>Warning:</strong> This will also affect all products in this category. 
                  The category will be deactivated rather than permanently deleted.
                </small>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="me-2" />
                  Delete {deleteItem.type}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default CategoryManagement;