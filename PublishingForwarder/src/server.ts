import "reflect-metadata";
import { config } from "dotenv";

import setupApplication from "./setup/app";

config();

const server = setupApplication();

const port = process.env.PORT || process.argv[2] || 5002;

server.listen(port, () => {
  console.log(`Angelos Publisher Forwarder running on PORT ${port}`);
});
