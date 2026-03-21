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

function isValidIcalUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      (url.includes("avenue.mcmaster.ca") ||
        url.includes(".ics") ||
        url.includes("calendar/feed") ||
        url.includes("calendar/ical"))
    );
  } catch {
    return false;
  }
}

export default function SetupScreen({ onPlan }) {
  const saved = loadConnections();

  const [a2lUrl, setA2lUrl] = useState(saved.a2lUrl || "");
  const [a2lEditing, setA2lEditing] = useState(!saved.a2lUrl);
  const [a2lError, setA2lError] = useState("");
  const [outlookUrl, setOutlookUrl] = useState(saved.outlookUrl || "");
  const [extraTasks, setExtraTasks] = useState(loadExtra());

  const a2lConnected = Boolean(a2lUrl && !a2lEditing);
  const googleConnected = true;

  function handleA2lChange() {
    if (!a2lEditing) {
      setA2lEditing(true);
      setA2lError("");
    } else {
      const trimmed = a2lUrl.trim();
      if (!trimmed) {
        setA2lError("URL cannot be empty.");
        return;
      }
      if (!isValidIcalUrl(trimmed)) {
        setA2lError("Must be a valid iCal URL from avenue.mcmaster.ca");
        return;
      }
      setA2lError("");
      saveConnections({ ...loadConnections(), a2lUrl: trimmed });
      setA2lEditing(false);
    }
  }

  function handlePlan() {
    if (!a2lConnected) return;
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
          {a2lError && (
            <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>
              {a2lError}
            </p>
          )}
        </ConnectionCard>

        <ConnectionCard
          icon="📧"
          title="Outlook / Email"
          subtitle="Microsoft 365 iCal feed"
          connected={Boolean(outlookUrl)}
        >
          <button
            className="btn-microsoft"
            onClick={() =>
              window.open(
                "https://outlook.live.com/calendar/0/options/calendar/SharedCalendars",
                "_blank"
              )
            }
          >
            <span className="microsoft-logo" aria-hidden="true">
              <span className="ms-red" />
              <span className="ms-green" />
              <span className="ms-blue" />
              <span className="ms-yellow" />
            </span>
            Get Outlook iCal URL
          </button>
          <div className="divider-row">then paste it here</div>
          <input
            className="url-input full-width"
            type="url"
            value={outlookUrl}
            onChange={(e) => setOutlookUrl(e.target.value)}
            placeholder="https://outlook.live.com/owa/calendar/..."
          />
        </ConnectionCard>

        <ConnectionCard
          icon="📅"
          title="Google Calendar"
          subtitle="via MCP connection"
          connected={googleConnected}
        />
      </div>

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

      <button
        className="btn-plan"
        onClick={handlePlan}
        disabled={!a2lConnected}
        style={{
          opacity: a2lConnected ? 1 : 0.4,
          cursor: a2lConnected ? "pointer" : "not-allowed",
        }}
      >
        Plan my day →
      </button>

      {!a2lConnected && (
        <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 8 }}>
          Paste and save your A2L iCal URL to continue
        </p>
      )}
    </div>
  );
}