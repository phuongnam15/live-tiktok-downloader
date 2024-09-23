function matchRoomId(extractedHTML) {
  const liveRoomId = extractedHTML.match(/"roomId":"(\d+)"/); // "roomId":"7392776838324325xxx -- before: /room_id=(\d+)/

  if (!liveRoomId) {
    throw new Error("❌ No room id found!");
  }

  console.info(`\n✅ Found room id: ${liveRoomId[1]}! 🎉`);
  return liveRoomId[1];
}

module.exports = {
  matchRoomId,
};
