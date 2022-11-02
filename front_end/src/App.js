import "./App.css";
import Form from "./components/Form";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Project from "./pages/ProejctPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Nav>
                <Home />
              </Nav>
            }
          />
          <Route
            path="/submit"
            element={
              <Nav>
                <Form />
              </Nav>
            }
          />
          <Route
            path="/project"
            element={
              <Nav>
                <Project />
              </Nav>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
