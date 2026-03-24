const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { log } = require("node:console");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(express.static(path.join(_dirname, "../public"));


const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "jishith2005",
    database: "mydb"
});

app.post("/api/signup", signup);
app.post("/api/signin", signin);

async function signup(req, res) {
    const { name, email, password } = req.body;
    console.log(req.body);

    if (!name || !email || !password) {
        return res.status(400).json({ ok: false, message: "invalid input" });
    }
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        let sql = "SELECT * FROM users WHERE user_email = ?";
        const [rows] = await pool.execute(sql, [email]);
        if (rows[0].user_email === email) {
            return res.status(409).json({ok: false, message: "User already exists. Please login"});
        } else {
        sql = "INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)";
        const [result] = await pool.execute(sql, [name, email, hashPassword]);
        if (result.affectedRows) {
            return res.status(201).json({ ok: true, message: "User Created" });
        }
    }
    } catch (e) {
        console.log(e);
        res.status(500).json({ ok: false, message: "internal server error" });
    }
}

async function signin(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ ok: false, message: "invalid input" });
    }
    try {
        let sql = "SELECT * FROM users WHERE user_email = ?";
        const [rows] = await pool.execute(sql, [email]);
        const row = rows[0];
        const serverEmail = row.user_email;
        const hashPassword = row.user_password;
        const match = await bcrypt.compare(password, hashPassword);

        if (match && serverEmail === email) {
            const token = jwt.sign({ name: row.user_name }, JWT_SECRET, { expiresIn: "1h" });
            return res.status(200).json({ ok: true, message: "sign in successfull", token });
        } else {
            return res.status(401).json({ ok: false, message: "invalid credentials" });
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({ ok: false, message: "internal server error" });
    }
}

app.listen(PORT, "0.0.0.0", () => console.log("server running http://localhost:3000/"));
