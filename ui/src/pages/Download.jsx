import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Download = () => {
  const ipcRenderer = window.ipcRenderer;
  const [username, setUsername] = useState("");
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const logsEndRef = useRef(null);
  const [cookie, setCookie] = useState("");

  const handleTiktokInfoChange = (value) => {
    setUsername(value);
  };
  const handleCookieChange = (value) => {
    setCookie(value);
  };

  const handleStart = () => {
    ipcRenderer.send("start-download", { username, cookie });
    ipcRenderer.on("start-download", (event, data) => {
      setLogs((prevLogs) => [...prevLogs, data.msg]);
    });
  };

  const handleStopProcess = () => {
    ipcRenderer.send("stop-process", {});
    ipcRenderer.on("stop-process", (event, data) => {
      console.log(data);
    });
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="container mx-auto h-screen p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className="rounded bg-red-600 px-4 py-2 font-medium text-white"
            onClick={handleStopProcess}
          >
            Stop
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 font-medium text-white"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
        <button className="bg-blue-500 text-white rounded py-2 px-4 text-md" onClick={() => navigate("/up-live")}>Up Live</button>
      </div>

      <div className="rounded border p-4 shadow">
        {/* input for cookie */}
        <div className="mb-4">
          <label htmlFor="cookie" className="mb-2 block font-bold">
            Cookie
          </label>
          <input
            type="text"
            id="cookie"
            value={cookie}
            onChange={(e) => handleCookieChange(e.target.value)}
            className="mb-2 w-full border p-2"
          />
        </div>

        {/* input for username */}
        <div className="mb-4">
          <label htmlFor="username" className="mb-2 block font-bold">
            TikTok Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => handleTiktokInfoChange(e.target.value)}
            className="mb-2 w-full border p-2"
          />
        </div>

        {/* show logs */}
        <div className="h-96 overflow-y-auto bg-gray-100 p-2">
          <h3 className="mb-2 font-bold">Logs:</h3>
          {logs.length > 0 ? (
            <ul>
              {logs.map((log, i) => (
                <li key={i} className="text-sm">
                  {log}
                </li>
              ))}
              <div ref={logsEndRef} />
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No logs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Download;
