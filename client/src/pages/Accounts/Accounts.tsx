import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import styles from "./Accounts.module.css";
import Button from "../../components/Button.tsx";

interface LinkEntry {
  _id?: string;       // present for existing links
  platform: string;
  link: string;
}

interface SocialAccount {
  _id: string;
  account_name: string;
  links: LinkEntry[];
}

export default function Accounts() {
  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Accounts" }
  ];

  const { user } = useContext(AuthContext)!;
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);

  // Add form state
  const [name, setName] = useState('');
  const [newLinks, setNewLinks] = useState<LinkEntry[]>([]);
  const [tempLink, setTempLink] = useState<LinkEntry>({ platform: '', link: '' });
  const [error, setError] = useState<string|null>(null);

  // Edit form state
  const [editing, setEditing] = useState<SocialAccount|null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedLinks, setEditedLinks] = useState<LinkEntry[]>([]);
  const [tempEditLink, setTempEditLink] = useState<LinkEntry>({ platform: '', link: '' });
  const [editError, setEditError] = useState<string|null>(null);

  // For platform auto-detect
  const allowedPlatforms = [
    { name: "Facebook", pattern: /facebook\.com/ },
    { name: "Instagram", pattern: /instagram\.com/ },
    { name: "TikTok", pattern: /tiktok\.com/ },
    { name: "LinkedIn", pattern: /linkedin\.com/ },
    { name: "YouTube", pattern: /youtube\.com/ },
  ];

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const resp = await axios.get(`${import.meta.env.VITE_BACKEND}/api/social-accounts`);
      setAccounts(resp.data);
    } catch (e) {
      console.error('Error fetching accounts:', e);
    }
  };

  const detectPlatform = (link: string) => {
    for (let p of allowedPlatforms) {
      if (p.pattern.test(link)) return p.name;
    }
    return '';
  };

  // ---- Add-mode handlers ----
  const onTempLinkChange = (value: string) => {
    setTempLink({ platform: detectPlatform(value), link: value });
  };

  const addTempLink = () => {
    setError(null);
    if (!tempLink.platform || !tempLink.link) {
      setError('Invalid or unsupported link.');
      return;
    }
    if (newLinks.some(l => l.platform === tempLink.platform)) {
      setError(`${tempLink.platform} already added.`);
      return;
    }
    setNewLinks([...newLinks, tempLink]);
    setTempLink({ platform: '', link: '' });
  };

  const saveNew = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Account name is required.');
      return;
    }
    try {
      await axios.post(
          `${import.meta.env.VITE_BACKEND}/api/social-accounts/add`,
          { account_name: name, links: newLinks },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setName('');
      setNewLinks([]);
      fetchAccounts();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Save failed.');
    }
  };

  // ---- Edit-mode handlers ----
  const startEdit = (acct: SocialAccount) => {
    setEditing(acct);
    setEditedName(acct.account_name);
    setEditedLinks([...acct.links]);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditedLinks([]);
    setTempEditLink({ platform: '', link: '' });
  };

  const onTempEditChange = (value: string) => {
    setTempEditLink({ platform: detectPlatform(value), link: value });
  };

  const addTempEditLink = () => {
    setEditError(null);
    if (!tempEditLink.platform || !tempEditLink.link) {
      setEditError('Invalid link.');
      return;
    }
    if (editedLinks.some(l => l.platform === tempEditLink.platform)) {
      setEditError(`${tempEditLink.platform} already exists.`);
      return;
    }
    setEditedLinks([...editedLinks, tempEditLink]);
    setTempEditLink({ platform: '', link: '' });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setEditError(null);
    if (!editedName.trim()) {
      setEditError('Account name is required.');
      return;
    }
    try {
      await axios.put(
          `${import.meta.env.VITE_BACKEND}/api/social-accounts/edit/${editing._id}`,
          { account_name: editedName, links: editedLinks },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      cancelEdit();
      fetchAccounts();
    } catch (e: any) {
      setEditError(e.response?.data?.message || 'Update failed.');
    }
  };

  // ---- Delete account ----
  const deleteAccount = async (id: string) => {
    try {
      await axios.delete(
          `${import.meta.env.VITE_BACKEND}/api/social-accounts/delete/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setAccounts(accounts.filter(a => a._id !== id));
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  return (
      <div className={styles.accounts}>
        <Menu active="Rețele sociale" />
        <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Accounts">
          <div className={styles.accounts_changes}>

            {!editing ? (
                <>
                  <h3>Add Account</h3>
                  {error && <div className={styles.error}>{error}</div>}
                  <div className={styles.accounts_inputs}>
                    <input
                        placeholder="Account Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <input
                        placeholder="Link URL"
                        value={tempLink.link}
                        onChange={e => onTempLinkChange(e.target.value)}
                    />
                    <Button onClick={addTempLink}>Add link</Button>
                  </div>
                  <ul>
                    {newLinks.map((l, i) => (
                        <li key={i}>{l.platform}: {l.link}</li>
                    ))}
                  </ul>
                  <Button onClick={saveNew}>Save Account</Button>
                </>
            ) : (
                <>
                  <h3>Edit Account</h3>
                  {editError && <div className={styles.error}>{editError}</div>}
                  <div className={styles.accounts_inputs}>
                    <input
                        placeholder="Account Name"
                        value={editedName}
                        onChange={e => setEditedName(e.target.value)}
                    />
                    <input
                        placeholder="Link URL"
                        value={tempEditLink.link}
                        onChange={e => onTempEditChange(e.target.value)}
                    />
                    <Button onClick={addTempEditLink}>Add link</Button>
                  </div>
                  <ul className={styles.accounts_inputs_ul}>
                    {editedLinks.map(l => (
                        <li key={l._id}>
                         <b> {l.platform}:</b> {l.link}
                          <Button
                              onClick={() =>
                                  setEditedLinks(editedLinks.filter(x => x._id !== l._id))
                              }
                          >
                            Delete
                          </Button>
                        </li>
                    ))}
                  </ul>
                 <div className={styles.accounts_inputs_btns}>
                   <Button onClick={saveEdit}>Save Changes</Button>
                   <Button onClick={cancelEdit}>Cancel</Button>
                 </div>
                </>
            )}

            <h3>Existing Accounts</h3>
            <table className={styles.accounts_table}>

              <tbody>
              <tr>
                <td><b>Name</b></td>
                <td><b>Links</b></td>
                <td><b>Actions</b></td>
              </tr>
              {accounts.map(a => (
                  <tr key={a._id}>
                    <td>{a.account_name}</td>
                    <td>
                      <ul>
                        {a.links.map(l => (
                            <li key={l._id}>
                              <a href={l.link} target="_blank">{l.platform} </a>
                            </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <Button onClick={() => startEdit(a)}>Edit</Button>
                      <Button onClick={() => deleteAccount(a._id)}>Delete</Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>

          </div>
        </Dashboard>
      </div>
  );
}
