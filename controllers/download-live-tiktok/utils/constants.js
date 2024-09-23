/**
 * It takes a string, checks if it starts with an @ symbol, and if it does, it returns the string
 * without the @ symbol
 * @param {string} username - The username to sanitize
 * @returns {string} string - The username without the @ symbol.
 */
const sanitizeUsername = (username) => {
  return username.startsWith("@") ? username.substring(1) : username;
};

/**
 * It takes a string as an argument and returns a string
 * @param {string} username - The username of the TikTok account you want to get the live URL for.
 * @returns {string} string - The live URL of the TikTok account.
 */
function newLiveUrl(username) {
  return `https://www.tiktok.com/@${username}/live`;
}

/**
 * It takes a string as an argument and returns a string.
 *
 * @param {number} aId - The aId of the TikTok live stream.
 * @param {string} roomId - The room ID of the live stream.
 * @returns {string} string - The API URL of the live stream.
 */
const tiktokApi = (roomId) => {
  return `https://www.tiktok.com/api/live/detail/?aid=1988&roomID=${roomId}`;
};

/**
 * It takes the room ID of a TikTok live stream and returns the API URL of the live stream.
 *
 * @param {number} aId - The aId of the TikTok live stream.
 * @param {string} roomId - The room ID of the live stream.
 * @return {string} The API URL of the live stream.
 */
const webcastTiktokApi = (roomId) => {
  return `https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=${roomId}`;
};

/**
 * It takes a string as an argument and returns a string.
 *
 * @param {string} output - The output path for the downloaded live stream.
 * @param {string} username - The username of the TikTok account.
 * @param {string} format - The format of the downloaded live stream.
 * @returns {string} string - The name of the file to save the live stream to.
 */
const fileNameOutput = (output, username, format) => {
  return output.endsWith(format)
    ? output
    : `${output}/${username}-${new Date()
        .toLocaleString()
        .replace(/[^\d]/g, "")}.${format === "mp4" ? "mp4" : "mkv"}`;
};

/**
 * It takes a string as an argument and returns a string.
 *
 * @param {string} liveUrl - The live URL of the TikTok live stream.
 * @param {string} title - The title of the TikTok live stream.
 * @param {string} username - The username of the TikTok account.
 * @param {string} fileName - The name of the file to save the live stream to.
 * @returns {string} string - The ffmpeg command to download the live stream.
 */
const ffmpegCommandMP4 = (liveUrl, title, username, fileName) => {
  return `-i "${liveUrl}" -movflags use_metadata_tags -map_metadata 0 -metadata title="${title}" -metadata artist="${username}" -metadata year="${new Date().getFullYear()}" -c copy "${fileName}" -n -stats -hide_banner -loglevel error`;
};

/**
 * It takes a string as an argument and returns a string.
 *
 * @param {string} liveUrl - The live URL of the TikTok live stream.
 * @param {string} fileName - The name of the file to save the live stream to.
 * @returns {string} string - The ffmpeg command to download the live stream.
 */
const ffmpegCommandMKV = (liveUrl, fileName) => {
  return `-i "${liveUrl}" -c:v hevc -crf 23 -c:a copy "${fileName}" -n -stats -hide_banner -loglevel error`;
};

module.exports = {
  ffmpegCommandMKV,
  ffmpegCommandMP4,
  fileNameOutput,
  webcastTiktokApi,
  tiktokApi,
  newLiveUrl,
  sanitizeUsername,
};
