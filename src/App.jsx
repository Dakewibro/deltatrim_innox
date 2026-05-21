import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Debrief from './pages/Debrief'
import TrimPlus from './pages/TrimPlus'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/debrief" element={<Debrief />} />
          <Route path="/trim-plus" element={<TrimPlus />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App