import { useContext } from "react"
import { UserContext } from "../../context/UserContext"
import toast from "react-hot-toast";
import Button from "./Buttons";
import { PiPower } from "react-icons/pi";
import { useNavigate } from "react-router";

export default function Logout(){

    const { logout } = useContext(UserContext);
    const navigate = useNavigate();

    async function handleLogout(){
        const res = await logout();
        if(res){
            toast.success("Logged out successfully");
            navigate("/login");
        }
    }

    return (
        <Button
            type="DANGER"
            onClick={handleLogout}
            extraClasses={"flex justify-center items-center"}
        >
            <PiPower className="inline-block text-xl mt-[-4px] mr-1" />
            Logout
        </Button>
    )
}