import { Github } from "lucide-react";
function LoginButton(){
    return(
        <div className="w-[194px] h-10 bg-[#232934] flex justify-center">
            <Github />
            <a href="http://localhost:3030/api/auth/github">GitHub</a>
        </div>
    )
}

export default LoginButton;