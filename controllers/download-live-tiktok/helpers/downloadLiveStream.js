const fs = require("fs");
const path = require("path");
const { exec } = require("node:child_process");

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

async function downloadLiveStream(username, output, format, sender) {
  let ffmpegCommandArgs = "";
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
      msg: `\n✅ Downloading livestream ${title} to ./${fileName}`,
    });
  } catch (error) {
    sender.send("start-download", { msg: error.message });
  }

  console.log(ffmpegCommandArgs);

  // const proc = exec(
  //   ffmpegCommandArgs,
  //   (err, stdout, stderr) => {
  //     if (err) {
  //       console.error(`Error: ${err.message}`);
  //       return;
  //     }
  //     if(stdout) {
  //       console.log(stdout);
  //     }
  //     console.log(stderr);
  //   }
  // );

  // proc.on("close", (code, signal) => {
  //   console.log(`Process close with code ${code} signal ${signal}`);
  // });

  // proc.on("exit", (code, signal) => {
  //   console.log(`Process exit with code ${code} signal ${signal}`);
  // });

  // setTimeout(() => {
  //   console.log("Download is being killed...");
  //   proc.kill();
  // }, 20000);
}

module.exports = {
  downloadLiveStream,
};
