import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UpLive = () => {
  const ipcRenderer = window.ipcRenderer;
  const navigate = useNavigate();
  const [numWindows, setNumWindows] = useState(1);
  const [liveStreams, setLiveStreams] = useState([
    { key_live: "", file: null },
  ]);
  const [responseData, setResponseData] = useState([]);
  const isStopButtonEnabled =
    responseData.length > 0 &&
    responseData.some((item) => item.status === "success");

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

  const handleStopAll = () => {
    const successStreamIds = responseData
      .filter((item) => item.status === "success")
      .map((item) => item.streamId);
    handleStop(successStreamIds);
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

    ipcRenderer.send("up-live-multi", { streams: uploadData });
    ipcRenderer.once("up-live-multi-response", (event, { data }) => {
      setResponseData(data);
    });
  };

  const handleStop = (streamIds) => {
    ipcRenderer.send("stop-live-multi", { streamIds });
    ipcRenderer.once("stop-live-multi-response", (event, { data }) => {
      setResponseData((prevResponseData) =>
        prevResponseData.map((item) => {
          const matchingData = data.find(
            (dataItem) => dataItem.streamId === item.streamId,
          );
          return matchingData
            ? { ...item, status: "stopped", msg: matchingData.msg }
            : item;
        }),
      );
    });
  };

  return (
    <div className="mx-auto flex min-h-screen h-fit flex-col px-8 py-4 dark:bg-gray-900 dark:text-white">
      {/* Section for number of windows selection */}
      <div className="mb-4 flex items-center gap-3">
        <select
          id="numWindows"
          value={numWindows}
          onChange={handleNumWindowsChange}
          className="rounded border p-1 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <label
          htmlFor="numWindows"
          className="text-md font-medium dark:text-gray-300"
        >
          windows
        </label>
      </div>

      {/* Buttons section */}
      <div className="mb-4 flex gap-1.5">
        <button
          onClick={handleUpload}
          className="rounded bg-blue-500 px-3 py-1.5 text-white shadow transition-colors hover:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Upload
        </button>
        <button
          className={`rounded bg-red-500 px-3 py-1.5 text-white ${
            isStopButtonEnabled
              ? "dark:bg-red-500 dark:hover:bg-red-400"
              : "cursor-not-allowed opacity-50"
          }`}
          onClick={handleStopAll}
          disabled={!isStopButtonEnabled}
        >
          Stop All
        </button>
        <button
          className="rounded bg-teal-500 px-3 py-1.5 text-white dark:bg-teal-500 dark:hover:bg-teal-400"
          onClick={() => navigate("/")}
        >
          Download
        </button>
      </div>

      {/* Live Streams Inputs Section */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {liveStreams.map((stream, index) => (
          <div
            key={index}
            className="rounded border border-gray-400 p-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <div className="mb-2">
              <label
                htmlFor={`keyLive-${index}`}
                className="mb-2 block text-sm font-bold dark:text-gray-300"
              >
                Key Live {index + 1}
              </label>
              <input
                type="text"
                id={`keyLive-${index}`}
                value={stream.key_live}
                onChange={(e) => handleKeyLiveChange(index, e.target.value)}
                className="w-full rounded border border-gray-400 p-2 text-sm outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder={`Enter your key live for window ${index + 1}`}
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor={`fileUpload-${index}`}
                className="mb-2 block text-sm font-bold dark:text-gray-300"
              >
                Select File {index + 1}
              </label>
              <input
                type="file"
                id={`fileUpload-${index}`}
                onChange={(e) => handleFileChange(index, e.target.files[0])}
                className="w-full rounded border border-gray-400 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Response Data Section */}
            {responseData.length > 0 &&
              (responseData[index]?.status === "success" ? (
                <button
                  onClick={() => handleStop([responseData[index].streamId])}
                  className="mt-2 rounded bg-red-600 px-3 py-1 text-white dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Stop
                </button>
              ) : (
                <span className="dark:text-gray-400">
                  {responseData[index]?.msg}
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpLive;
