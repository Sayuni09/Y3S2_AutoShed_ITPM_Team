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


const licLecAvailabilityRoutes = require('./routes/LIC_Routes/Lic_LecAvailabilityRoutes');
const licExAvailabilityRoutes = require('./routes/LIC_Routes/Lic_ExAvailabilityRoutes');
const licLecDetailsRoutes = require('./routes/LIC_Routes/Lic_LecDetailsRoutes'); 
const licExDetailsRoutes = require('./routes/LIC_Routes/Lic_ExDetailsRoutes'); 
const licTimeSlotsRoutes = require('./routes/LIC_Routes/LicTimeSlotsRoutes');
const licBatchDetailsRoutes = require('./routes/LIC_Routes/Lic_BatchDetailsRoutes');
const licNewSchedulesRoutes = require('./routes/LIC_Routes/LicNewSchedulesRoutes');
const licRescheduleRoutes = require('./routes/LIC_Routes/LicRescheduleRoutes');
const messageHistoryRoutes = require('./routes/LIC_Routes/MessageHistoryRoutes');

const lecAvailabilityRoutes = require('./routes/LEC_Routes/LecAvailabilityRoutes');
const lecNewSchedulesRoutes = require('./routes/LEC_Routes/LecNewSchedulesRoutes');
const lecAcceptedRoutes = require('./routes/LEC_Routes/LecAcceptedRoutes');
const lecRequestRoutes = require('./routes/LEC_Routes/LecRequestRoutes');
const lecCalendarRoutes = require('./routes/LEC_Routes/LecCalendarRoutes');


const exAvailabilityRoutes = require('./routes/EX_Routes/ExAvailabilityRoutes');
const exNewSchedulesRoutes = require('./routes/EX_Routes/ExNewSchedulesRoutes');
const exAcceptedRoutes = require('./routes/EX_Routes/ExAcceptedRoutes');
const exRequestRoutes = require('./routes/EX_Routes/ExRequestRoutes');
const exCalendarRoutes = require('./routes/EX_Routes/ExCalendarRoutes');




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

app.use('/api', licLecAvailabilityRoutes);
app.use('/api/lic/examiner-availability', licExAvailabilityRoutes);
app.use('/api/lic/lecturers', licLecDetailsRoutes); 
app.use('/api/lic', licExDetailsRoutes);
app.use('/api/lic', licTimeSlotsRoutes);
app.use('/api/lic/batch-details', licBatchDetailsRoutes);
app.use('/api/lic', licNewSchedulesRoutes);
app.use('/api/lic', messageHistoryRoutes);
app.use('/api/lic', licRescheduleRoutes);


app.use('/api/lec/accepted', lecAcceptedRoutes); 
app.use('/api/lec', lecRequestRoutes);
app.use('/api/lec', lecCalendarRoutes);
app.use('/api/lecturer-availability', lecAvailabilityRoutes); 
app.use('/api/lec', lecNewSchedulesRoutes);


app.use('/api/examiner-availability', exAvailabilityRoutes);
app.use('/api/ex', exNewSchedulesRoutes); 
app.use('/api/ex/accepted', exAcceptedRoutes);
app.use('/api/ex', exRequestRoutes);
app.use('/api/ex', exCalendarRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));