import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';

// Make sure to bind the modal to your app element
Modal.setAppElement('#__next');

export default function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); // State to hold unique categories
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: '',
    category: ''
  });
  const [editItem, setEditItem] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(''); // Filtreringsfält
  const [inStockFilter, setInStockFilter] = useState(''); // Lagerstatus-filter
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Om ingen token finns, omdirigera till login eller index
      router.push('/index');
      return; // Stoppa vidare exekvering
    }
  
    async function fetchItems() {
      let query = '';
  
      // Lägg till query-parametrar för filtrering om de finns
      if (categoryFilter) query += `category=${categoryFilter}&`;
      if (inStockFilter) query += `inStock=${inStockFilter}&`;
  
      try {
        const res = await fetch(`/api/items?${query}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          setItems(data);
  
          // Extract unique categories from fetched items
          const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
          setCategories(uniqueCategories); // Store unique categories in state
        } else if (res.status === 401) {
          // Omdirigera om användaren inte är auktoriserad
          router.push('/login');
        } else {
          console.error('Failed to fetch items');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchItems();
  }, [categoryFilter, inStockFilter, router]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prevItem => ({ ...prevItem, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const itemToSend = {
      ...newItem,
      quantity: parseInt(newItem.quantity, 10), // Konvertera quantity till ett heltal
    };

    // Ensure category is unique and added to the list
    if (!categories.includes(newItem.category)) {
      setCategories(prevCategories => [...prevCategories, newItem.category]);
    }

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

  const openModal = (item) => {
    setEditItem(item);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditItem(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem(prevItem => ({ ...prevItem, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const updatedItem = { ...editItem, quantity: parseInt(editItem.quantity, 10) };

    // Add category to the list if it's not already in the categories array
    if (!categories.includes(editItem.category)) {
      setCategories(prevCategories => [...prevCategories, editItem.category]);
    }

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
        closeModal(); // Stänger modalen om PUT-förfrågan lyckas
      } else {
        const errorMessage = await res.text(); // Hämta hela felmeddelandet från API:et
        console.error('Failed to edit item:', errorMessage); // Visa hela felet i konsolen
      }
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Ta bort token från localStorage
    router.push('/login'); // Omdirigera till inloggningssidan eller annan lämplig sida
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Inventory Items</h1>
      
      {/* Logout button */}
      <button onClick={handleLogout}>Log Out</button>

      {/* Filter box */}
      <div className="box filter-box">
        <label>Filter by Category:</label>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <label>
          In Stock:
          <select value={inStockFilter} onChange={(e) => setInStockFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </label>
      </div>
  
      {/* Add Item form */}
      <div className="box">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            type="text"
            name="description"
            value={newItem.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <input
            type="number"
            name="quantity"
            value={newItem.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />
          <input
            list="category-options"
            name="category"
            value={newItem.category}
            onChange={handleChange}
            placeholder="Category"
            required
          />
          <datalist id="category-options">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          <button type="submit">Add Item</button>
        </form>
      </div>
  
      {/* Item list */}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <div>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Category: {item.category}</p>
            </div>
            <div>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
              <button onClick={() => openModal(item)}>Edit</button>
            </div>
          </li>
        ))}
      </ul>
  
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Edit Item"
      >
        <h2>Edit Item</h2>
        <form onSubmit={handleEditSubmit}>
          <input
            type="text"
            name="name"
            value={editItem?.name || ''}
            onChange={handleEditChange}
            placeholder="Name"
            required
          />
          <input
            type="text"
            name="description"
            value={editItem?.description || ''}
            onChange={handleEditChange}
            placeholder="Description"
            required
          />
          <input
            type="number"
            name="quantity"
            value={editItem?.quantity || ''}
            onChange={handleEditChange}
            placeholder="Quantity"
            required
          />
          <input
            list="category-options"
            name="category"
            value={editItem?.category || ''}
            onChange={handleEditChange}
            placeholder="Category"
            required
          />
          <datalist id="category-options">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={closeModal}>Close</button>
        </form>
      </Modal>
    </div>
  );
}
