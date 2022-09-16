import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const UnAuthenticatedGuard = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to='/login' />
    }

    return children ? children : <Outlet />
}
