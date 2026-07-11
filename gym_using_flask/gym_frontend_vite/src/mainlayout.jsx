import { Outlet } from "react-router-dom";
import NavBar from "./componants/navbar.jsx";
import Footer from "./componants/footer.jsx";

export default function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />

      <main className="flex-grow-1" style={{ paddingTop: "30px" }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}