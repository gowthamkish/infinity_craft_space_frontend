import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { FiLogOut } from "react-icons/fi";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand style={{ cursor: "pointer" }} onClick={() => navigate(user?.isAdmin ? "/admin/dashboard" : "/home")}>
          Infinity Craft Space
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link onClick={handleLogout} title="Logout">
            <FiLogOut size={20} style={{ verticalAlign: "middle" }} /> Logout
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;