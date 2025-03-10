const dbConnection = require("../config/db");

exports.getPlaces = async (req, res, next) => {
  try {
    const [rows] = await dbConnection.query("SELECT * FROM new_place");
    res
      .status(200)
      .json({
        status: "Success",
        message: "Data fetched successfully",
        data: rows,
      });
  } catch (error) {
    next(error);
  }
};

exports.addPlace = async (req, res, next) => {
  try {
    const { placeTitle, placeDes, placeImage } = req.body;
    const [result] = await dbConnection.query(
      "INSERT INTO new_place (placeTitle, placeDes, placeImage) VALUES (?, ?, ?)",
      [placeTitle, placeDes, placeImage]
    );
    res
      .status(200)
      .json({
        status: "Success",
        message: "Data added successfully",
        data: { id: result.insertId, placeTitle, placeDes, placeImage },
      });
  } catch (error) {
    next(error);
  }
};
