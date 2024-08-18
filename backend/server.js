const express = require("express");
const app = express();
const fs = require("fs-extra");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(bodyParser.json());

// Define the directory to store images
const imagesDir = path.join(__dirname, "uploads/images");

fs.ensureDirSync(imagesDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const dbFile = "db.json";

const saveData = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
};

const loadData = () => {
  if (!fs.existsSync(dbFile)) {
    saveData([]);
    return [];
  }
  const rawData = fs.readFileSync(dbFile, "utf-8");
  if (!rawData) {
    saveData([]);
    return [];
  }
  return JSON.parse(rawData);
};

app.use("/uploads/images", express.static(imagesDir));

// GET items
app.get("/api/items", (req, res) => {
  const items = loadData();
  const today = new Date();

  const filteredItems = items.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === today.getFullYear() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getDate() === today.getDate()
    );
  });

  res.json(filteredItems);
});

// POST item
app.post("/api/items", (req, res) => {
  const items = loadData();
  const newItem = req.body;
  newItem._id = items.length + 1; // Assign an ID
  items.push(newItem);
  saveData(items);
  res.status(201).json(newItem);
});

// POST image upload to the server using multer
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (req.file) {
    const imagePath = `/uploads/images/${req.file.filename}`;
    res.json({ imagePath });
  } else {
    res.status(400).json({ error: "No file uploaded" });
  }
});

// PUT update item  
app.put("/api/items/update", (req, res) => {
  const items = loadData(); 
  const updatedItem = req.body; 
  const index = items.findIndex((item) => item._id === updatedItem._id);

  if (index !== -1) {
    items[index] = { ...items[index], ...updatedItem };
    saveData(items);
    res.status(200).json(updatedItem); 
  } else {
    res.status(404).json({ message: "Item not found" }); 
  }
});

// Delete item and delete its image
app.delete("/api/items/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const items = loadData();

  const index = items.findIndex((item) => item._id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  const imagePath = path.join(imagesDir, path.basename(items[index].image));
  try {
    await fs.remove(imagePath);
    console.log(`Image ${imagePath} deleted successfully`);
  } catch (err) {
    console.error(`Error deleting image ${imagePath}:`, err);
  }

  items.splice(index, 1);
  saveData(items);
  res.status(200).json({ message: "Item deleted successfully" });
});

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));
