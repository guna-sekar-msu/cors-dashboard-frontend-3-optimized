import { useState } from 'react'
import './App.css'
import ParentFeature from "./components/ParentFeature";
import { GeojsonProvider } from "./context/GeojsonProvider"; // Import Provider

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
        <GeojsonProvider>
          <ParentFeature /> {/* Use ParentFeature to encapsulate the feature-specific components */}
        </GeojsonProvider>
      </div>
    </>
  )
}

export default App
