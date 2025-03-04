import Container from "../ui/Container";
import {useNavigate } from "react-router"
import { Logo } from "../UI/Logo";

export default function AdminHeader() {

    const logout =()=>{

    }
    const navigate = useNavigate();

    async function handleLogout(){
        const res = await logout();
        if(!res){
            navigate("/auth/login");
        }
    }
    return (
        <header className="w-[100vw] ">
            <Container classes={"border-0 rounded-none px-5 py-4 flex justify-between items-center !bg-inherit"}>
                <div className="flex flex-row items-center gap-4">
                    <Logo size={35} />
                    <h1 className="text-[2rem] font-medium stretched">Ticket--</h1>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            </Container>
        </header>
    );
}
