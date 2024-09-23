const { getTiktokApiResponse } = require("../api/getTiktokApiResponse");
const {
  getWebCastTikTokApiResponse,
} = require("../api/getWebCastTikTokApiResponse");

async function setStreamData(roomId) {
  const onlineStatus = 2;
  const { liveUrl, liveTitle, liveUser, liveStatus } =
    await getM3u8LiveStreamInfo(roomId);
  const { streamUrlFlv, streamTitleFlv, usernameFlv, statusFlv } =
    await getFlvLiveStreamInfo(roomId);

  if (liveUrl === "" && streamUrlFlv === "") {
    throw new Error(
      `\n❌ No url live stream found! This user is offline or the live url is empty.`
    ).message;
  }

  if (liveUrl !== "" && liveStatus === onlineStatus) {
    console.info(`\n✅ Found the live stream of: ${liveUser}! 🎉`);
    return {
      url: liveUrl,
      title: liveTitle,
      user: liveUser,
      statusOnline: liveStatus,
      isFlv: false,
    };
  } else if (streamUrlFlv !== "" && statusFlv === onlineStatus) {
    console.info(`\n✅ Found the live stream of: ${liveUser}! 🎉`);
    return {
      url: streamUrlFlv,
      title: streamTitleFlv,
      user: usernameFlv,
      statusOnline: statusFlv,
      isFlv: true,
    };
  } else {
    throw new Error(
      `\n❌ No url live stream found! This user is offline or the live url is empty.`
    ).message;
  }
}

async function getM3u8LiveStreamInfo(roomId) {
  const response = await getTiktokApiResponse(roomId);
  const liveStreamInfo = {
    liveUrl: response.LiveRoomInfo.liveUrl,
    liveTitle: response.LiveRoomInfo.title,
    liveUser: response.LiveRoomInfo.ownerInfo.nickname,
    liveStatus: response.LiveRoomInfo.status,
  };

  return liveStreamInfo;
}

async function getFlvLiveStreamInfo(roomId) {
  const response = await getWebCastTikTokApiResponse(roomId);
  const flvStreamInfo = {
    streamUrlFlv: response.data.stream_url.flv_pull_url.FULL_HD1,
    streamTitleFlv: response.data.title,
    statusFlv: response.data.status,
    usernameFlv: response.data.owner.nickname,
  };

  return flvStreamInfo;
}

module.exports = {
  setStreamData,
  getM3u8LiveStreamInfo,
  getFlvLiveStreamInfo,
};
