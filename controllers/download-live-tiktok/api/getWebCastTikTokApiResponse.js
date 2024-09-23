const { webcastTiktokApi } = require("../utils/constants");

/**
 * It takes a roomId, makes a request to the tiktok api, and returns the response.
 *
 * @param {string} roomId - The room ID of the live stream.
 * @return {Promise} - The response from the tiktok api.
 */
async function getWebCastTikTokApiResponse(roomId) {
  const api = webcastTiktokApi(roomId);
  const response = await fetch(api);
  const data = await response.json();

  const tiktokResponse = {
    data: data.data,
    extra: data.extra,
    status_code: data.status_code,
  };

  return tiktokResponse;
}

module.exports = {getWebCastTikTokApiResponse}