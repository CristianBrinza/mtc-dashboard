import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import styles from  "./Categories.module.css"
import Button from "../../components/Button.tsx";


interface Subcategory {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  subcategories: Subcategory[];
}


export default function Categories() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Categories" }
]


  const { user } = useContext(AuthContext)!;
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState({ category: '', name: '' });
  const [renameCategory, setRenameCategory] = useState({ oldName: '', newName: '' });
  const [renameSubcategory, setRenameSubcategory] = useState({ category: '', oldName: '', newName: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!user || !['admin', 'smm'].some(role => user.roles.includes(role))) return;

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND}/api/categories/add`, { name: newCategory }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNewCategory('');
      fetchCategories();
    } catch (error: any) {
      console.error('Error adding category:', error.response?.data?.message || error.message);
    }
  };

  const handleAddSubcategory = async () => {
    if (!user || !['admin', 'smm'].some(role => user.roles.includes(role))) return;

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND}/api/categories/add-subcategory`,
          { categoryName: newSubcategory.category, subcategoryName: newSubcategory.name },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setNewSubcategory({ category: '', name: '' });
      fetchCategories();
    } catch (error: any) {
      console.error('Error adding subcategory:', error.response?.data?.message || error.message);
    }
  };


  const handleRenameCategory = async () => {
    if (!user || !['admin', 'smm'].some(role => user.roles.includes(role))) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND}/api/categories/rename`, renameCategory, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setRenameCategory({ oldName: '', newName: '' });
      fetchCategories();
    } catch (error: any) {
      console.error('Error renaming category:', error.response?.data?.message || error.message);
    }
  };

  const handleRenameSubcategory = async () => {
    if (!user || !['admin', 'smm'].some(role => user.roles.includes(role))) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND}/api/categories/rename-subcategory`,
          { categoryName: renameSubcategory.category, oldSubcategoryName: renameSubcategory.oldName, newSubcategoryName: renameSubcategory.newName },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setRenameSubcategory({ category: '', oldName: '', newName: '' });
      fetchCategories();
    } catch (error: any) {
      console.error('Error renaming subcategory:', error.response?.data?.message || error.message);
    }
  };



  return (
      <div className={styles.category}>
        <Menu active="Rețele sociale"/>
        <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Categories">
          <div>


            <div className={styles.category_changes}>


              {/* Add Category */}
              {user?.roles.some(role => ['admin', 'smm'].includes(role)) && (
                  <div className={styles.category_inputs}>
                    <input
                        type="text"
                        placeholder="New Category"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        className=""
                    />
                    <Button onClick={handleAddCategory} className="">
                      Add Category
                    </Button>
                  </div>
              )}

              {/* Add Subcategory */}
              {user?.roles.some(role => ['admin', 'smm'].includes(role)) && (
                  <div className={styles.category_inputs}>
                    <select
                        value={newSubcategory.category}
                        onChange={e => setNewSubcategory({...newSubcategory, category: e.target.value})}
                        className=""
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>

                    <input
                        type="text"
                        placeholder="New Subcategory"
                        value={newSubcategory.name}
                        onChange={e => setNewSubcategory({...newSubcategory, name: e.target.value})}
                        className=" ml-2"
                    />
                    <Button onClick={handleAddSubcategory} className="">
                      Add Subcategory
                    </Button>
                  </div>
              )}

              {/* Rename Category */}
              {user?.roles.some(role => ['admin', 'smm'].includes(role)) && (
                  <div className={styles.category_inputs}>
                    <select
                        value={renameCategory.oldName}
                        onChange={e => setRenameCategory({...renameCategory, oldName: e.target.value})}
                        className=""
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                        type="text"
                        placeholder="New Category Name"
                        value={renameCategory.newName}
                        onChange={e => setRenameCategory({...renameCategory, newName: e.target.value})}
                        className=" ml-2"
                    />
                    <Button onClick={handleRenameCategory} className="">
                      Rename Category
                    </Button>
                  </div>
              )}

              {/* Rename Category */}
              {user?.roles.some(role => ['admin', 'smm'].includes(role)) && (
                  <div className={styles.category_inputs}>
                    <select
                        value={renameSubcategory.category}
                        onChange={e => setRenameSubcategory({...renameSubcategory, category: e.target.value})}
                        className=""
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>

                    <select
                        value={renameSubcategory.oldName}
                        onChange={e => setRenameSubcategory({...renameSubcategory, oldName: e.target.value})}
                        className=""
                    >
                      <option value="">Select Subcategory</option>
                      {categories.find(cat => cat.name === renameSubcategory.category)?.subcategories.map(sub => (
                          <option key={sub._id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>

                    <input
                        type="text"
                        placeholder="New Subcategory Name"
                        value={renameSubcategory.newName}
                        onChange={e => setRenameSubcategory({...renameSubcategory, newName: e.target.value})}
                        className=" ml-2"
                    />
                    <Button onClick={handleRenameSubcategory} className="">
                      Rename Subcategory
                    </Button>
                  </div>
              )}


              <div className="">
                <h3 className={styles.category_table_title}>Categories</h3>
                <table className={styles.category_table}>
                  <tbody>
                  {categories.map(category => (

                      <tr>
                        <td key={category._id}><b>{category.name}</b></td>
                        <td>
                          <ul className="">
                            {category.subcategories.map(sub => (
                                <li key={sub._id} className=""> {sub.name}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>


                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Dashboard>
      </div>
  );
}
