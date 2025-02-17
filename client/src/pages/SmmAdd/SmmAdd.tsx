import { useState, useEffect, useContext } from "react";
import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button.tsx";
import Input from "../../components/input/Input.tsx";
import styles from "./SmmAdd.module.css";
import Notification from '../../components/Notification/Notification';

interface Type {
  _id: string;
  name: string;
}
interface Tag {
  _id: string;
  name: string;
}
interface Accounts {
  _id: string;
  name: string;
}
interface Subcategory {
  _id: string;
  name: string;
}
interface Category {
  _id: string;
  name: string;
  subcategories: Subcategory[];
}

interface TopComment {
  created_at: string;
  owner: string;
  text: string;
}

export default function SmmAdd() {
  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Add" }
  ];

  const [maxComments, setMaxComments] = useState("3");


  const { user } = useContext(AuthContext)!;
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // SMM Post Fields

  const [likes, setLikes] = useState<number | "">(0);
  const [shares, setShares] = useState<number | "">(0);
  const [comments, setComments] = useState<number | "">(0);
  const [sponsored, setSponsored] = useState(false);
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [platform, setPlatform] = useState("");
  const [type, setType] = useState("");
  const [tagsSelected, setTagsSelected] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [link, setLink] = useState("");
  const [dayOfTheWeek, setDayOfTheWeek] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [topComments, setTopComments] = useState<TopComment[]>([]);
  const [messages, setMessages] = useState<{ type: "success" | "error"; text: string }[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedTag, setSelectedTag] = useState(""); // Selected tag from dropdown


  // For select dropdowns
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Regex for platform detection
  const Platforms: { name: string; pattern: RegExp }[] = [
    { name: "Facebook", pattern: /facebook\.com/ },
    { name: "Instagram", pattern: /instagram\.com/ },
    { name: "TikTok", pattern: /tiktok\.com/ },
    { name: "LinkedIn", pattern: /linkedin\.com/ },
    { name: "YouTube", pattern: /youtube\.com/ },
  ];

  useEffect(() => {
    fetchTypes();
    fetchAccounts();
    fetchTags();
    fetchCategories();
  }, []);

  // Update day_of_the_week whenever date changes
  useEffect(() => {
    if (date) {
      // date is in format "YYYY-MM-DD"? or "DD.MM.YYYY"?
      // You might have to parse it properly. We'll assume it's "YYYY-MM-DD" for this example.
      try {
        const [year, month, day] = date.split("-");
        const dt = new Date(Number(year), Number(month) - 1, Number(day));
        const weekday = dt.toLocaleString("en-US", { weekday: "long" });
        setDayOfTheWeek(weekday.toLowerCase());
      } catch (e) {
        console.error("Invalid date format:", date);
      }
    }
  }, [date]);

  // Update platform whenever link changes
  useEffect(() => {
    if (link) {
      let detectedPlatform = "";
      for (const p of Platforms) {
        if (p.pattern.test(link)) {
          detectedPlatform = p.name;
          break;
        }
      }
      setPlatform(detectedPlatform);
    }
  }, [link]);

  const fetchTypes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/types`);
      setTypes(response.data);
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };
  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/social-accounts`);
      setAccounts(response.data); // Store accounts in state
    } catch (error) {
      console.error("Error fetching Accounts:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/tags`);
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleToggleTag = (tagName: string) => {
    if (tagsSelected.includes(tagName)) {
      setTagsSelected(tagsSelected.filter(t => t !== tagName));
    } else {
      setTagsSelected([...tagsSelected, tagName]);
    }
  };

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    setImages([...images, url.trim()]);
  };

  const handleRemoveImage = (imgUrl: string) => {
    setImages(images.filter(img => img !== imgUrl));
  };

  const handleAddTopComment = () => {
    const newTop: TopComment = {
      created_at: "",
      owner: "",
      text: "",
    };
    setTopComments([...topComments, newTop]);
  };

  const handleTopCommentChange = (index: number, field: "created_at" | "owner" | "text", value: string) => {
    const updated = [...topComments];
    (updated[index] as any)[field] = value;
    setTopComments(updated);
  };

  const handleRemoveTopComment = (index: number) => {
    setTopComments(topComments.filter((_, i) => i !== index));
  };

  const handleSavePost = async () => {
    if (!user || !["admin", "smm"].some(role => user.roles.includes(role))) {
      setMessages(prev => [...prev, error.response?.data?.error || "Unauthorized"]);
      return;
    }

    const normalizedLink = normalizeInstagramUrl(link);

    // Fetch all posts to check for duplicate links
    try {
      const existingPostsResponse = await axios.get(`${import.meta.env.VITE_BACKEND}/api/smmpost`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

// Ensure smmPosts exists and is an array
      const smmPosts = existingPostsResponse.data?.smmPosts ?? [];

      const isDuplicate = smmPosts.some((post: any) => normalizeInstagramUrl(post.link) === normalizedLink);

      if (isDuplicate) {
        setMessages(prev => [...prev, { type: "error", text: "Duplicate post detected with this link." }]);
        return;
      }

      if (isDuplicate) {
        setMessages(prev => [...prev, { type: "error", text: "Duplicate post detected with this link." }]);
        return;
      }
    } catch (error: any) {
      console.error("Error fetching existing posts:", error.response?.data || error.message);
      setMessages(prev => [...prev, { type: "error", text: error.response?.data?.error || "Failed to fetch posts from the database." }]);
      return;
    }

    const payload = {
      account: selectedAccount || null,
      likes: likes === "" ? null : Number(likes),
      shares: shares === "" ? null : Number(shares),
      comments: comments === "" ? null : Number(comments),
      sponsored,
      date: date || null,
      hour: hour || null,
      type: type || null,
      tags: tagsSelected.length ? tagsSelected : null,
      category: category || null,
      sub_category: subCategory || null,
      link: normalizedLink || null,
      day_of_the_week: dayOfTheWeek || null,
      platform: platform || null,  // new
      images: images.length ? images : null,  // new
      topcomments: topComments.length ? topComments : null,
      description: description || null,
    };

    try {
      const response = await axios.post(
          `${import.meta.env.VITE_BACKEND}/api/smmpost`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
      );
      setMessages(prev => [...prev, { type: "success", text: "SmmPost created successfully." }]);
      console.log("Created smm post:", response.data);
    } catch (error: any) {
      console.error("Error creating smm post:", error.response?.data || error.message);
      setMessages(prev => [...prev, error.response?.data?.error || "Error creating smm post"]);
    }
  };



  const handleRemoveTag = (tagName: string) => {
    setTagsSelected(tagsSelected.filter(tag => tag !== tagName));
  };


  const handleAddTag = () => {
    if (!selectedTag || tagsSelected.includes(selectedTag)) return; // Prevent duplicates
    setTagsSelected([...tagsSelected, selectedTag]); // Add selected tag
    setSelectedTag(""); // Reset dropdown
  };




  const handleLoadLink = async () => {
    if (!link) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/instagram/get_insta_post`, {
        params: { url: link, top_comments_count: maxComments },
        timeout: 15000, // Wait up to 15 seconds
      });
      const data = response.data;
      // Autofill fields from response:
      setLikes(data.Likes);
      setComments(data["Comments Count"]);
      setShares(data.Shares);
      const [day, month, year] = data.Date.split(".");
      const formattedDate = `${year}-${month}-${day}`;
      setDate(formattedDate);
      setHour(data.Time);
      const dt = new Date(Number(year), Number(month) - 1, Number(day));
      const weekday = dt.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
      setDayOfTheWeek(weekday);
      setDescription(data.Description);
      setTopComments(data["Top Comments"]);
      // Extract image URLs from Media array:
      const imgs = data.Media.map((item: any) => {
        if (item.type === "image") return item.image_url;
        else if (item.type === "video") return item.thumbnail || item.video_url;
        return null;
      }).filter((url: any) => url !== null);
      setImages(imgs);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading link:", error.message);
      setMessages(prev => [...prev, error.response?.data?.error || "Error loading link"]);
      setIsLoading(false);
    }
  };

  const normalizeInstagramUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== "www.instagram.com") return url; // If not Instagram, return as is

      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "p") {
        return `https://www.instagram.com/p/${pathParts[1]}/`; // Normalize to base post URL
      }
      return urlObj.origin + "/" + pathParts.join("/");
    } catch (e) {
      console.error("Invalid URL:", url);
      return url;
    }
  };




  return (
      <div className={styles.smmPostCreate}>
        <Menu active="Rețele sociale" />
        <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Add">
          <div className={styles.smmPostForm}>
            {messages.map((msg, index) => (
                <Notification key={index} type={msg.type}>{msg.text}</Notification>
            ))}


            <div className={styles.accounts_inputs}>
              <label>Link&nbsp;</label>
              <Input
                  type="text"
                  value={link}
                  onChange={e => setLink(e.target.value)}
              />
              <Input
                  type="text"
                  value={maxComments}
                  onChange={e => setMaxComments(e.target.value)}
                  maxWidth='40px'
                  style={{padding: '10px', textAlign: 'center'}}
              />
              <Button onClick={handleLoadLink}>Load Link</Button>
              {isLoading && <span>Loading...</span>}
            </div>


            <div className={`${styles.accounts_inputs}`}>
              <div className={styles.formGroup}>
                <label>Platform</label>
                <Input
                    type="text"
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Likes</label>
                <Input
                    type="number"
                    value={likes}
                    onChange={e => setLikes(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Shares</label>
                <Input
                    type="number"
                    value={shares}
                    onChange={e => setShares(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Comments</label>
                <Input
                    type="number"
                    value={comments}
                    onChange={e => setComments(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date</label>
                {/* Suppose you store date as YYYY-MM-DD for simplicity */}
                <Input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Hour</label>
                <Input
                    type="time"
                    value={hour}
                    onChange={e => setHour(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Day</label>
                <select
                    value={dayOfTheWeek}
                    onChange={e => setDayOfTheWeek(e.target.value)}
                >
                  <option value="">Select day</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

            </div>


            <div className={`${styles.accounts_inputs} ${styles.accounts_inputs_bg}`}>
              <div className={styles.formGroup}>
                <label>Account</label>
                <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                      <option key={acc._id} value={acc.account_name}>{acc.account_name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="">Select type</option>
                  {types.map(t => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Sub-category</label>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                  <option value="">Select sub-category</option>
                  {categories.find(c => c.name === category)?.subcategories.map(sub => (
                      <option key={sub._id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.selectTagContainer_block}>

                <div className={styles.selectTagContainer}>
                  <div className={styles.formGroup}>
                    <label>Tags</label>
                    <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
                      <option value="">Select a Tag</option>
                      {tags.map(tag => (
                          <option key={tag._id} value={tag.name}>{tag.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>&nbsp;</label>
                  <Button onClick={handleAddTag}>Add</Button>
                </div>

                {/* Display Selected Tags */}
                <div className={styles.tagsContainer}>
                  {tagsSelected.map(tag => (
                      <div key={tag} className={styles.selectedTag}>
                      <span>{tag} <span className={styles.selectedTagX}
                                        onClick={() => handleRemoveTag(tag)}>x</span></span>
                      </div>
                  ))}
                </div>
              </div>

              <div className={styles.tagsContainer}>
                <label>Sponsored</label>
                <input
                    type="checkbox"
                    checked={sponsored}
                    onChange={e => setSponsored(e.target.checked)}
                />
              </div>
            </div>


            <div className={`${styles.formGroup} ${styles.formGroup_bg}`}>
              <label>Images or Videos (links)</label>
              <div className={styles.imagesItems}>
                {images.map((img, idx) => (
                    <div key={idx} className={styles.imageItem}>
                      <img className={styles.imageItem_img} src={`${import.meta.env.VITE_BACKEND}${img}`}/>
                      <span className={styles.imageItem_img_btn} onClick={() => handleRemoveImage(img)}>delete</span>
                    </div>
                ))}
              </div>
              <AddImageForm onAddImage={handleAddImage}/>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroup_bg}`}>
              <label>Top Comments</label>
              <div className={styles.topcomments_cards}>


                {topComments.map((tc, idx) => (
                    <div key={idx} className={styles.commentItem}>
                      <Input
                          type="text"
                          placeholder="created_at (e.g. 2025-02-11T21:21:43)"
                          value={tc.created_at}
                          onChange={e => handleTopCommentChange(idx, "created_at", e.target.value)}
                      />
                      <Input
                          type="text"
                          placeholder="owner"
                          value={tc.owner}
                          onChange={e => handleTopCommentChange(idx, "owner", e.target.value)}
                      />
                      <Input
                          type="text"
                          placeholder="text"
                          value={tc.text}
                          onChange={e => handleTopCommentChange(idx, "text", e.target.value)}
                      />
                      <Button bgcolor="transparent" border="#D9DFFF" onClick={() => handleRemoveTopComment(idx)}>Remove</Button>
                    </div>
                ))}
              </div>
              <Button bgcolor="transparent" border="#D9DFFF" onClick={handleAddTopComment}>+ Add Comment</Button>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroup_bg}`}>
              <label>Description</label>
              <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter post description"
                  className={styles.descriptionTextarea}
              ></textarea>


            </div>

            <div style={{height: '20px'}}>
              &nbsp;
            </div>
            <Button onClick={handleSavePost}>Save Post</Button>
            <div style={{height: '20px'}}>
              &nbsp;
            </div>
          </div>
        </Dashboard>
      </div>
  );
}

/** Helper component for adding image URLs. */
function AddImageForm({onAddImage}: { onAddImage: (url: string) => void }) {
  const [tempImg, setTempImg] = useState("");

  const handleAdd = () => {
    if (tempImg.trim()) {
      onAddImage(tempImg.trim());
      setTempImg("");
    }
  };

  return (
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center'}}>
        <Input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={tempImg}
            onChange={e => setTempImg(e.target.value)}
        />
        <Button bgcolor="transparent" border="#D9DFFF" onClick={handleAdd}>Add</Button>
      </div>
  );
}
