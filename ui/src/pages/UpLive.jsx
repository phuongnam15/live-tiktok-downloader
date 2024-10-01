import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UpLive = () => {
  const ipcRenderer = window.ipcRenderer;
  const navigate = useNavigate();
  const [numWindows, setNumWindows] = useState(1);
  const [liveStreams, setLiveStreams] = useState([
    { key_live: "", file: null },
  ]);
  const [responseMsg, setResponseMsg] = useState([]);
  const [runningStreams, setRunningStreams] = useState([]);

  const handleNumWindowsChange = (e) => {
    const newNumWindows = parseInt(e.target.value, 10);
    const updatedStreams = [...liveStreams];
    if (newNumWindows > liveStreams.length) {
      for (let i = liveStreams.length; i < newNumWindows; i++) {
        updatedStreams.push({ key_live: "", file: null });
      }
    } else {
      updatedStreams.length = newNumWindows;
    }

    setNumWindows(newNumWindows);
    setLiveStreams(updatedStreams);
  };

  const handleKeyLiveChange = (index, value) => {
    const updatedStreams = [...liveStreams];
    updatedStreams[index].key_live = value;
    setLiveStreams(updatedStreams);
  };

  const handleFileChange = (index, file) => {
    const updatedStreams = [...liveStreams];
    updatedStreams[index].file = file;
    setLiveStreams(updatedStreams);
  };

  const handleUpload = () => {
    const streamsToUpload = liveStreams.filter(
      (stream) => stream.key_live && stream.file,
    );

    if (streamsToUpload.length === 0) {
      alert(
        "Please enter key live and select a file for at least one window before uploading.",
      );
      return;
    }

    const uploadData = streamsToUpload.map((stream) => ({
      key_live: stream.key_live,
      videoPath: stream.file.path,
    }));

    ipcRenderer.send("up-live-multi", { streams : uploadData });
    ipcRenderer.once("up-live-multi-response", (event, { data }) => {
      const updatedStreams = liveStreams.map((stream, index) => {
        const streamResult = data.find(
          (item) => item.msg.includes("started") && item.streamId,
        );
        if (streamResult) {
          return {
            ...stream,
            streamId: streamResult.streamId,
            status: "running",
          };
        }
        return { ...stream, status: "error" };
      });
      setLiveStreams(updatedStreams);
      setResponseMsg(data.map((item) => item.msg));
    });
  };

  const handleStop = (streamIds) => {
    ipcRenderer.send("stop-live-multi", { streamIds });
    ipcRenderer.once("stop-live-multi-response", (event, { data }) => {
      const updatedStreams = liveStreams.map((stream) =>
        streamIds.includes(stream.streamId)
          ? { ...stream, status: "stopped" }
          : stream,
      );
      setLiveStreams(updatedStreams);
      setResponseMsg((prev) => [...prev, ...data.map((item) => item.msg)]);
    });
  };

  return (
    <div className="container mx-auto flex flex-col justify-center p-4">
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="numWindows" className="text-md font-medium">
          Select Number of Windows
        </label>
        <select
          id="numWindows"
          value={numWindows}
          onChange={handleNumWindowsChange}
          className="rounded border p-1"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2 flex gap-1">
        <button
          onClick={handleUpload}
          className="rounded bg-blue-600 px-3 py-2 text-white shadow transition-colors hover:bg-blue-700"
        >
          Upload
        </button>
        <button
          className="rounded bg-teal-500 px-3 py-2 text-white"
          onClick={() => navigate("/")}
        >
          Download
        </button>
      </div>

      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
        {liveStreams.map((stream, index) => (
          <div key={index} className="rounded border p-2 shadow">
            <div className="mb-2">
              <label
                htmlFor={`keyLive-${index}`}
                className="mb-2 block text-sm font-medium"
              >
                Key Live {index + 1}
              </label>
              <input
                type="text"
                id={`keyLive-${index}`}
                value={stream.key_live}
                onChange={(e) => handleKeyLiveChange(index, e.target.value)}
                className="w-full rounded border p-2 text-sm"
                placeholder={`Enter your key live for window ${index + 1}`}
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor={`fileUpload-${index}`}
                className="mb-2 block text-sm font-medium"
              >
                Select File {index + 1}
              </label>
              <input
                type="file"
                id={`fileUpload-${index}`}
                onChange={(e) => handleFileChange(index, e.target.files[0])}
                className="w-full rounded border p-2"
              />
            </div>

            {stream.status === "running" && (
              <button
                onClick={() => handleStop([stream.streamId])}
                className="mt-2 rounded bg-red-600 px-3 py-1 text-white"
              >
                Stop
              </button>
            )}
          </div>
        ))}
      </div>

      {responseMsg.length > 0 && (
        <div className="mt-4 rounded border bg-gray-50 p-4">
          <h3 className="mb-2 text-lg font-medium">Response Messages</h3>
          <ul>
            {responseMsg.map((msg, index) => (
              <li key={index} className="text-sm text-gray-600">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UpLive;
