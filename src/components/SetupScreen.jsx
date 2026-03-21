import { useState } from "react";
import ConnectionCard from "./ConnectionCard";
import {
  saveConnections,
  loadConnections,
  saveExtra,
  loadExtra,
} from "../lib/storage";
import "./SetupScreen.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function SetupScreen({ onPlan }) {
  const saved = loadConnections();

  const [a2lUrl, setA2lUrl] = useState(saved.a2lUrl || "");
  const [a2lEditing, setA2lEditing] = useState(!saved.a2lUrl);
  const [outlookUrl, setOutlookUrl] = useState(saved.outlookUrl || "");
  const [extraTasks, setExtraTasks] = useState(loadExtra());

  const a2lConnected = Boolean(a2lUrl && !a2lEditing);
  // Google Calendar connected via MCP — static for setup screen
  const googleConnected = true;

  function handleA2lChange() {
    if (!a2lEditing) {
      setA2lEditing(true);
    } else if (a2lUrl.trim()) {
      saveConnections({ ...loadConnections(), a2lUrl: a2lUrl.trim() });
      setA2lEditing(false);
    }
  }

  function handlePlan() {
    saveConnections({ ...loadConnections(), outlookUrl: outlookUrl.trim() });
    saveExtra(extraTasks);
    onPlan?.({ a2lUrl, outlookUrl, extraTasks });
  }

  return (
    <div className="setup-screen">
      <div className="setup-greeting">
        <h1>{getGreeting()}.</h1>
        <p>Connect your sources and I'll plan your day.</p>
      </div>

      <div className="connection-cards">
        {/* Avenue to Learn */}
        <ConnectionCard
          icon="🎓"
          title="Avenue to Learn"
          subtitle="McMaster A2L iCal feed"
          connected={a2lConnected}
        >
          <div className="url-row">
            <input
              className="url-input"
              type="url"
              value={a2lUrl}
              onChange={(e) => setA2lUrl(e.target.value)}
              readOnly={!a2lEditing}
              placeholder="https://avenue.mcmaster.ca/d2l/le/calendar/feed/..."
            />
            <button className="btn-change" onClick={handleA2lChange}>
              {a2lEditing ? "save" : "change"}
            </button>
          </div>
        </ConnectionCard>

        {/* Outlook / Email */}
        <ConnectionCard
          icon="📧"
          title="Outlook / Email"
          subtitle="Microsoft 365 or paste credentials"
          connected={Boolean(outlookUrl)}
        >
          <button className="btn-microsoft">
            <span className="microsoft-logo" aria-hidden="true">
              <span className="ms-red" />
              <span className="ms-green" />
              <span className="ms-blue" />
              <span className="ms-yellow" />
            </span>
            Sign in with Microsoft
          </button>
          <div className="divider-row">or paste iCal URL</div>
          <input
            className="url-input full-width"
            type="url"
            value={outlookUrl}
            onChange={(e) => setOutlookUrl(e.target.value)}
            placeholder="https://outlook.live.com/owa/calendar/..."
          />
        </ConnectionCard>

        {/* Google Calendar */}
        <ConnectionCard
          icon="📅"
          title="Google Calendar"
          subtitle="via MCP connection"
          connected={googleConnected}
        />
      </div>

      {/* Extra tasks */}
      <div className="extra-card">
        <label htmlFor="extra-tasks">Anything else on your plate today?</label>
        <textarea
          id="extra-tasks"
          className="extra-textarea"
          value={extraTasks}
          onChange={(e) => setExtraTasks(e.target.value)}
          placeholder="e.g. gym at 6pm, call mom, pick up groceries..."
        />
      </div>

      <button className="btn-plan" onClick={handlePlan}>
        Plan my day →
      </button>
    </div>
  );
}
