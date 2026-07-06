import { useNavigate } from "react-router-dom";

export function LandingPage(){
  const navig = useNavigate();
    return(
      <div>      
      <LoginButton navigate = {navig}/>
      <SignupButton navigate = {navig}/>
      <CreateCommunity navigate = {navig}/>
      </div>
    );
}
 
function LoginButton({navigate}){
    
    return <button onClick={() => navigate("/login")} >Login</button>
}
function SignupButton({navigate}){
    
    return <button onClick={() => navigate("/signup")} >Signup</button>
}
function CreateCommunity({navigate}){
      return <button onClick={() => navigate("/createCommunity")} >Create Community</button>

}