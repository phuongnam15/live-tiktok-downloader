const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const {
  sanitizeUsername,
  newLiveUrl,
  fileNameOutput,
  ffmpegCommandMP4,
  ffmpegCommandMKV,
} = require("../utils/constants");

const { fetchHTML } = require("./fetchHTML");
const { setStreamData } = require("./getStreamData");
const { matchRoomId } = require("./matchRoomId");

let ffmpegProcesses = [];

async function downloadLiveStream(username, output, format, index, sender) {
  let ffmpegCommandArgs = [];
  try {
    const acceptedFormats = ["mp4", "mkv"];
    const sanitizedUsername = sanitizeUsername(username);
    const liveUri = newLiveUrl(sanitizedUsername);
    const textHTML = await fetchHTML(liveUri);
    const roomId = matchRoomId(textHTML);
    const { url, title, isFlv } = await setStreamData(roomId);
    const fileName = fileNameOutput(output, sanitizedUsername, format);

    if (acceptedFormats.includes(format) && !isFlv) {
      ffmpegCommandArgs =
        format === "mp4"
          ? ffmpegCommandMP4(url, title, sanitizedUsername, fileName)
          : ffmpegCommandMKV(url, fileName);
    } else if (format === "mp4" && isFlv) {
      ffmpegCommandArgs = ffmpegCommandMKV(url, fileName);
    } else {
      throw new Error(
        `\n❌ Invalid format: ${format}. Use mp4 or mkv formats.`
      );
    }

    fs.mkdirSync(path.dirname(fileName), { recursive: true });

    sender.send("start-download", {
      index,
      msg: `\n✅ Downloading livestream ${title} to ./${fileName}`,
    });
  } catch (error) {
    sender.send("start-download", { index, msg: error.message });
  }

  const ffmpegProcess = spawn("ffmpeg", ffmpegCommandArgs);


  ffmpegProcesses.push(ffmpegProcess);

  ffmpegProcess.stdout.on("data", (data) => {
    sender.send("start-download", { index, msg: `stdout: ${data}` });
  });

  ffmpegProcess.stderr.on("data", (data) => {
    sender.send("start-download", { index, msg: `${data}` });
  });

  ffmpegProcess.on("close", (code, signal) => {
    sender.send("start-download", {
      index,
      msg: `ffmpeg process exited with code ${code} - signal ${signal}`,
    });
    ffmpegProcesses = ffmpegProcesses.filter((proc) => proc !== ffmpegProcess);
  });

  ffmpegProcess.on("error", (err) => {
    sender.send("start-download", {
      index,
      msg: `Failed to start ffmpeg: ${err.message}`,
    });
  });
}

function stopFFmpegProcess(index, sender) {
  if (ffmpegProcesses[index]) {
    ffmpegProcesses[index].kill('SIGINT');
    sender.send("stop-process", {
      index,
      msg: `Stopped ffmpeg process with PID: ${ffmpegProcesses[index].pid}`,
    });
  }
}

function stopAllFFmpegProcess(sender) {
  for (const ffmpegProcess of ffmpegProcesses) {
    if (ffmpegProcess) {
      ffmpegProcess.kill('SIGINT');
      sender.send("stop-processes", {
        msg: `Stopped ffmpeg process with PID: ${ffmpegProcess.pid}`,
      });
    }
  }

  ffmpegProcesses = [];
}

module.exports = {
  downloadLiveStream,
  stopFFmpegProcess,
  stopAllFFmpegProcess,
  ffmpegProcesses,
};
