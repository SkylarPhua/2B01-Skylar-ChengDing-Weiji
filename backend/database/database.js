//------------------------------------
// app.js
//------------------------------------

//------------------------------------
// Imports
//------------------------------------
const pg = require('pg');

//------------------------------------
// Configurations
//------------------------------------
let connection;
exports.connect = function () {
  var connectionString = "postgres://dvexeadz:DQn05mSE9mOj7RRxS8iMkbEY3etme0P8@rosie.db.elephantsql.com/dvexeadz"
  if (connection) {
    const oldConnection = connection;
    connection = null;
    return oldConnection.end().then(() => exports.connect(connectionString));
  }
  connection = new pg.Pool({
    connectionString,
    max: 5, // New things
  });
  return connection.connect().catch(function (error) {
    connection = null;    
    throw error;
  });
};

exports.query = function (text, params) {
    if (!connection) {
      return Promise.reject(new Error('Not connected to database'));
    }
      return connection.query(text, params)
  };

exports.transaction = async function (asyncFn) {
  if (!connection) {
    return Promise.reject(new Error('Not connected to database'));
  }
  await connection.query(`BEGIN`)
  try {
      const result = await asyncFn();
      await connection.query(`COMMIT`);
      console.log("This is database.js: " + result);
      return result;
  } catch (err)  {
      await connection.query(`ROLLBACK`);
      throw err;
  }
}