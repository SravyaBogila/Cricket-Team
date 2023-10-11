const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const snakeCaseToCamelCase = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server Running at http://localhost/3003/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT 
            *
        FROM
            cricket_team
        ORDER BY
            player_id;
    `;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(
    dbResponse.map((eachPlayer) => snakeCaseToCamelCase(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO cricket_team
            (player_name, jersey_number, role)
        VALUES
            ("${playerName}", ${jerseyNumber}, ${role});
    `;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT
            *
        FROM 
            cricket_team
        WHERE
            player_id = ${playerId};
    `;
  const dbResponse = await db.get(getPlayerQuery);
  const snakeCase = dbResponse.map((eachPlayer) =>
    snakeCaseToCamelCase(eachPlayer)
  );
  response.send(snakeCase(0, 1));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE 
            cricket_team
        SET
           player_name = "${playerName}",
           jersey_number = ${jerseyNumber},
           role = "${role}"
        WHERE
            player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE
        FROM cricket_team
        WHERE player_id = ${player_id};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
