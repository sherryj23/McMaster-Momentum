import SetupScreen from './components/SetupScreen'

function App() {
  function handlePlan(data) {
    console.log('Planning day with:', data)
  }

  return <SetupScreen onPlan={handlePlan} />
}

export default App
