const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "db", "data.db"));

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  const {
    page = 1,
    name,
    height,
    weight,
    startdate,
    enddate,
    married,
    mode,
  } = req.query;

  const limit = 5;
  const offset = (page - 1) * 5;

  const queries = [];
  const params = [];
  const paramscount = [];

  if (name) {
    queries.push(`name like '%' || ? || '%'`);
    params.push(name);
    paramscount.push(name);
  }

  if (height) {
    queries.push(`height =?`);
    params.push(height);
    paramscount.push(height);
  }

  if (weight) {
    queries.push(`weight =?`);
    params.push(weight);
    paramscount.push(weight);
  }

  if (married) {
    queries.push("married = ?");
    params.push(married);
    paramscount.push(married);
  }

  if (startdate && enddate) {
    queries.push(`birthdate between ? and ?`);
    params.push(startdate, enddate);
    paramscount.push(startdate, enddate);
  } else if (startdate) {
    queries.push("birthdate >= ?");
    params.push(startdate);
    paramscount.push(startdate);
  } else if (enddate) {
    queries.push("birthdate <= ?");
    params.push(enddate);
    paramscount.push(enddate);
  }

  let sql = "SELECT * FROM data";
  let sqlcount = "SELECT COUNT(*) AS total FROM data";
  if (queries.length > 0) {
    sql += ` WHERE ${queries.join(` ${mode} `)}`;
    sqlcount += ` WHERE ${queries.join(` ${mode} `)}`;
  }

  sql += ` limit ? offset ?`;
  params.push(limit, offset);

  db.get(sqlcount, paramscount, (err, data) => {
    const total = data.total;
    const pages = Math.ceil(total / limit);

    db.all(sql, params, (err, rows) => {
      if (err) return res.send(err);
      res.render("list", {
        data: rows,
        query: req.query,
        pages,
        page,
        offset,
        url: req.url,
      });
    });
  });
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  db.run(
    "INSERT INTO data(name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)",
    [
      req.body.name,
      req.body.height,
      req.body.weight,
      req.body.birthdate,
      JSON.parse(req.body.married),
    ],
    (err) => {
      if (err) return res.send(err);
      res.redirect("/");
    }
  );
});

app.get("/delete/:index", (req, res) => {
  db.run("DELETE FROM data WHERE id = ?", [req.params.index], (err) => {
    if (err) return res.send(err);
    res.redirect("/");
  });
});

app.get("/edit/:index", (req, res) => {
  db.get(`SELECT * FROM data WHERE id = ?`, [req.params.index], (err, data) => {
    if (err) return res.send(err);

    res.render("edit", { item: data });
  });
});

app.post("/edit/:index", (req, res) => {
  db.run(
    "UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?",
    [
      req.body.name,
      req.body.height,
      req.body.weight,
      req.body.birthdate,
      JSON.parse(req.body.married),
      req.params.index,
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      res.redirect("/");
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
