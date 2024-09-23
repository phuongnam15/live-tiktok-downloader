const { tiktokApi } = require("../utils/constants");

/**
 * It takes a roomId, makes a request to the tiktok api, and returns the response.
 *
 * @param {string} roomId - The room ID of the live stream.
 * @return {Promise} - The response from the tiktok api.
 */
async function getTiktokApiResponse(roomId) {
  const api = tiktokApi(roomId);
  const response = await fetch(api);
  const data = await response.json();

  const tiktokResponse = {
    LiveRoomInfo: data.LiveRoomInfo,
    extra: data.extra,
    log_pb: data.log_pb,
    statusCode: data.statusCode,
    status_code: data.status_code,
    status_msg: data.status_msg,
  };

  return tiktokResponse;
}

module.exports = {getTiktokApiResponse}