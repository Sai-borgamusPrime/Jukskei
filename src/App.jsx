import { Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Splash2 from "./pages/Splash2";
import Splash3 from "./pages/Splash3";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Menu from "./pages/Menu";
import Shop from "./pages/Shop";

function Placeholder({ title }) {
  return <h1 style={{ padding: "2rem" }}>{title}</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/splash2" element={<Splash2 />} />
      <Route path="/splash3" element={<Splash3 />} />
      <Route path="/home" element={<Home />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/teams/:slug" element={<TeamDetails />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/scores" element={<Placeholder title="Scores" />} />
    </Routes>
  );
}

export default App;