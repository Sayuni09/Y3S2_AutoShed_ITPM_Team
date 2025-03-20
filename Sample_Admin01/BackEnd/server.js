const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const licAuthRoutes = require("./routes/lic_authRoutes");
const lecAuthRoutes = require("./routes/lec_authRoutes");
const exAuthRoutes = require("./routes/ex_authRoutes"); 
const adminRoutes = require("./routes/adminRoutes");
const lecturerRoutes = require("./routes/lecturerRoutes");
const licRoutes = require("./routes/licRoutes");
const examinerRoutes = require("./routes/examinerRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/lic/auth", licAuthRoutes);
app.use("/api/lec/auth", lecAuthRoutes);
app.use("/api/ex/auth", exAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/lic", licRoutes);
app.use("/api/examiners", examinerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));