import { useAuth } from "../../auth/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

export function Header() {
  const { token, logout } = useAuth();

  const navig = useNavigate();

  if (token) {
    return (
      <div>
        <WebsiteLogo navig={navig} />
        <LogoutButton navig={navig} logout={logout} />
        <CreateCommunityButton navig={navig} />
        <CreatePostButton navig={navig} />

        <main>
          <Outlet />
        </main>
      </div>
    );
  } else {
    return (
      <div>
        <WebsiteLogo navig={navig} />
        <LoginButton navig={navig} />
        <SignupButton navig={navig} />
        <main>
          <Outlet />
        </main>
      </div>
    );
  }
}

//takes you to feed (landing page)
function WebsiteLogo({ navig }) {
  return <p>ChessIT</p>;
}

function LogoutButton({ navig, logout }) {
  return (
    <button
      onClick={() => {
        logout();
        navig("/");
      }}
    >
      Logout
    </button>
  );
}

function LoginButton({ navig }) {
  return <button onClick={() => navig("/login")}>Login</button>;
}

function SignupButton({ navig }) {
  return <button onClick={() => navig("/signup")}>Signup</button>;
}

function CreateCommunityButton({ navig }) {
  return (
    <button onClick={() => navig("/createCommunity")}>Create Community</button>
  );
}

function CreatePostButton({ navig }) {
  const location = useLocation();

  const excludedPath = ["/showSpecificCommunity", "/createPost"];
  if (excludedPath.includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() =>
        navig("/createPost", {
          state: {
            specificCommunity: false,
            community_id: ""
          },
        })
      }
    >
      create post
    </button>
  );
}
