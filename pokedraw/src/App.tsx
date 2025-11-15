import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CreateGamePage from "./pages/CreateGamePage";
import DrawPage from "./pages/DrawPage";
import ResultsPage from "./pages/ResultsPage";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateGamePage />} />
        <Route path="/draw/:roomId" element={<DrawPage />} />
        <Route path="/results/:roomId" element={<ResultsPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
