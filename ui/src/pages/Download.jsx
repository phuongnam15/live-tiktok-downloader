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
    <div className="flex flex-col justify-center px-10 mx-auto h-screen dark:bg-gray-900 dark:text-white">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className="rounded bg-red-600 px-4 py-1.5 font-medium text-white dark:bg-red-500 dark:hover:bg-red-400"
            onClick={handleStopProcess}
          >
            Stop
          </button>
          <button
            className="rounded bg-green-600 px-4 py-1.5 font-medium text-white dark:bg-green-500 dark:hover:bg-green-400"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
        <button
          className="text-md rounded bg-blue-500 px-4 py-1.5 text-white dark:bg-blue-500 dark:hover:bg-blue-400"
          onClick={() => navigate("/up-live")}
        >
          Up Live
        </button>
      </div>

      <div className="rounded border p-4 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2">
          <input
            type="text"
            id="cookie"
            value={cookie}
            onChange={(e) => handleCookieChange(e.target.value)}
            className="w-full border px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 outline-none"
            placeholder="cookie"
          />
        </div>

        <div className="mb-2">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => handleTiktokInfoChange(e.target.value)}
            className="w-full border px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 outline-none"
            placeholder="username"
          />
        </div>

        {/* Show logs */}
        <div className="h-[26rem] overflow-y-auto bg-gray-100 p-2 dark:bg-gray-700">
          <h3 className="mb-2 font-bold dark:text-gray-300">Logs:</h3>
          {logs.length > 0 ? (
            <ul>
              {logs.map((log, i) => (
                <li key={i} className="text-sm dark:text-gray-200">
                  {log}
                </li>
              ))}
              <div ref={logsEndRef} />
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No logs yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Download;
