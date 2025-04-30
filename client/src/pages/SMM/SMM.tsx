import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import Icon from "../../components/Icon.tsx";
import Button from "../../components/Button.tsx";
import Input from "../../components/input/Input.tsx";
import Notification from '../../components/Notification/Notification';
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import styles from "./SMM.module.css";
import addStyles from "../SmmAdd/SmmAdd.module.css";
import * as XLSX from "xlsx";
import { useSearchParams } from "react-router-dom";

interface SmmPost {
  _id: string;
  account: string | null;
  likes: number | null;
  shares: number | null;
  comments: number | null;
  date: string | null;
  day_of_the_week: string | null;
  hour: string | null;
  type: string | null;
  tags: string[] | null;
  category: string | null;
  sub_category: string | null;
  platform: string | null;
  link: string | null;
  description: string | null;
  sponsored: boolean | null;
  images?: string[];
  topcomments?: { created_at: string; owner: string; text: string }[];
}

interface Accounts { _id: string; account_name: string }
interface Types    { _id: string; name: string }
interface Tag      { _id: string; name: string }
interface Subcat   { _id: string; name: string }
interface Category { _id: string; name: string; subcategories: Subcat[] }

export default function SMM() {
  const { user } = useContext(AuthContext)!;
  const [posts, setPosts] = useState<SmmPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const totalPages = Math.ceil(total/limit);

  // filter & sort
  const [filterAccount, setFilterAccount] = useState("");
  const [filterType, setFilterType]   = useState("");
  const [filterDay, setFilterDay]     = useState("");
  const [sortField, setSortField]     = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // dynamic filters
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes]       = useState<string[]>([]);
  const [selectedDays, setSelectedDays]         = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTags, setSelectedTags]         = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);

  const [tempAccount, setTempAccount]       = useState("");
  const [tempType, setTempType]             = useState("");
  const [tempDay, setTempDay]               = useState("");
  const [tempPlatform, setTempPlatform]     = useState("");
  const [tempTag, setTempTag]               = useState("");
  const [tempCategory, setTempCategory]     = useState("");
  const [tempSubCategory, setTempSubCategory] = useState("");

  const [showItemsFilters, setShowItemsFilters] = useState(false);
  const [showItemsSort, setShowItemsSort]       = useState(false);

  // dropdown data
  const [accounts, setAccounts]   = useState<Accounts[]>([]);
  const [types, setTypes]         = useState<Types[]>([]);
  const [tags, setTags]           = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // media viewer
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMedia, setSelectedMedia]     = useState<string[]>([]);

  // modals
  const [detailModal, setDetailModal] = useState<SmmPost|null>(null);
  const [editModal, setEditModal]     = useState<SmmPost|null>(null);
  const [editFields, setEditFields]   = useState<Partial<SmmPost>>({});

  const [searchParams] = useSearchParams();
  const paramId      = searchParams.get("id");
  const paramAccount = searchParams.get("account");
  const paramTag     = searchParams.get("tag");

  useEffect(() => {
    if (paramAccount) setSelectedAccounts([paramAccount]);
    if (paramTag)     setSelectedTags([paramTag]);
    if (paramId)      setFilterAccount("");
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND}/api/social-accounts`)
        .then(r=>setAccounts(r.data))
        .catch(console.error);
    axios.get(`${import.meta.env.VITE_BACKEND}/api/types`)
        .then(r=>setTypes(r.data))
        .catch(console.error);
    axios.get(`${import.meta.env.VITE_BACKEND}/api/tags`)
        .then(r=>setTags(r.data))
        .catch(console.error);
    axios.get(`${import.meta.env.VITE_BACKEND}/api/categories`)
        .then(r=>setCategories(r.data))
        .catch(console.error);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchPosts();
  }, [
    selectedAccounts,
    selectedTypes,
    selectedDays,
    selectedPlatforms,
    selectedTags,
    selectedCategories,
    selectedSubCategories,
    sortField,
    page,
    limit,
  ]);

  async function fetchPosts() {
    if (!user || !["admin","smm"].some(r=>user.roles.includes(r))) {
      setErrorMessage("Unauthorized");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const params: any = { page, limit };
      if (selectedAccounts.length)   params.accounts = selectedAccounts;
      if (selectedTypes.length)      params.types    = selectedTypes;
      if (selectedDays.length)       params.days     = selectedDays;
      if (selectedPlatforms.length)  params.platforms= selectedPlatforms;
      if (selectedTags.length)       params.tags     = selectedTags;
      if (selectedCategories.length) params.categories= selectedCategories;
      if (selectedSubCategories.length) params.sub_categories = selectedSubCategories;
      if (filterAccount) params.account          = filterAccount;
      if (filterType)    params.type             = filterType;
      if (filterDay)     params.day_of_the_week  = filterDay;
      if (sortField)     params.sort             = sortField;
      if (paramId)       params._id              = paramId;
      if (paramAccount && !selectedAccounts.length) params.account = paramAccount;
      if (paramTag && !selectedTags.length)         params.tags    = [paramTag];

      const resp = await axios.get(`${import.meta.env.VITE_BACKEND}/api/smmpost`, {
        params,
        headers:{ Authorization:`Bearer ${localStorage.getItem("token")}` }
      });
      setPosts(resp.data.smmPosts||[]);
      setTotal(resp.data.total||0);
    } catch(err:any){
      console.error(err);
      setErrorMessage(err.response?.data?.error||"Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  function openDetails(p:SmmPost){ setDetailModal(p) }
  function openEdit(p:SmmPost){
    setEditModal(p);
    setEditFields({ ...p });
  }

  async function handleUpdate(e:React.FormEvent){
    e.preventDefault();
    if(!editModal) return;
    await axios.put(
        `${import.meta.env.VITE_BACKEND}/api/smmpost/${editModal._id}`,
        editFields,
        { headers:{ Authorization:`Bearer ${localStorage.getItem("token")}` } }
    );
    fetchPosts();
    setEditModal(null);
  }

  function openMediaViewer(images:string[], clicked:string){
    setSelectedMedia([clicked, ...images.filter(i=>i!==clicked)]);
    setShowMediaViewer(true);
  }
  function closeMediaViewer(e:React.MouseEvent){
    if(e.target===e.currentTarget) setShowMediaViewer(false);
  }

  function handleSort(field:string){
    setSortField(sf=> sf===field ? `-${field}` : sf===`-${field}` ? field : field);
  }

  return (
      <>
        <Menu active="Rețele sociale"/>
        <Dashboard
            breadcrumb={[
              { label: "Admin" },
              { label: "Rețele sociale" },
              { label: "Dashboard" }
            ]}
            menu="social"
            active="Dashboard"
        >
          <div className={styles.smmListWrapper}>
            <Button onClick={()=>{
              if(!posts.length){ alert("No data"); return }
              const sheet = posts.map(p=>({
                ID:p._id,
                Account:p.account||"",
                Likes:p.likes||0,
                Shares:p.shares||0,
                Comments:p.comments||0,
                Date:p.date||"",
                DayOfWeek:p.day_of_the_week||"",
                Hour:p.hour||"",
                Type:p.type||"",
                Tags:p.tags?.join(", ")||"",
                Category:p.category||"",
                SubCategory:p.sub_category||"",
                Platform:p.platform||"",
                Link:p.link||"",
                Description:p.description||"",
                Sponsored:p.sponsored?"Yes":"No",
                Images:p.images||[]
              }));
              const ws = XLSX.utils.json_to_sheet(sheet);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb,ws,"SMM Posts");
              XLSX.writeFile(wb,"SMM_Posts.xlsx");
            }}>
              Export <Icon type="arrow_right"/>
            </Button>

            {errorMessage && <p style={{color:"red"}}>{errorMessage}</p>}
            <div className={styles.modifyers}>
              <div
                  className={styles.modifyers_btns}
                  onClick={() => setShowItemsSort((prev) => !prev)}
              >
                {/* Sort SVG */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      d="M4 18C3.71667 18 3.47934 17.904 3.288 17.712C3.09667 17.52 3.00067 17.2827 3 17C2.99934 16.7173 3.09534 16.48 3.288 16.288C3.48067 16.096 3.718 16 4 16H8C8.28334 16 8.521 16.096 8.713 16.288C8.905 16.48 9.00067 16.7173 9 17C8.99934 17.2827 8.90334 17.5203 8.712 17.713C8.52067 17.9057 8.28334 18.0013 8 18H4ZM4 13C3.71667 13 3.47934 12.904 3.288 12.712C3.09667 12.52 3.00067 12.2827 3 12C2.99934 11.7173 3.09534 11.48 3.288 11.288C3.48067 11.096 3.718 11 4 11H14C14.2833 11 14.521 11.096 14.713 11.288C14.905 11.48 15.0007 11.7173 15 12C14.9993 12.2827 14.9033 12.5203 14.712 12.713C14.5207 12.9057 14.2833 13.0013 14 13H4ZM4 8C3.71667 8 3.47934 7.904 3.288 7.712C3.09667 7.52 3.00067 7.28267 3 7C2.99934 6.71733 3.09534 6.48 3.288 6.288C3.48067 6.096 3.718 6 4 6H20C20.2833 6 20.521 6.096 20.713 6.288C20.905 6.48 21.0007 6.71733 21 7C20.9993 7.28267 20.9033 7.52033 20.712 7.713C20.5207 7.90567 20.2833 8.00133 20 8H4Z"
                      fill="#D9DFFF"
                  />
                </svg>
                Sort
              </div>
              <div
                  className={styles.modifyers_btns}
                  onClick={() => setShowItemsFilters((prev) => !prev)}
              >
                {/* Filter SVG */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      d="M12.4782 23.8104L12.4716 23.8057L12.4796 23.8053L12.4782 23.8104ZM12.4782 23.8104L12.4932 23.8144M12.4782 23.8104L12.482 23.8051L12.49 23.8047L12.4932 23.8144M12.4932 23.8144L12.5052 23.8104M12.4932 23.8144L12.4958 23.8048L12.5014 23.8051L12.5052 23.8104M12.5052 23.8104L12.5064 23.8096L12.5071 23.8054L12.5035 23.8052L12.5052 23.8104Z"
                      stroke="#D9DFFF"
                      strokeWidth="2"
                  />
                  <path
                      d="M19.707 7.29279L19.7069 7.29289L14.2929 12.7069L14 12.9998V13.414V20.838V20.8381C14 20.8552 13.9956 20.872 13.9873 20.8869C13.979 20.9017 13.9671 20.9143 13.9526 20.9232C13.9381 20.9322 13.9215 20.9373 13.9045 20.9381C13.8875 20.9388 13.8705 20.9352 13.8553 20.9276L13.8551 20.9275L10.1382 19.0696C10.1382 19.0696 10.1381 19.0695 10.1381 19.0695C10.0966 19.0488 10.0617 19.0169 10.0373 18.9774C10.0129 18.9379 10 18.8924 10 18.846C10 18.846 10 18.846 10 18.846V13.414V12.9998L9.70711 12.7069L4.29311 7.29289L4.293 7.29279C4.1055 7.10534 4.00011 6.85112 4 6.586C4 6.58593 4 6.58586 4 6.58579V4.5C4 4.36739 4.05268 4.24021 4.14645 4.14645C4.24021 4.05268 4.36739 4 4.5 4H19.5C19.6326 4 19.7598 4.05268 19.8536 4.14645C19.9473 4.24022 20 4.36739 20 4.5V6.58579C20 6.58586 20 6.58593 20 6.586C19.9999 6.85112 19.8945 7.10534 19.707 7.29279Z"
                      stroke="#D9DFFF"
                      strokeWidth="2"
                  />
                </svg>
                Filtru
              </div>
            </div>

            {showItemsSort && (
                <div className={styles.sorts}>
                  <Button onClick={()=>handleSort("likes")}>Likes</Button>
                  <Button onClick={()=>handleSort("shares")}>Shares</Button>
                  <Button onClick={()=>handleSort("comments")}>Comments</Button>
                  <Button onClick={()=>setSortField("")}>Reset</Button>
                </div>
            )}

            {showItemsFilters && (
                <div className={styles.filters}>
                  <div className={styles.filters_row}>
                    {/* Items per page */}
                    <div className={styles.filters_element}>
                      <label>Items per page:&nbsp;</label>
                      <select
                          className={styles.page_select}
                          value={limit}
                          onChange={(e) => {
                            setPage(1);
                            setLimit(Number(e.target.value));
                          }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    {/* Accounts filter */}
                    <div className={styles.filters_element}>
                      <label>Accounts:</label>
                      <select
                          className={styles.page_select}
                          value={tempAccount}
                          onChange={(e) => setTempAccount(e.target.value)}
                      >
                        <option value="">Select an Account</option>
                        {accounts.map((acc) => (
                            <option key={acc._id} value={acc.account_name}>
                              {acc.account_name}
                            </option>
                        ))}
                      </select>
                      <Button
                          onClick={() => {
                            if (tempAccount && !selectedAccounts.includes(tempAccount)) {
                              setSelectedAccounts([...selectedAccounts, tempAccount]);
                            }
                            setTempAccount("");
                          }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Types filter */}
                    <div className={styles.filters_element}>
                      <label>Types:</label>
                      <select
                          className={styles.page_select}
                          value={tempType}
                          onChange={(e) => setTempType(e.target.value)}
                      >
                        <option value="">Select a Type</option>
                        {types.map((t) => (
                            <option key={t._id} value={t.name}>
                              {t.name}
                            </option>
                        ))}
                      </select>
                      <Button
                          onClick={() => {
                            if (tempType && !selectedTypes.includes(tempType)) {
                              setSelectedTypes([...selectedTypes, tempType]);
                            }
                            setTempType("");
                          }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Days filter */}
                    <div className={styles.filters_element}>
                      <label>Days:</label>
                      <select
                          className={styles.page_select}
                          value={tempDay}
                          onChange={(e) => setTempDay(e.target.value)}
                      >
                        <option value="">Select a Day</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                      <Button
                          onClick={() => {
                            if (tempDay && !selectedDays.includes(tempDay)) {
                              setSelectedDays([...selectedDays, tempDay]);
                            }
                            setTempDay("");
                          }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Platforms filter */}
                    <div className={styles.filters_element}>
                      <label>Platforms:</label>
                      <select
                          className={styles.page_select}
                          value={tempPlatform}
                          onChange={(e) => setTempPlatform(e.target.value)}
                      >
                        <option value="">Select a Platform</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Twitter">Twitter</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube">YouTube</option>
                      </select>
                      <Button
                          onClick={() => {
                            if (tempPlatform && !selectedPlatforms.includes(tempPlatform)) {
                              setSelectedPlatforms([...selectedPlatforms, tempPlatform]);
                            }
                            setTempPlatform("");
                          }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Tags filter */}
                    <div className={styles.filters_element}>
                      <label>Tags:</label>
                      <select
                          className={styles.page_select}
                          value={tempTag}
                          onChange={(e) => setTempTag(e.target.value)}
                      >
                        <option value="">Select a Tag</option>
                        {posts
                            .flatMap((p) => p.tags || [])
                            .filter((tag, index, self) => self.indexOf(tag) === index)
                            .map((tag, index) => (
                                <option key={index} value={tag}>
                                  {tag}
                                </option>
                            ))}
                      </select>
                      <Button
                          onClick={() => {
                            if (tempTag && !selectedTags.includes(tempTag)) {
                              setSelectedTags([...selectedTags, tempTag]);
                            }
                            setTempTag("");
                          }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Categories filter */}
                    <div className={styles.filters_element}>
                      <label>Categories:</label>
                      <select
                          className={styles.page_select}
                          value={tempCategory}
                          onChange={(e) => setTempCategory(e.target.value)}
                      >
                        <option value="">Select a Category</option>
                        {posts
                            .flatMap((p) => p.category || [])
                            .filter((c, index, self) => self.indexOf(c) === index)
                            .map((category, index) => (
                                <option key={index} value={category}>
                                  {category}
                                </option>
                            ))}
                      </select>
                      <Button
                          onClick={() => {
                            if (tempCategory && !selectedCategories.includes(tempCategory)) {
                              setSelectedCategories([...selectedCategories, tempCategory]);
                            }
                            setTempCategory("");
                          }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Sub-Categories filter */}
                    <div className={styles.filters_element}>
                      <label>Sub-Categories:</label>
                      <select
                          className={styles.page_select}
                          value={tempSubCategory}
                          onChange={(e) => setTempSubCategory(e.target.value)}
                      >
                        <option value="">Select a Sub-Category</option>
                        {posts
                            .flatMap((p) => p.sub_category || [])
                            .filter((s, index, self) => self.indexOf(s) === index)
                            .map((subCategory, index) => (
                                <option key={index} value={subCategory}>
                                  {subCategory}
                                </option>
                            ))}
                      </select>
                      <Button
                          onClick={() => {
                            if (tempSubCategory && !selectedSubCategories.includes(tempSubCategory)) {
                              setSelectedSubCategories([...selectedSubCategories, tempSubCategory]);
                            }
                            setTempSubCategory("");
                          }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className={styles.filters_row} style={{ gap: "5px" }}>
                    <div className={styles.selectedFilters}>
                      {selectedAccounts.map((account) => (
                          <span
                              key={account}
                              className={styles.filterTag}
                              onClick={() =>
                                  setSelectedAccounts(selectedAccounts.filter((a) => a !== account))
                              }
                          >
                      {account}
                    </span>
                      ))}
                      {selectedTypes.map((type) => (
                          <span
                              key={type}
                              className={styles.filterTag}
                              onClick={() =>
                                  setSelectedTypes(selectedTypes.filter((t) => t !== type))
                              }
                          >
                      {type}
                    </span>
                      ))}
                      {selectedDays.map((day) => (
                          <span
                              key={day}
                              className={styles.filterTag}
                              onClick={() =>
                                  setSelectedDays(selectedDays.filter((d) => d !== day))
                              }
                          >
                      {day}
                    </span>
                      ))}
                      {selectedPlatforms.map((platform) => (
                          <span
                              key={platform}
                              className={styles.filterTag}
                              onClick={() =>
                                  setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
                              }
                          >
                      {platform}
                    </span>
                      ))}
                      {selectedTags.map((tag) => (
                          <span
                              key={tag}
                              className={styles.filterTag}
                              onClick={() =>
                                  setSelectedTags(selectedTags.filter((t) => t !== tag))
                              }
                          >
                      {tag}
                    </span>
                      ))}
                      {selectedCategories.map((category) => (
                          <span
                              key={category}
                              className={styles.filterTag}
                              onClick={() =>
                                  setSelectedCategories(selectedCategories.filter((c) => c !== category))
                              }
                          >
                      {category}
                    </span>
                      ))}
                      {selectedSubCategories.map((subCategory) => (
                          <span
                              key={subCategory}
                              className={styles.filterTag}
                              onClick={() =>
                                  setSelectedSubCategories(selectedSubCategories.filter((s) => s !== subCategory))
                              }
                          >
                      {subCategory}
                    </span>
                      ))}
                    </div>
                  </div>
                </div>
            )}

            {/* TABLE OF POSTS */}
            <div style={{opacity:0}}>
              <th>Account</th>
              <th>Likes</th>
              <th>Shares</th>
              <th>Comments</th>
              <th>Date</th>
              <th>Day</th>
              <th>Platform</th>
              <th>Type</th>
              <th>Actions</th>
            </div>


            {isLoading
                ? <div>Loading…</div>
                : !posts.length
                    ? <div>No data found.</div>
                    : posts.map(post=>(
                        <div className={styles.smmPostsTable_costume} key={post._id}>
                          <div className={styles.smmPostsTable_costume_left}>
                            <div className={styles.smmPostsTable_costume_platform}>
                              {post.platform==="Instagram"
                                  ? <Icon size="44px" type="instagram_smm"/>
                                  : <Icon size="44px" type="empty"/>}
                            </div>
                            <div
                                className={styles.smmPostsTable_costume_platform}
                                onClick={()=>post.images&&openMediaViewer(post.images,post.images[0])}
                            >
                              <img
                                  src={post.images?.[0]
                                      ? `${import.meta.env.VITE_BACKEND}${post.images[0]}`
                                      : "/fallback-image.jpg"}
                                  alt="media"
                                  className={styles.smmPostImage}
                              />
                            </div>
                            <div className={styles.smmPostsTable_costume_platform}>
                              {post.sponsored
                                  ? <div className={styles.smmPostsTable_costume_sponsored_active}>$</div>
                                  : <div className={styles.smmPostsTable_costume_sponsored}/>}
                            </div>
                            <div className={styles.smmPostsTable_costume_account}>{post.account}</div>
                            <div className={styles.smmPostsTable_costume_date}>
                      <span className={styles.smmPostsTable_costume_date_day}>
                        {post.day_of_the_week}
                      </span>
                              {post.date}
                              <span className={styles.smmPostsTable_costume_date_hour}>
                        {post.hour}
                      </span>
                            </div>
                            {[post.likes,post.shares,post.comments].map((n,i)=>(
                                <div
                                    key={i}
                                    className={styles.smmPostsTable_costume_stats}
                                    style={{ width: i===0?"80px":"65px" }}
                                >
                                  {n||0}
                                  {/* icon */}
                                </div>
                            ))}
                            <div className={styles.smmPostsTable_costume_type}>{post.type}</div>
                            <div className={styles.smmPostsTable_costume_tags}>
                              {post.tags?.map((t,i)=>(
                                  <div key={i} className={styles.smmPostTag}>{t}</div>
                              ))||<div className={styles.smmPostTagEmpty}/>}
                            </div>
                          </div>
                          <div className={styles.smmPostsTable_costume_right}>
                            <div
                                className={`${styles.smmPostsTable_costume_category} ${styles.smmPostsTable_costume_more}`}
                                onClick={()=>openDetails(post)}
                            >…</div>
                            <div className={styles.smmPostsTable_costume_category}>{post.category}</div>
                            <div className={styles.smmPostsTable_costume_category}>{post.sub_category}</div>
                            <Button to={post.link}><Icon type="links"/></Button>
                            <Button onClick={()=>openEdit(post)}><Icon type="edit"/></Button>
                          </div>
                        </div>
                    ))}

            <div className={styles.pagination}>
              <Button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page<=1}>&laquo; Prev</Button>
              <span>Page {page} of {totalPages||1}</span>
              <Button onClick={()=>setPage(p=>Math.min(p+1,totalPages))} disabled={page>=totalPages}>Next &raquo;</Button>
            </div>
          </div>
        </Dashboard>

        {showMediaViewer && (
            <div className={styles.see_images} onClick={closeMediaViewer}>
              <div className={styles.mediaContent}>
                {selectedMedia.map((m,i)=>(
                    <div key={i}><img src={`${import.meta.env.VITE_BACKEND}${m}`} alt="full"/></div>
                ))}
              </div>
            </div>
        )}

        {detailModal && (
            <div className={styles.modalOverlay} onClick={e=>e.target===e.currentTarget&&setDetailModal(null)}>
              <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={()=>setDetailModal(null)}>×</button>
                <h2>Post Details</h2>
                {Object.entries(detailModal).map(([k,v])=>(
                    <p key={k}><strong>{k.replace(/_/g," ")}</strong>:&nbsp;{Array.isArray(v)?v.join(", "):String(v)}</p>
                ))}
              </div>
            </div>
        )}

        {editModal && (
            <div className={styles.modalOverlay} onClick={e=>e.target===e.currentTarget&&setEditModal(null)}>
              <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={()=>setEditModal(null)}>×</button>
                <h2>Edit Post</h2>
                <form onSubmit={handleUpdate} className={addStyles.smmPostForm}>

                  <div className={addStyles.accounts_inputs}>
                    <label>Link</label>
                    <Input
                        type="text"
                        value={editFields.link||""}
                        onChange={e=>setEditFields(f=>({...f,link:e.target.value}))}
                    />
                  </div>

                  <div className={addStyles.accounts_inputs}>
                    <div className={addStyles.formGroup}>
                      <label>Platform</label>
                      <Input
                          type="text"
                          value={editFields.platform||""}
                          onChange={e=>setEditFields(f=>({...f,platform:e.target.value}))}
                      />
                    </div>
                    <div className={addStyles.formGroup}>
                      <label>Likes</label>
                      <Input
                          type="number"
                          value={editFields.likes==null?"":editFields.likes}
                          onChange={e=>setEditFields(f=>({...f,likes:Number(e.target.value)||0}))}
                      />
                    </div>
                    <div className={addStyles.formGroup}>
                      <label>Shares</label>
                      <Input
                          type="number"
                          value={editFields.shares==null?"":editFields.shares}
                          onChange={e=>setEditFields(f=>({...f,shares:Number(e.target.value)||0}))}
                      />
                    </div>
                    <div className={addStyles.formGroup}>
                      <label>Comments</label>
                      <Input
                          type="number"
                          value={editFields.comments==null?"":editFields.comments}
                          onChange={e=>setEditFields(f=>({...f,comments:Number(e.target.value)||0}))}
                      />
                    </div>
                    <div className={addStyles.formGroup}>
                      <label>Date</label>
                      <Input
                          type="date"
                          value={editFields.date||""}
                          onChange={e=>setEditFields(f=>({...f,date:e.target.value}))}
                      />
                    </div>
                    <div className={addStyles.formGroup}>
                      <label>Hour</label>
                      <Input
                          type="time"
                          value={editFields.hour||""}
                          onChange={e=>setEditFields(f=>({...f,hour:e.target.value}))}
                      />
                    </div>
                    <div className={addStyles.formGroup}>
                      <label>Day</label>
                      <select
                          value={editFields.day_of_the_week||""}
                          onChange={e=>setEditFields(f=>({...f,day_of_the_week:e.target.value}))}
                      >
                        <option value="">Select day</option>
                        {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map(d=>(
                            <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={`${addStyles.accounts_inputs} ${addStyles.accounts_inputs_bg}`}>
                    <div className={addStyles.formGroup}>
                      <label>Account</label>
                      <select
                          value={editFields.account||""}
                          onChange={e=>setEditFields(f=>({...f,account:e.target.value}))}
                      >
                        <option value="">Select Account</option>
                        {accounts.map(a=>(
                            <option key={a._id} value={a.account_name}>{a.account_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={addStyles.formGroup}>
                      <label>Type</label>
                      <select
                          value={editFields.type||""}
                          onChange={e=>setEditFields(f=>({...f,type:e.target.value}))}
                      >
                        <option value="">Select type</option>
                        {types.map(t=>(
                            <option key={t._id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={addStyles.formGroup}>
                      <label>Category</label>
                      <select
                          value={editFields.category||""}
                          onChange={e=>setEditFields(f=>({...f,category:e.target.value}))}
                      >
                        <option value="">Select category</option>
                        {categories.map(c=>(
                            <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={addStyles.formGroup}>
                      <label>Sub-category</label>
                      <select
                          value={editFields.sub_category||""}
                          onChange={e=>setEditFields(f=>({...f,sub_category:e.target.value}))}
                      >
                        <option value="">Select sub-category</option>
                        {categories.find(c=>c.name===editFields.category)?.subcategories.map(s=>(
                            <option key={s._id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={addStyles.selectTagContainer_block}>
                      <div className={addStyles.formGroup}>
                        <label>Tags</label>
                        <select
                            value={""}
                            onChange={e=>{
                              const arr = editFields.tags||[];
                              if(e.target.value && !arr.includes(e.target.value)){
                                setEditFields(f=>({...f,tags:[...arr,e.target.value]}));
                              }
                            }}
                        >
                          <option value="">Select a Tag</option>
                          {tags.map(t=>(
                              <option key={t._id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={addStyles.tagsContainer}>
                      <label>Sponsored</label>
                      <input
                          type="checkbox"
                          checked={!!editFields.sponsored}
                          onChange={e=>setEditFields(f=>({...f,sponsored:e.target.checked}))}
                      />
                    </div>
                  </div>

                  <div className={`${addStyles.formGroup} ${addStyles.formGroup_bg}`}>
                    <label>Images/Videos (links)</label>
                    <div className={addStyles.imagesItems}>
                      {(editFields.images||[]).map((url,i)=>(
                          <div key={i} className={addStyles.imageItem}>
                            <img src={`${import.meta.env.VITE_BACKEND}${url}`} className={addStyles.imageItem_img}/>
                            <span
                                className={addStyles.imageItem_img_btn}
                                onClick={()=>{
                                  setEditFields(f=>({
                                    ...f,
                                    images:(f.images||[]).filter(x=>x!==url)
                                  }));
                                }}
                            >delete</span>
                          </div>
                      ))}
                    </div>
                    <AddImageForm
                        onAddImage={url=>{
                          setEditFields(f=>({
                            ...f,
                            images:[...(f.images||[]),url]
                          }));
                        }}
                    />
                  </div>

                  <div className={`${addStyles.formGroup} ${addStyles.formGroup_bg}`}>
                    <label>Top Comments</label>
                    <div className={addStyles.topcomments_cards}>
                      {(editFields.topcomments||[]).map((tc,i)=>(
                          <div key={i} className={addStyles.commentItem}>
                            <Input
                                type="text"
                                placeholder="created_at"
                                value={tc.created_at}
                                onChange={e=>{
                                  const arr = editFields.topcomments||[];
                                  arr[i] = {...arr[i],created_at:e.target.value};
                                  setEditFields(f=>({...f,topcomments:arr}));
                                }}
                            />
                            <Input
                                type="text"
                                placeholder="owner"
                                value={tc.owner}
                                onChange={e=>{
                                  const arr = editFields.topcomments||[];
                                  arr[i] = {...arr[i],owner:e.target.value};
                                  setEditFields(f=>({...f,topcomments:arr}));
                                }}
                            />
                            <Input
                                type="text"
                                placeholder="text"
                                value={tc.text}
                                onChange={e=>{
                                  const arr = editFields.topcomments||[];
                                  arr[i] = {...arr[i],text:e.target.value};
                                  setEditFields(f=>({...f,topcomments:arr}));
                                }}
                            />
                            <Button
                                bgcolor="transparent"
                                border="#D9DFFF"
                                onClick={()=>{
                                  setEditFields(f=>({
                                    ...f,
                                    topcomments:(f.topcomments||[]).filter((_,ix)=>ix!==i)
                                  }));
                                }}
                            >Remove</Button>
                          </div>
                      ))}
                    </div>
                    <Button
                        bgcolor="transparent"
                        border="#D9DFFF"
                        onClick={()=>{
                          setEditFields(f=>({
                            ...f,
                            topcomments:[...(f.topcomments||[]),{created_at:"",owner:"",text:""}]
                          }));
                        }}
                    >+ Add Comment</Button>
                  </div>

                  <div className={`${addStyles.formGroup} ${addStyles.formGroup_bg}`}>
                    <label>Description</label>
                    <textarea
                        className={addStyles.descriptionTextarea}
                        value={editFields.description||""}
                        onChange={e=>setEditFields(f=>({...f,description:e.target.value}))}
                    />
                  </div>

                  <div style={{height:20}}/>
                  <Button type="submit">Save Post</Button>
                  <div style={{height:20}}/>
                </form>
              </div>
            </div>
        )}
      </>
  );
}

function AddImageForm({onAddImage}:{onAddImage:(url:string)=>void}) {
  const [tmp, setTmp] = useState("");
  return (
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <Input
            type="text"
            placeholder="https://example.com/img.jpg"
            value={tmp}
            onChange={e=>setTmp(e.target.value)}
        />
        <Button
            bgcolor="transparent"
            border="#D9DFFF"
            onClick={()=>{
              if(tmp.trim()){ onAddImage(tmp.trim()); setTmp("") }
            }}
        >Add</Button>
      </div>
  );
}
