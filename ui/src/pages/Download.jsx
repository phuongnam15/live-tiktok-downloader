import React, { useEffect, useState, useContext } from "react";
import notifyContext from "../contexts/notifyContext";
import { useNavigate } from "react-router-dom";

const Download = () => {
  const ipcRenderer = window.ipcRenderer;
  const [numThreads, setNumThreads] = useState(1);
  const [windows, setWindows] = useState([
    { username: "", logs: [], isSaved: false },
  ]);
  const [isNumThreadsUpdated, setIsNumThreadsUpdated] = useState(false);
  const { show } = useContext(notifyContext);
  const navigate = useNavigate();

  const handleNumThreadsChange = async (threads) => {
    const newWindows = [...windows];
    if (threads > windows.length) {
      for (let i = windows.length; i < threads; i++) {
        newWindows.push({ username: "", logs: [], isSaved: false });
      }
    } else {
      newWindows.length = threads;
    }
    setWindows(newWindows);
    setNumThreads(threads);
    setIsNumThreadsUpdated(true);
  };
  const handleSaveNumThreads = (threads) => {
    ipcRenderer.send("save-num-threads", { threads });
    ipcRenderer.on("save-num-threads", (event, data) => {
      if (data.code == 0) {
        show(data.msg, "success");
      } else {
        show(data.msg, "error");
      }
    });
  };
  const handleGetNumThreads = async () => {
    ipcRenderer.send("get-num-threads", {});
    ipcRenderer.on("get-num-threads", (event, data) => {
      handleNumThreadsChange(data.threads);
    });
  };
  const handleTiktokInfoChange = (index, value) => {
    const newWindows = [...windows];
    newWindows[index].username = value;
    newWindows[index].isSaved = false;
    setWindows(newWindows);
  };
  const handleSaveTiktokInfo = (index) => {
    ipcRenderer.send("save-tiktok-info", {
      username: windows[index].username,
    });
    ipcRenderer.on("save-tiktok-info", (event, data) => {
      if (data.code == 0) {
        show(data.msg, "success");
      }
    });
  };
  const handleGetTiktokInfos = () => {
    ipcRenderer.send("get-tiktok-infos", {});
    ipcRenderer.on("get-tiktok-infos", (event, data) => {
      const newWindows = [...windows];
      const elements = data.data;

      if (elements.length === 0) return;

      newWindows.forEach((item, index) => {
        const elementIndex = index % elements.length;
        item.username = elements[elementIndex].username ?? "";
      });

      setWindows(newWindows);
    });
  };

  const handleStart = () => {
    ipcRenderer.send("start-download", { data: windows });
    ipcRenderer.on("start-download", (event, data) => {
      const newWindows = [...windows];

      newWindows[data.index].logs.push(data.msg);

      setWindows(newWindows);
    });
  };

  const handleStopProcesses = () => {
    ipcRenderer.send("stop-processes", {});
    ipcRenderer.on("stop-processes", (event, data) => {
      console.log(data);
    });
  };

  const handleStopProcess = (index) => {
    ipcRenderer.send("stop-process", { index });
    ipcRenderer.on("stop-process", (event, data) => {
      console.log(data);
    });
  };

  useEffect(() => {
    handleGetNumThreads();
    if (isNumThreadsUpdated) {
      handleGetTiktokInfos();
    }
  }, [numThreads]);

  useEffect(() => {
    if (isNumThreadsUpdated) {
      handleGetTiktokInfos();
      setIsNumThreadsUpdated(false);
    }
  }, [isNumThreadsUpdated]);

  return (
    <div className="container mx-auto p-4">
      {/* <div>
        <button className="rounded py-1" onClick={() => navigate("/login")}><i className="fa-solid fa-arrow-left text-gray-400 hover:text-gray-600"></i></button>
      </div> */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <label htmlFor="numThreads" className="mr-2">
            Select number of threads:
          </label>
          <select
            id="numThreads"
            value={numThreads}
            onChange={(e) => {
              const confirm = window.confirm(
                "Are you sure to change number of threads ?",
              );
              if (!confirm) return;
              const threads = parseInt(e.target.value, 10);
              handleNumThreadsChange(threads);
              handleSaveNumThreads(threads);
            }}
            className="border p-2"
          >
            {[...Array(10).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded bg-red-600 px-4 py-2 font-medium text-white"
            onClick={() => handleStopProcesses()}
          >
            Stop
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 font-medium text-white"
            onClick={() => handleStart()}
          >
            Start
          </button>
        </div>
      </div>

      {/* grid responsive */}
      <div className="grid grid-cols-1 gap-4">
        {windows.map((window, index) => (
          <div key={index} className="rounded border p-4 shadow">
            {/* input & button */}
            <div className="mb-4">
              <label
                htmlFor={`username-${index}`}
                className="mb-2 block font-bold"
              >
                Username for Thread {index + 1}
              </label>
              <input
                type="text"
                id={`username-${index}`}
                value={window.username}
                onChange={(e) => handleTiktokInfoChange(index, e.target.value)}
                className="mb-2 w-full border p-2"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => handleSaveTiktokInfo(index)}
                  disabled={window.isSaved || window.username === ""}
                  className={`px-3 py-1 text-sm text-white ${window.isSaved || window.username === "" ? "bg-gray-400" : "bg-blue-500"} rounded`}
                >
                  Save
                </button>
                <button
                  onClick={() => handleStopProcess(index)}
                  disabled={window.isSaved || window.username === ""}
                  className={`px-3 py-1 text-sm text-white bg-red-500 rounded`}
                >
                  Stop
                </button>
              </div>
            </div>

            {/* show log */}
            <div className="h-40 overflow-auto bg-gray-100 p-2">
              <h3 className="mb-2 font-bold">Logs:</h3>
              {window.logs.length > 0 ? (
                <ul>
                  {window.logs.map((log, i) => (
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
        ))}
      </div>
    </div>
  );
};

export default Download;
