import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import Hero from "./components/Hero";

function HomePage(){
  return (
    <>
      <Hero/>
      <section className="section">
        <div className="container">
          <h2 className="text-2xl font-semibold">Featured Programs</h2>
          <p className="mt-2 text-slate-600">Healthcare • Construction • Beauty • Business • Tech</p>
        </div>
      </section>
    </>
  );
}

function SimplePage({ title }: { title: string }) {
  return (
    <section className="section">
      <div className="container">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-600">Content coming online.</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<SimplePage title="Programs" />} />
          <Route path="/lms" element={<SimplePage title="LMS" />} />
          <Route path="/partners" element={<SimplePage title="Partners" />} />
          <Route path="/apply" element={<SimplePage title="Apply Now" />} />
          <Route path="*" element={<SimplePage title="Not Found" />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}
