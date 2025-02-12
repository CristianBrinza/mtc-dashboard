import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import styles from "./Accounts.module.css";
import Button from "../../components/Button.tsx";
import Icon from "../../components/Icon.tsx";

interface SocialAccount {
  _id: string;
  account_name: string;
  platform: string;
  link: string;
}

export default function Accounts() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Accounts" }
  ];

  const { user } = useContext(AuthContext)!;
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [newAccount, setNewAccount] = useState({ account_name: '', platform: '', link: '' });
  const [isValidLink, setIsValidLink] = useState(true);

  // Allowed platforms and their corresponding URL patterns
  const allowedPlatforms: { name: string, pattern: RegExp }[] = [
    { name: "Facebook", pattern: /facebook\.com/ },
    { name: "Instagram", pattern: /instagram\.com/ },
    { name: "TikTok", pattern: /tiktok\.com/ },
    { name: "LinkedIn", pattern: /linkedin\.com/ },
    { name: "YouTube", pattern: /youtube\.com/ },

  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/social-accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  // Detect platform from link
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value.trim();
    setNewAccount(prev => ({ ...prev, link }));

    let detectedPlatform = "";
    let isValid = false;

    if (link) {
      for (const platform of allowedPlatforms) {
        if (platform.pattern.test(link)) {
          detectedPlatform = platform.name;
          isValid = true;
          break;
        }
      }
    }

    setNewAccount(prev => ({ ...prev, platform: detectedPlatform }));
    setIsValidLink(isValid);
  };

  const handleAddAccount = async () => {
    if (!user || !['admin', 'smm'].some(role => user.roles.includes(role))) return;

    if (!isValidLink || !newAccount.platform) {
      alert("Invalid link. Make sure it's from a recognized platform.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND}/api/social-accounts/add`, newAccount, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewAccount({ account_name: '', platform: '', link: '' });
      fetchAccounts();
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!user || !['admin', 'smm'].some(role => user.roles.includes(role))) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND}/api/social-accounts/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Immediately update state instead of waiting for fetch
      setAccounts(prevAccounts => prevAccounts.filter(account => account._id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };


  return (
      <div className={styles.accounts}>
        <Menu active="Rețele sociale"/>
        <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Accounts">
          <div>
            <div className={styles.accounts_changes}>

              <div className={styles.accounts_inputs}>
                <input
                    type="text"
                    placeholder="Account Name"
                    value={newAccount.account_name}
                    onChange={e => setNewAccount({...newAccount, account_name: e.target.value})}
                />

                <input
                    type="text"
                    placeholder="Link"
                    value={newAccount.link}
                    onChange={handleLinkChange}
                    style={{ border: isValidLink ? "1px solid #ccc" : "2px solid red" }}
                />

                <Button onClick={handleAddAccount}>Add Account</Button>
              </div>

              <div className={styles.accounts_table}>
                <h3 className={styles.accounts_table_title}>Accounts</h3>
                <table className={styles.accounts_table}>
                  <tbody>
                  {accounts.map(account => (
                      <tr key={account._id}>
                        <td>{account.account_name}</td>
                        <td>{account.platform || "Unknown"}</td>
                        <td>
                          <Button to={account.link}><Icon type="links"/></Button>
                          <Button onClick={() => handleDeleteAccount(account._id)}>Delete</Button>
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
