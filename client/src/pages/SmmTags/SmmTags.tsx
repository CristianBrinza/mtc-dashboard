import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import styles from "./SmmTags.module.css";
import Button from "../../components/Button.tsx";
import Input from "../../components/input/Input.tsx";

interface Tag {
  _id: string;
  name: string;
}


export default function SmmTags() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Tags" }
]


  const { user } = useContext(AuthContext)!;
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [renameTag, setRenameTag] = useState({ oldName: "", newName: "" });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/tags`);
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleAddTag = async () => {
    if (!user || !["admin", "smm"].some(role => user.roles.includes(role))) return;

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND}/api/tags/add`, { name: newTag }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setNewTag("");
      fetchTags();
    } catch (error: any) {
      console.error("Error adding tag:", error.response?.data?.message || error.message);
    }
  };

  const handleRenameTag = async () => {
    if (!user || !["admin", "smm"].some(role => user.roles.includes(role))) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND}/api/tags/rename`, renameTag, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setRenameTag({ oldName: "", newName: "" });
      fetchTags();
    } catch (error: any) {
      console.error("Error renaming tag:", error.response?.data?.message || error.message);
    }
  };


  return (
  <>
    <Menu active="Rețele sociale"/>
    <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Tags">
      <div className={styles.tag_changes}>

        {/* Add Tag */}
        {user?.roles.some(role => ["admin", "smm"].includes(role)) && (
            <div className={styles.tag_inputs}>
              <Input
                  type="text"
                  placeholder="New Tag"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className=""
              />
              <Button onClick={handleAddTag} className="">
                Add Tag
              </Button>
            </div>
        )}

        {/* Rename Tag */}
        {user?.roles.some(role => ["admin", "smm"].includes(role)) && (
            <div className={styles.tag_inputs}>
              <select
                  value={renameTag.oldName}
                  onChange={e => setRenameTag({...renameTag, oldName: e.target.value})}
                  className=""
              >
                <option value="">Select Tag</option>
                {tags.map(tag => (
                    <option key={tag._id} value={tag.name}>{tag.name}</option>
                ))}
              </select>
              <Input
                  type="text"
                  placeholder="New Tag Name"
                  value={renameTag.newName}
                  onChange={e => setRenameTag({...renameTag, newName: e.target.value})}
                  className="ml-2"
              />
              <Button onClick={handleRenameTag} className="">
                Rename Tag
              </Button>
            </div>
        )}

        {/* List of Tags */}
        <div>
          <h3 className={styles.tag_table_title}>Tags</h3>
          <table className={styles.tag_table}>
            <tbody>
            {tags.map(tag => (
                <tr key={tag._id}>
                  <td><b>{tag.name}</b></td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

      </div>
    </Dashboard>
  </>
  );
}
