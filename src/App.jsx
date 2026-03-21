import { useState } from 'react'
import SetupScreen from './components/SetupScreen'
import AgentStatus from './components/AgentStatus'
import DayPlan from './components/DayPlan'

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [planData, setPlanData] = useState(null)
  const [setupData, setSetupData] = useState(null)

  function handlePlan(data) {
    setSetupData(data)
    setScreen('running')
  }

  function handleComplete(dayPlan) {
    setPlanData(dayPlan)
    setScreen('results')
  }

  function handleReset() {
    setPlanData(null)
    setSetupData(null)
    setScreen('setup')
  }

  if (screen === 'setup') {
    return <SetupScreen onPlan={handlePlan} />
  }

  if (screen === 'running') {
    return <AgentStatus setupData={setupData} onComplete={handleComplete} />
  }

  if (screen === 'results') {
    return <DayPlan plan={planData} onReset={handleReset} />
  }
}