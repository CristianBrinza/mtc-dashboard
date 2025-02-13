import './App.css';
import Home from "./pages/Home/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Unauthorized from "./components/Unauthorized.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";
import Login from "./pages/Login/Login.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import SMM from "./pages/SMM/SMM.tsx";
import Categories from "./pages/Categories/Categories.tsx";
import Accounts from "./pages/Accounts/Accounts.tsx";
import SmmStatistics from "./pages/SmmStatistics/SmmStatistics.tsx";
import SmmAdd from "./pages/SmmAdd/SmmAdd.tsx";
import ProfileEdit from "./pages/Profile/ProfileEdit.tsx";

function App() {
    return (
        <AuthProvider>
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route
                    path="/retele-sociale"
                    element={
                        <ProtectedRoute roles={['smm', 'admin', 'manager']}>
                            <SMM/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/edit"
                    element={
                        <ProtectedRoute roles={['smm', 'admin', 'manager']}>
                            <ProfileEdit/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/retele-sociale/categories"
                    element={
                        <ProtectedRoute roles={['smm', 'admin']}>
                            <Categories/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/retele-sociale/accounts"
                    element={
                        <ProtectedRoute roles={['smm', 'admin']}>
                            <Accounts/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/retele-sociale/statistics"
                    element={
                        <ProtectedRoute roles={['smm', 'admin']}>
                            <SmmStatistics/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/retele-sociale/add"
                    element={
                        <ProtectedRoute roles={['smm', 'admin']}>
                            <SmmAdd/>
                        </ProtectedRoute>
                    }
                />



                <Route path="/*" element={<NotFound />} />
            </Routes>
        </Router>
        </AuthProvider>
    );
}

export default App;
