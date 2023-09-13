import "reflect-metadata";
import { config } from "dotenv";
import setupApplication from "./startup/app";

config();

const server = setupApplication();

const port = process.env.PORT || 5001;

server.listen(port, () => {
  console.log(`Server listening on PORT ${port}`);
});
