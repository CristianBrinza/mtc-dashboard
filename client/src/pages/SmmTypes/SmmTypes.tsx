import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import styles from "./SmmTypes.module.css";
import Button from "../../components/Button.tsx";
import Input from "../../components/input/Input.tsx";
import {createNotification} from "../../services/notificationService.tsx";

interface Type {
  _id: string;
  name: string;
}


export default function SmmTypes() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Types" }
]
  const { user } = useContext(AuthContext)!;
  const [types, setTypes] = useState<Type[]>([]);
  const [newType, setNewType] = useState("");
  const [renameType, setRenameType] = useState({ oldName: "", newName: "" });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/types`);
      setTypes(response.data);
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const handleAddType = async () => {
    if (!user || !["admin", "smm"].some(role => user.roles.includes(role))) return;

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND}/api/types/add`, { name: newType }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setNewType("");
      fetchTypes();

      // ✅ Build notification with _id
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const date = `${dd}.${mm}.${yyyy}`;
        const hour = `${hh}:${min}`;

        const notificationPayload = {
          type: "info",
          text: `New Type added - [${newType}]`,
          date,
          hour,
          link: `/retele-sociale/types`, // 🟢 link now includes _id
        };

        try {
          const notifResp = await createNotification(notificationPayload);
          console.log("✅ Notification created:", notifResp.data);
        } catch (err) {
          console.error("❌ Failed to create notification", err);
        }

    } catch (error: any) {
      console.error("Error adding type:", error.response?.data?.message || error.message);
    }
  };

  const handleRenameType = async () => {
    if (!user || !["admin", "smm"].some(role => user.roles.includes(role))) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND}/api/types/rename`, renameType, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setRenameType({ oldName: "", newName: "" });
      fetchTypes();
    } catch (error: any) {
      console.error("Error renaming type:", error.response?.data?.message || error.message);
    }
  };



  return (
  <>
    <Menu active="Rețele sociale"/>
    <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Types">
      <div className={styles.type_changes}>

        {/* Add Type */}
        {user?.roles.some(role => ["admin", "smm"].includes(role)) && (
            <div className={styles.type_inputs}>
              <Input
                  type="text"
                  placeholder="New Type"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className=""
              />
              <Button onClick={handleAddType} className="">
                Add Type
              </Button>
            </div>
        )}

        {/* Rename Type */}
        {user?.roles.some(role => ["admin", "smm"].includes(role)) && (
            <div className={styles.type_inputs}>
              <select
                  value={renameType.oldName}
                  onChange={e => setRenameType({...renameType, oldName: e.target.value})}
                  className=""
              >
                <option value="">Select Type</option>
                {types.map(type => (
                    <option key={type._id} value={type.name}>{type.name}</option>
                ))}
              </select>
              <Input
                  type="text"
                  placeholder="New Type Name"
                  value={renameType.newName}
                  onChange={e => setRenameType({...renameType, newName: e.target.value})}
                  className="ml-2"
              />
              <Button onClick={handleRenameType} className="">
                Rename Type
              </Button>
            </div>
        )}

        {/* List of Types */}
        <div>
          <h3 className={styles.type_table_title}>Types</h3>
          <table className={styles.type_table}>
            <tbody>
            {types.map(type => (
                <tr key={type._id}>
                  <td><b>{type.name}</b></td>
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
