const express = require("express");
const env = require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = 3000;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;


const connection = mysql.createPool({
  host: "localhost",
  user,
  password,
  database,
});

  app.post("/create-user", async (req, res) => {
    try {
      const { email, password } = req.body;
      let sql = "SELECT * FROM users WHERE user_email = ?";
      const [rows] = await connection.execute(sql, [email]);
      if (rows.length === 1) {
        res.status(409).json({ ok: false, message: "User already exists" });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = "INSERT INTO users (user_email, user_password) VALUES (?, ?)";
      const [result] = await connection.execute(sql, [email, hashedPassword]);
      if (result.affectedRows) {
        res
          .status(201)
          .json({ ok: true, message: "successfully created user" });
      } else {
        res.status(500).json({ ok: false, message: "internal server error" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ ok: false, message: "server error" });
    }
  });

  app.post('/signin', async(req, res) => {
    try {
    const {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ok: false, message:"invalid input"});
    }
    const sql = 'SELECT * FROM users';
    const [rows] = await connection.execute(sql);
    const match = await bcrypt.compare(password, rows[0].user_password);
    if (email === rows[0].user_email && match) {
      const token = jwt.sign({email: rows[0].user_email}, JWT_SECRET, {expiresIn: '1h'});
      res.status(200).json({ok: true, message: 'successfully login', token});
    } else {
      res.status(401).json({ok: false, message: 'Invalid credentials'});
    }
  } catch(e) {
    console.log('failed to signin', e);
    res.status(500).json({ok: false, message: 'server error'});
  }
  })

app.get("/", (req, res) => {
  res.send("Hello World");
});

async function auth(req, res, next) {
  try {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    res.status(401).json({ok: false, message: 'no token'});
    return;
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  res.user = decoded;
  next();
} catch(e) {
  res.status(500).json({ok: false, message: 'server error'});
}
}

app.get('/users/profile', auth, (req, res) => {
  res.status(200).json({ok: true, data: res.user});
})

app.listen(process.env.PORT || PORT, () =>
  console.log("server running: http://localhost:3000"),
);
