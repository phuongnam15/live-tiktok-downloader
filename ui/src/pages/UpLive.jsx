import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UpLive = () => {
  const ipcRenderer = window.ipcRenderer;
  const [keyLive, setKeyLive] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [responseMsg, setResponseMsg] = useState([]);
  const navigate = useNavigate();

  const handleKeyLiveChange = (e) => {
    setKeyLive(e.target.value);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!keyLive || !selectedFile) {
      alert("Please enter the key live and select a file before uploading.");
      return;
    }
    // console.log("Key Live:", keyLive);
    // console.log("Selected File:", selectedFile);
    ipcRenderer.send("up-live", { key_live: keyLive, videoPath: selectedFile.path });
    ipcRenderer.on("up-live", (event, data) => {
        const newResponseMsg = [...responseMsg, data.msg.msg];
        if(data?.msg?.streamId) {
            newResponseMsg.push(data?.msg?.streamId);
        }
        setResponseMsg(newResponseMsg)
    })
    
    setKeyLive("");
    setSelectedFile(null);
  };

//   const handleStopLive = () => {
//     ipcRenderer.send("stop-live", { streamId });
//     ipcRenderer.on("stop-live", (event, data) => {
//         console.log(data);
//     })
//   };

  return (
    <div className="container mx-auto flex h-lvh max-w-lg flex-col justify-center p-4">

      {/* Key Live input */}
      <div className="mb-4">
        <label htmlFor="keyLive" className="mb-2 block text-sm font-medium">
          Key Live
        </label>
        <input
          type="text"
          id="keyLive"
          value={keyLive}
          onChange={handleKeyLiveChange}
          className="w-full rounded border p-2"
          placeholder="Enter your key live"
        />
      </div>

      {/* File input */}
      <div className="mb-4">
        <label htmlFor="fileUpload" className="mb-2 block text-sm font-medium">
          Select File
        </label>
        <input
          type="file"
          id="fileUpload"
          onChange={handleFileChange}
          className="w-full rounded border p-2"
        />
      </div>

      {/* Upload button */}
      <button
        onClick={() => handleUpload()}
        className="w-full rounded bg-blue-600 py-2 text-white shadow transition-colors hover:bg-blue-700 mb-1"
      >
        Up
      </button>

      {/* Download button */}
      <button className="py-2 rounded bg-teal-500 text-white" onClick={() => navigate("/")}>Download</button>

      {/* Show selected file name */}
      {selectedFile && (
        <p className="mt-4 text-sm text-gray-600">
          Selected file:{" "}
          <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}
    </div>
  );
};

export default UpLive;
