import app from "./app";

// import {getConnection} from "./database";
// getConnection();

app.listen(app.get("port"), () => {
  console.log("Server on Port " + app.get("port"));
});
