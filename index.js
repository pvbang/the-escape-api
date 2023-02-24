const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: "localhost",
  port: 3366,
  user: "root",
  password: "123456",
  database: "the_escape",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected to the database!");
});

// users api
app.get("/api/users", function (req, res) {
  connection.query("SELECT * FROM Users", function (error, results) {
    if (error) throw error;
    res.send(results);
  });
});

app.get("/api/users/:id", function (req, res) {
  connection.query(
    "SELECT * FROM Users WHERE id = ?",
    [req.params.id],
    function (error, results) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.post("/api/users", function (req, res) {
  const { username, password } = req.body;
  connection.query(
    "INSERT INTO Users (username, password) VALUES (?, ?)",
    [username, password],
    function (error, results) {
      if (error) throw error;
      res.send(`User added with ID: ${results.insertId}`);
    }
  );
});

app.put("/api/users/:id", function (req, res) {
  const { username, password } = req.body;
  connection.query(
    "UPDATE Users SET username = ?, password = ? WHERE id = ?",
    [username, password, req.params.id],
    function (error, results) {
      if (error) throw error;
      res.send("User updated successfully.");
    }
  );
});

app.delete("/api/users/:id", function (req, res) {
  connection.query(
    "DELETE FROM Users WHERE id = ?",
    [req.params.id],
    function (error, results) {
      if (error) throw error;
      res.send("User deleted successfully.");
    }
  );
});

// levels api
app.get("/api/levels", (req, res) => {
  const query = `SELECT * FROM Levels`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get("/api/levels/:id", (req, res) => {
  const query = `SELECT * FROM Levels WHERE id = ${req.params.id}`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send(results[0]);
  });
});

app.post("/api/levels", (req, res) => {
  const { name, description, obstacles, items } = req.body;
  const query = `INSERT INTO Levels (name, description, obstacles, items) VALUES ('${name}', '${description}', ${obstacles}, ${items})`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send("Level created successfully");
  });
});

app.put("/api/levels/:id", (req, res) => {
  const { name, description, obstacles, items } = req.body;
  const query = `UPDATE Levels SET name='${name}', description='${description}', obstacles=${obstacles}, items=${items}, updated_at=CURRENT_TIMESTAMP WHERE id=${req.params.id}`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send("Level updated successfully");
  });
});

app.delete("/api/levels/:id", (req, res) => {
  const query = `DELETE FROM Levels WHERE id = ${req.params.id}`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send("Level deleted successfully");
  });
});

// scores api
app.get("/api/scores/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = `SELECT Scores.score, Levels.name AS level_name FROM Scores INNER JOIN Levels ON Scores.level_id = Levels.id WHERE Scores.user_id = ${userId}`;
  connection.query(query, (err, rows, fields) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.json(rows);
  });
});

app.post("/api/scores", (req, res) => {
  const { userId, levelId, score } = req.body;
  const query = `INSERT INTO Scores (user_id, level_id, score) VALUES (${userId}, ${levelId}, ${score})`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

app.put("/api/scores/:id", (req, res) => {
  const id = req.params.id;
  const { score } = req.body;
  const query = `UPDATE Scores SET score = ${score} WHERE id = ${id}`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

app.delete("/api/scores/:id", (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM Scores WHERE id = ${id}`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

// items api
app.get("/api/items", (req, res) => {
  connection.query("SELECT * FROM Items", (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get("/api/items/:id", (req, res) => {
  const id = req.params.id;
  connection.query("SELECT * FROM Items WHERE id = ?", id, (error, results) => {
    if (error) throw error;
    res.send(results[0]);
  });
});

app.post("/api/items", (req, res) => {
  const { name, description, effect } = req.body;
  const item = { name, description, effect };
  connection.query("INSERT INTO Items SET ?", item, (error, result) => {
    if (error) throw error;
    const newItem = { id: result.insertId, ...item };
    res.send(newItem);
  });
});

app.put("/api/items/:id", (req, res) => {
  const id = req.params.id;
  const { name, description, effect } = req.body;
  const item = { name, description, effect };
  connection.query(
    "UPDATE Items SET ? WHERE id = ?",
    [item, id],
    (error, result) => {
      if (error) throw error;
      const updatedItem = { id, ...item };
      res.send(updatedItem);
    }
  );
});

app.delete("/api/items/:id", (req, res) => {
  const id = req.params.id;
  connection.query("DELETE FROM Items WHERE id = ?", id, (error, result) => {
    if (error) throw error;
    res.send(`Item with ID: ${id} has been deleted.`);
  });
});

// obstacles api
app.post("/api/obstacles", (req, res) => {
  const { name, description, effect } = req.body;
  const sql = `INSERT INTO Obstacles (name, description, effect) VALUES (?, ?, ?)`;
  pool.query(sql, [name, description, effect], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get("/api/obstacles", (req, res) => {
  const sql = `SELECT * FROM Obstacles`;
  pool.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get("/api/obstacles/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM Obstacles WHERE id = ?`;
  pool.query(sql, [id], (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.put("/api/obstacles/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, effect } = req.body;
  const sql = `UPDATE Obstacles SET name = ?, description = ?, effect = ? WHERE id = ?`;
  pool.query(sql, [name, description, effect, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.delete("/api/obstacles/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM Obstacles WHERE id = ?`;
  pool.query(sql, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// user-items api
app.get("/api/user-items", (req, res) => {
  connection.query("SELECT * FROM User_Items", (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get("/api/user-items/:id", (req, res) => {
  const id = req.params.id;
  connection.query("SELECT * FROM User_Items WHERE id = ?", id, (error, results) => {
    if (error) throw error;
    res.send(results[0]);
  });
});

app.post("/api/user-items", (req, res) => {
  const { user_id, item_id, quantity } = req.body;
  const user_item = { user_id, item_id, quantity };
  connection.query("INSERT INTO User_Items SET ?", user_item, (error, result) => {
    if (error) throw error;
    const newItem = { id: result.insertId, ...user_item };
    res.send(newItem);
  });
});

app.put("/api/user-items/:id", (req, res) => {
  const id = req.params.id;
  const { user_id, item_id, quantity } = req.body;
  const user_item = { user_id, item_id, quantity };
  connection.query(
    "UPDATE User_Items SET ? WHERE id = ?",
    [user_item, id],
    (error, result) => {
      if (error) throw error;
      const updatedItem = { id, ...user_item };
      res.send(updatedItem);
    }
  );
});

app.delete("/api/user-items/:id", (req, res) => {
  const id = req.params.id;
  connection.query("DELETE FROM User_Items WHERE id = ?", id, (error, result) => {
    if (error) throw error;
    res.send(`User Items with ID: ${id} has been deleted.`);
  });
});

//
app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
