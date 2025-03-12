const express = require("express");
const multer = require("multer");
const path = require("path");
const dbConnection = require("./db_connection");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Test db Connection
dbConnection
  .query("SELECT 1")
  .then(() => console.log("MySQL Connected"))
  .catch((err) => console.error("MySQL Connection Error:", err));

// Fetch new place GET request
app.get("/new_place", async (req, res, next) => {
  try {
    const [rows] = await dbConnection.query("SELECT * FROM new_place");
    rows.forEach((row) => {
      try {
        row.placeImage = JSON.parse(row.placeImage);
      } catch (error) {
        console.error("JSON Parse Error for placeImage:", error.message);
      }
    });
    res.status(200).json({
      status: "Success",
      message: "Data fetched successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
});

// Add new place POST request
app.post(
  "/add_new_place",
  upload.array("placeImage", 5),
  async (req, res, next) => {
    try {
      const { placeTitle, placeDes } = req.body;
      if (!placeTitle || !placeDes || !req.files || req.files.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields",
        });
      }
      const placeImage = req.files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      );
      const [result] = await dbConnection.query(
        "INSERT INTO new_place (placeTitle, placeDes, placeImage) VALUES (?, ?, ?)",
        [placeTitle, placeDes, JSON.stringify(placeImage)]
      );
      res.status(201).json({
        status: "Success",
        message: "Data added successfully",
        data: { id: result.insertId, placeTitle, placeDes, placeImage },
      });
    } catch (error) {
      next(error);
    }
  }
);

// 404 Middleware
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
