import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WorldsDashboard from "./pages/WorldsDashboard";
import WorldCreator from "./pages/WorldCreator";
import WorldDetail from "./pages/WorldDetail";
import CharacterCreator from "./pages/CharacterCreator";
import NarrativePlay from "./pages/NarrativePlay";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/worlds" replace />} />
        <Route path="/worlds" element={<WorldsDashboard />} />
        <Route path="/create-world" element={<WorldCreator />} />
        <Route path="/worlds/:id" element={<WorldDetail />} />
        <Route path="/create-character/:worldId" element={<CharacterCreator />} />
        <Route path="/play/narrative/:worldId/:characterId" element={<NarrativePlay />} />
        <Route path="*" element={<Navigate to="/worlds" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
