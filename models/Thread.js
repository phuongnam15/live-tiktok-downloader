const { db } = require('../main');

const getNumThreads = async () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT threads FROM config", [], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        if (row) {
          resolve(row.threads);
        } else {
          resolve(2);
        }
      }
    });
  });
};
const saveNumThreads = async (threads) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM config", [], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        if (row) {
          db.run(`UPDATE config SET threads = ?`, [threads], (err) => {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              resolve({ msg: "Updated config successfully" });
            }
          });
        } else {
          db.run(
            `INSERT INTO config (threads) VALUES (?)`,
            [threads],
            (err) => {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                resolve({ msg: "Updated config successfully" });
              }
            }
          );
        }
      }
    });
  });
};
const checkConfigTableExist = async () => {
  return new Promise((resolve, reject) => {
    db.run(
      "CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY AUTOINCREMENT, threads TEXT)",
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
    getNumThreads,
    saveNumThreads,
    checkConfigTableExist
}
