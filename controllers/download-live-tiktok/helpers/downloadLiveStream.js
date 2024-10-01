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

var ffmpeg_process;

async function downloadLiveStream(username, output, format, sender) {
  var ffmpegCommandArgs = [];

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
      msg: `\n✅ Downloading livestream ... ${title} to ./${fileName}`,
    });

    ffmpeg_process = spawn("ffmpeg", ffmpegCommandArgs);

    ffmpeg_process.on("spawn", () => {
      sender.send("start-download", {
        msg: "FFmpeg process start",
      });
    });

    ffmpeg_process.stderr.on("data", (data) => {
      sender.send("start-download", {
        msg: data.toString(),
      });
    });

    ffmpeg_process.on("error", (err) => {
      sender.send("start-download", {
        msg: `ERROR:", ${err}`,
      });
    });

    ffmpeg_process.on("close", (code) => {
      sender.send("start-download", { msg : `EXITED WITH CODE ${code}` });
      if (code == 0) {
        const dir= path.join(process.cwd());
        const message = `${dir}/${fileName}}`;
        sender.send("start-download", { msg : message });
      }
    });
  } catch (error) {
    sender.send("start-download", { msg: `ERROR: ${error}` });
  }
}
function stopFFmpeg() {
  if (ffmpeg_process && ffmpeg_process.stdin) {
    ffmpeg_process.stdin.write("q");
    ffmpeg_process.stdin.end();

    ffmpeg_process = null;
  }
}

module.exports = {
  downloadLiveStream,
  stopFFmpeg,
};
