import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export function LandingPage(){
  
  const navig = useNavigate();

  const {token} = useAuth();

    return(
      <div>      
      <LoginButton navigate = {navig}/>
      <SignupButton navigate = {navig}/>
      <CreateCommunity navigate = {navig} token={token}/>
      </div>
    );
}
 
function LoginButton({navigate}){
    
    return <button onClick={() => navigate("/login")} >Login</button>
}
function SignupButton({navigate}){
    
    return <button onClick={() => navigate("/signup")} >Signup</button>
}
function CreateCommunity({navigate, token}){
      return token ? (< button onClick={() => navigate("/createCommunity")} >Create Community</button>) : null

}