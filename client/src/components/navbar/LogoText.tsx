import { useNavigate } from "react-router-dom"

const LogoText = () => {
    const navigate = useNavigate();
    return (
        <div onClick={()=> navigate('/')} className="text-2xl font-semibold bg-gradient-to-r from-primary capitalize to-primary/60 bg-clip-text text-transparent cursor-pointer">Estellle</div>
    )
}

export default LogoText