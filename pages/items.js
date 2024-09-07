import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';

// Make sure to bind the modal to your app element
Modal.setAppElement('#__next');

export default function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); // Add state for categories
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: '',
    category: ''
  });
  const [editItem, setEditItem] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(''); // Category filter
  const [inStockFilter, setInStockFilter] = useState(''); // In-stock filter
  const router = useRouter();

  // Fetch categories and items when component mounts
  useEffect(() => {
    async function fetchCategoriesAndItems() {
      const token = localStorage.getItem('token');
      let query = '';

      // Add query parameters for filtering
      if (categoryFilter) query += `category=${categoryFilter}&`;
      if (inStockFilter) query += `inStock=${inStockFilter}&`;

      try {
        // Fetch items
        const itemsRes = await fetch(`/api/items?${query}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch categories
        const categoriesRes = await fetch('/api/categories'); // Assuming you have a backend route for categories

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
        } else {
          console.error('Failed to fetch items');
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData); // Set categories in state
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategoriesAndItems();
  }, [categoryFilter, inStockFilter]);

  // Handle new item form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prevItem => ({ ...prevItem, [name]: value }));
  };

  // Handle adding new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const itemToSend = {
      ...newItem,
      quantity: parseInt(newItem.quantity, 10), // Convert quantity to an integer
    };

    if (!itemToSend.name || !itemToSend.description || itemToSend.quantity == null || !itemToSend.category) {
      console.error('All fields are required');
      return;
    }

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemToSend),
      });
      if (res.ok) {
        const data = await res.json();
        setItems([...items, data]);
        setNewItem({ name: '', description: '', quantity: '', category: '' });
      } else {
        console.error('Failed to add item:', await res.text());
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Handle deleting an item
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Open modal to edit item
  const openModal = (item) => {
    setEditItem(item);
    setModalIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
    setEditItem(null);
  };

  // Handle editing item form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem(prevItem => ({ ...prevItem, [name]: value }));
  };

  // Handle submitting the edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem.name || !editItem.description || editItem.quantity == null || !editItem.category) {
      console.error('All fields are required for editing');
      return;
    }

    const token = localStorage.getItem('token');
    const updatedItem = { ...editItem, quantity: parseInt(editItem.quantity, 10) };

    try {
      const res = await fetch(`/api/items/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedItem),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(items.map(item => (item.id === data.id ? data : item)));
        closeModal(); // Close modal on success
      } else {
        const errorMessage = await res.text();
        console.error('Failed to edit item:', errorMessage);
      }
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Inventory Items</h1>

      {/* Category Filter Dropdown */}
      <div>
        <label>Filter by Category:</label>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <label>In Stock:</label>
        <select value={inStockFilter} onChange={(e) => setInStockFilter(e.target.value)}>
          <option value="">All</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
      </div>

      {/* Form for Adding a New Item */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={newItem.name} onChange={handleChange} placeholder="Name" required />
        <input type="text" name="description" value={newItem.description} onChange={handleChange} placeholder="Description" required />
        <input type="number" name="quantity" value={newItem.quantity} onChange={handleChange} placeholder="Quantity" required />
        <select name="category" value={newItem.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <button type="submit">Add Item</button>
      </form>

      {/* List of Items */}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Category: {item.category}</p>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
            <button onClick={() => openModal(item)}>Edit</button>
          </li>
        ))}
      </ul>

      {/* Modal for Editing an Item */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Edit Item">
        <h2>Edit Item</h2>
        <form onSubmit={handleEditSubmit}>
          <input type="text" name="name" value={editItem?.name || ''} onChange={handleEditChange} placeholder="Name" required />
          <input type="text" name="description" value={editItem?.description || ''} onChange={handleEditChange} placeholder="Description" required />
          <input type="number" name="quantity" value={editItem?.quantity || ''} onChange={handleEditChange} placeholder="Quantity" required />
          <select name="category" value={editItem?.category || ''} onChange={handleEditChange} required>
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={closeModal}>Close</button>
        </form>
      </Modal>
    </div>
  );
}
