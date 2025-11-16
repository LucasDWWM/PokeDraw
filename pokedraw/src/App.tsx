import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CreateGamePage from "./pages/CreateGamePage";
import DrawPage from "./pages/DrawPage";
import ResultsPage from "./pages/ResultsPage";
import PokedexPage from "./pages/PokedexPage";
import HowToPlayPage from "./pages/HowToPlayPage";
import AboutPage from "./pages/AboutPage";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateGamePage />} />
        <Route path="/draw/:roomId" element={<DrawPage />} />
        <Route path="/results/:roomId" element={<ResultsPage />} />
        <Route path="/pokedex" element={<PokedexPage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
