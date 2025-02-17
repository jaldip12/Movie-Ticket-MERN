import { useEffect, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";

export default function AdminLayout() {
    const { handlePingAdmin } = useContext(AdminContext);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAdmin = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            try {
                const isValid = await handlePingAdmin();
                if (!isValid) {
                    navigate('/admin/login');
                }
            } catch (error) {
                console.error("Admin verification failed:", error);
                navigate('/admin/login');
            }
        };

        verifyAdmin();
    }, [handlePingAdmin, navigate]);

    return <Outlet />;
}