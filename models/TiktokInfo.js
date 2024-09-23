const { db } = require("../main");

const saveTiktokInfo = async (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM tiktok_infos WHERE username = ?",
      [username],
      (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          if (row) {
            resolve({ msg: "User already exist" });
          } else {
            db.run(
              `INSERT INTO tiktok_infos (username) VALUES (?)`,
              [username],
              (err) => {
                if (err) {
                  console.error(err.message);
                  reject(err);
                } else {
                  resolve({ msg: "New user added successfully" });
                }
              }
            );
          }
        }
      }
    );
  });
};
const getTiktokInfos = async () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tiktok_infos", [], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        if (rows && rows.length > 0) {
          resolve(rows);
        } else {
          resolve([]);
        }
      }
    });
  });
};
const truncateTiktokInfos = async () => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM tiktok_infos", [], (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        // Reset the auto-increment ID
        db.run(
          "DELETE FROM sqlite_sequence WHERE name='tiktok_infos'",
          [],
          (err) => {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      }
    });
  });
};
const checkTiktokInfoTableExist = async () => {
  return new Promise((resolve, reject) => {
    db.run(
      "CREATE TABLE IF NOT EXISTS tiktok_infos (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT)",
      [],
      (createErr) => {
        if (createErr) {
          console.error(createErr.message);
          reject();
        }
        resolve();
      }
    );
  });
};

module.exports = {
  saveTiktokInfo,
  getTiktokInfos,
  truncateTiktokInfos,
  checkTiktokInfoTableExist,
};
