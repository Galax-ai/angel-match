import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { QuizProvider } from './context/QuizContext';
import Landing from './pages/Landing';
import Match from './pages/Match';
import Results from './pages/Results';
import TherapistProfile from './pages/TherapistProfile';
import Providers from './pages/Providers';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      {/* Quiz answers live in memory for the session only — see QuizContext. */}
      <QuizProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/match" element={<Match />} />
            <Route path="/match/results" element={<Results />} />
            <Route path="/therapist/:id" element={<TherapistProfile />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </QuizProvider>
    </BrowserRouter>
  );
}
