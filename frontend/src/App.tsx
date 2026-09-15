import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Workspace from "./pages/Workspace";
import { AuthProvider } from "./context/AuthContext";
import AppToast from "./components/AppToast";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
            <AppToast />

            <Routes>

                <Route path="/login" element={<Login />} />

                <Route path="/signup" element={<Signup />} />

                <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />

                <Route path="/workspace/:module" element={ <ProtectedRoute> <Workspace /> </ProtectedRoute> } />

                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;