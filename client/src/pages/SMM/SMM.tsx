import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import Icon from "../../components/Icon.tsx";
import Button from "../../components/Button.tsx";
import Input from "../../components/input/Input.tsx";
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


  // for edit modal tag dropdown
  const [editTempTag, setEditTempTag] = useState<string>("");


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
                            <div
                                className={styles.smmPostsTable_costume_stats}
                                style={{ width: "80px" }}
                            >
                              {post.likes ?? 0}&nbsp;
                              <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_8521_3479)">
                                  <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M4.40987 12.9611C4.74589 13.1215 5.11351 13.2049 5.48588 13.2051H10.8319C11.428 13.205 12.0045 12.992 12.4574 12.6044C12.9103 12.2168 13.2098 11.68 13.3019 11.0911L13.9279 7.08805C13.9727 6.80267 13.9551 6.51097 13.8764 6.23303C13.7976 5.95509 13.6596 5.6975 13.4719 5.47799C13.2841 5.25847 13.051 5.08224 12.7886 4.96141C12.5262 4.84058 12.2407 4.77803 11.9519 4.77805H8.66988V2.42205C8.67035 2.06212 8.55131 1.71222 8.33143 1.42725C8.11156 1.14228 7.8033 0.938379 7.45502 0.847534C7.10674 0.756688 6.73816 0.784044 6.40711 0.925307C6.07605 1.06657 5.80127 1.31375 5.62587 1.62805L3.54888 5.33805C3.42355 5.56202 3.35779 5.8144 3.35788 6.07105V11.5131C3.35783 11.7964 3.43802 12.0739 3.58915 12.3135C3.74029 12.5531 3.95619 12.745 4.21187 12.8671L4.41188 12.9621L4.40987 12.9611ZM1.04388 5.52105C0.912994 5.52092 0.783371 5.54659 0.662415 5.59658C0.541459 5.64658 0.431543 5.71992 0.33895 5.81242C0.246357 5.90492 0.172903 6.01476 0.122787 6.13567C0.0726703 6.25657 0.0468749 6.38617 0.046875 6.51705V11.6291C0.046875 11.8935 0.151916 12.1471 0.33889 12.334C0.525863 12.521 0.779454 12.6261 1.04388 12.6261H1.53987C1.67248 12.6261 1.79966 12.5734 1.89343 12.4796C1.9872 12.3858 2.03987 12.2587 2.03987 12.1261V6.02005C2.03987 5.88744 1.9872 5.76027 1.89343 5.6665C1.79966 5.57273 1.67248 5.52005 1.53987 5.52005L1.04388 5.52105Z"
                                      fill="#D9DFFF"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_8521_3479">
                                    <rect width="14" height="14" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </div>
                            <div
                                className={styles.smmPostsTable_costume_stats}
                                style={{ width: "65px" }}
                            >
                              {post.shares ?? 0} &nbsp;
                              <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                    d="M8 14C9.18669 14 10.3467 13.6481 11.3334 12.9888C12.3201 12.3295 13.0892 11.3925 13.5433 10.2961C13.9974 9.19975 14.1162 7.99335 13.8847 6.82946C13.6532 5.66558 13.0818 4.59648 12.2426 3.75736C11.4035 2.91825 10.3344 2.3468 9.17054 2.11529C8.00666 1.88378 6.80026 2.0026 5.7039 2.45673C4.60754 2.91085 3.67047 3.67989 3.01118 4.66658C2.35189 5.65328 2 6.81331 2 8C2 8.992 2.24 9.92734 2.66667 10.7513L2 14L5.24867 13.3333C6.07267 13.76 7.00867 14 8 14Z"
                                    stroke="#D9DFFF"
                                    strokeWidth="1.66667"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div
                                className={styles.smmPostsTable_costume_stats}
                                style={{ width: "65px" }}
                            >
                              {post.comments ?? 0} &nbsp;
                              <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                    d="M12 10.7197C11.4933 10.7197 11.04 10.9197 10.6933 11.233L5.94 8.46634C5.97333 8.31301 6 8.15967 6 7.99967C6 7.83967 5.97333 7.68634 5.94 7.53301L10.64 4.79301C11 5.12634 11.4733 5.33301 12 5.33301C13.1067 5.33301 14 4.43967 14 3.33301C14 2.22634 13.1067 1.33301 12 1.33301C10.8933 1.33301 10 2.22634 10 3.33301C10 3.49301 10.0267 3.64634 10.06 3.79967L5.36 6.53967C5 6.20634 4.52667 5.99967 4 5.99967C2.89333 5.99967 2 6.89301 2 7.99967C2 9.10634 2.89333 9.99967 4 9.99967C4.52667 9.99967 5 9.79301 5.36 9.45967L10.1067 12.233C10.0733 12.373 10.0533 12.5197 10.0533 12.6663C10.0533 13.7397 10.9267 14.613 12 14.613C13.0733 14.613 13.9467 13.7397 13.9467 12.6663C13.9467 11.593 13.0733 10.7197 12 10.7197Z"
                                    fill="#D9DFFF"
                                />
                              </svg>
                            </div>
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
                            >
                              <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M12 17.25C12.2298 17.25 12.4574 17.2953 12.6697 17.3832C12.882 17.4712 13.0749 17.6001 13.2374 17.7626C13.3999 17.9251 13.5288 18.118 13.6168 18.3303C13.7047 18.5426 13.75 18.7702 13.75 19C13.75 19.2298 13.7047 19.4574 13.6168 19.6697C13.5288 19.882 13.3999 20.0749 13.2374 20.2374C13.0749 20.3999 12.882 20.5288 12.6697 20.6168C12.4574 20.7047 12.2298 20.75 12 20.75C11.5359 20.75 11.0908 20.5656 10.7626 20.2374C10.4344 19.9092 10.25 19.4641 10.25 19C10.25 18.5359 10.4344 18.0908 10.7626 17.7626C11.0908 17.4344 11.5359 17.25 12 17.25ZM10.25 12C10.25 11.5359 10.4344 11.0908 10.7626 10.7626C11.0908 10.4344 11.5359 10.25 12 10.25C12.4641 10.25 12.9092 10.4344 13.2374 10.7626C13.5656 11.0908 13.75 11.5359 13.75 12C13.75 12.4641 13.5656 12.9092 13.2374 13.2374C12.9092 13.5656 12.4641 13.75 12 13.75C11.5359 13.75 11.0908 13.5656 10.7626 13.2374C10.4344 12.9092 10.25 12.4641 10.25 12ZM10.25 5C10.25 4.53587 10.4344 4.09075 10.7626 3.76256C11.0908 3.43438 11.5359 3.25 12 3.25C12.4641 3.25 12.9092 3.43438 13.2374 3.76256C13.5656 4.09075 13.75 4.53587 13.75 5C13.75 5.46413 13.5656 5.90925 13.2374 6.23744C12.9092 6.56563 12.4641 6.75 12 6.75C11.5359 6.75 11.0908 6.56563 10.7626 6.23744C10.4344 5.90925 10.25 5.46413 10.25 5Z"
                                    fill="#212A55"
                                />
                              </svg>
                            </div>
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
                      {/* dropdown */}
                      <div className={addStyles.selectTagContainer}>
                        <div className={addStyles.formGroup}>
                          <label>Tags</label>
                          <select
                              value={editTempTag}
                              onChange={e => setEditTempTag(e.target.value)}
                          >
                            <option value="">Select a Tag</option>
                            {tags.map(t => (
                                <option key={t._id} value={t.name}>
                                  {t.name}
                                </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* add button */}
                      <div className={addStyles.formGroup}>
                        <label>&nbsp;</label>
                        <Button
                            onClick={() => {
                              if (!editTempTag) return;
                              const arr = editFields.tags || [];
                              if (!arr.includes(editTempTag)) {
                                setEditFields(f => ({ ...f, tags: [...arr, editTempTag] }));
                              }
                              setEditTempTag("");
                            }}
                        >
                          Add
                        </Button>
                      </div>
                      {/* show selected tags */}
                      <div className={addStyles.tagsContainer}>
                        {(editFields.tags || []).map(tag => (
                            <div key={tag} className={addStyles.selectedTag}>
        <span>
          {tag}{" "}
          <span
              className={addStyles.selectedTagX}
              onClick={() =>
                  setEditFields(f => ({
                    ...f,
                    tags: (f.tags || []).filter(t => t !== tag),
                  }))
              }
          >
            x
          </span>
        </span>
                            </div>
                        ))}
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
