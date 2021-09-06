import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log("✅ connected to database");
const handleError = (error) => console.log(error);

db.on("error", handleError);
db.once("open", handleOpen);
