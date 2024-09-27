import React, { useEffect, useState, useContext } from "react";
import notifyContext from "../contexts/notifyContext";
import { useNavigate } from "react-router-dom";

const Download = () => {
  const ipcRenderer = window.ipcRenderer;
  const [username, setUsername] = useState("");
  const [logs, setLogs] = useState([]);
  const { show } = useContext(notifyContext);
  const navigate = useNavigate();

  const handleTiktokInfoChange = (value) => {
    setUsername(value);
  };

  const handleGetTiktokInfo = () => {
    ipcRenderer.send("get-tiktok-info", {});
    ipcRenderer.on("get-tiktok-info", (event, data) => {
      if (data.username) {
        setUsername(data.username);
      }
    });
  };

  const handleStart = () => {
    ipcRenderer.send("start-download", { username });
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
    handleGetTiktokInfo();
  }, []);

  return (
    <div className="container mx-auto p-4">
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
      </div>

      <div className="rounded border p-4 shadow">
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
        <div className="h-40 overflow-auto bg-gray-100 p-2">
          <h3 className="mb-2 font-bold">Logs:</h3>
          {logs.length > 0 ? (
            <ul>
              {logs.map((log, i) => (
                <li key={i} className="text-sm">
                  {log}
                </li>
              ))}
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
