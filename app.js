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

// Fetch profile GET request
app.get("/profile", async (req, res, next) => {
  try {
    const [rows] = await dbConnection.query("SELECT * FROM user_profile");
    rows.forEach((row) => {
      try {
        row.photo = JSON.parse(row.photo);
      } catch (error) {
        console.error("JSON Parse Error for photo:", error.message);
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

/// user profile update post request
app.post("/profile_update", upload.single("photo"), async (req, res, next) => {
  try {
    const { name, phone, email, nationality } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        status: "error",
        message: `Missing required fields. Please check ${name} or ${phone}`,
      });
    }

    let photo = "";
    if (req.file) {
      photo = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    const [result] = await dbConnection.query(
      "INSERT INTO user_profile (name, phone, email, nationality, photo) VALUES (?, ?, ?, ?, ?)",
      [name, phone, email, nationality, JSON.stringify(photo)]
    );
    res.status(200).json({
      status: "Success",
      message: "Data added successfully",
      data: {
        id: result.insertId,
        name,
        phone,
        email,
        nationality,
        photo,
      },
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
      const { placeTitle, placeLocation, placeDes } = req.body;
      if (
        !placeTitle ||
        !placeLocation ||
        !placeDes ||
        !req.files ||
        req.files.length === 0
      ) {
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
        "INSERT INTO new_place (placeTitle, placeDes, placeImage, placeLocation) VALUES (?, ?, ?, ?)",
        [placeTitle, placeDes, JSON.stringify(placeImage), placeLocation]
      );
      res.status(201).json({
        status: "Success",
        message: "Data added successfully",
        data: {
          id: result.insertId,
          placeTitle,
          placeLocation,
          placeDes,
          placeImage,
        },
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
