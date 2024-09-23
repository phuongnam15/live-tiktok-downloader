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

  const handleStartDownload = () => {
    ipcRenderer.send("start-download", {data : windows});
  }

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
      <div className="mb-4 flex justify-between items-center">
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
        <div>
          <button className="bg-green-600 text-white font-medium rounded py-2 px-4" onClick={() => handleStartDownload()}>Start</button>
        </div>
      </div>

      {/* grid responsive */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <button
                onClick={() => handleSaveTiktokInfo(index)}
                disabled={window.isSaved || window.username === ""}
                className={`px-4 py-2 text-white ${window.isSaved || window.username === "" ? "bg-gray-400" : "bg-blue-500"} rounded`}
              >
                Save
              </button>
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
