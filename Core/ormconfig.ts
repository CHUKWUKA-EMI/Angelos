import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./src/Entities/User";
import { Topic } from "./src/Entities/Topic";
import { Subscription } from "./src/Entities/Subscription";

config();

// const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
// const databaseUrl = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  // url: databaseUrl,
  synchronize: false,
  logging: true,
  migrationsRun: false,
  entities: [User, Topic, Subscription],
  migrations: ["build/src/migration/*.js"],
  ssl: {
    rejectUnauthorized: false,
  },
});

if (!dataSource.isInitialized) {
  dataSource
    .initialize()
    .then(() => console.log(`Database connected.`))
    .catch((err) =>
      console.log(`Error initializing database connection : ${err}`)
    );
}

export default dataSource;
