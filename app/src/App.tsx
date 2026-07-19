import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Detail from "./pages/Detail";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:id" element={<Detail />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}
