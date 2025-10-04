const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(require('cors')());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes')); 
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/approval', require('./routes/approval.routes'));
app.use('/api/approval-rule', require('./routes/approvalRule.routes'));
app.use("/api/users", require("./routes/user.routes"));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
