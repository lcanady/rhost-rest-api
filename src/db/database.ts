import { Database } from "arangojs";
import { ArangoCollection } from "arangojs/lib/cjs/collection";

export class DB {
  private db: Database;
  stats: any;
  constructor() {
    this.db = new Database(process.env.DB_ADDRESS);
    this.stats = this.collection("stats");
  }

  /**
   * Query the database using AQL.
   * @param aql The Database query to execute.
   */
  query(aql) {
    return this.db.query(aql);
  }

  /**
   * Load a collection into memory.
   * @param name The name of the eollection to load.
   */
  collection(name) {
    return this.db.collection(name);
  }

  /**
   * List all collections connected to the database.
   */
  listcollections() {
    return this.db.listCollections();
  }

  /**
   * Establish the database to connect too, and create it if needed.
   */
  async start() {
    this.db.useBasicAuth(process.env.DB_USER, process.env.DB_PASSWORD);
    const dbs = await this.db.listDatabases();
    const dbName = process.env.DB_NAME || "rhost_DB";

    // Check to see if the database exists or not.
    if (dbs.indexOf(dbName) !== -1) {
      this.db.useDatabase(dbName);
      console.log(`Arango database '${dbName}' Established.`);
    } else {
      // New DB.  Create it.
      await this.db.createDatabase(dbName).catch(error => console.error(error));
      this.db.useDatabase(dbName);
      console.log(`Arango database '${dbName}' Established.`);
    }

    // Create the stats collection
    await this.stats.create().catch(async () => {
      // Collection already exists. Try to ping it to see if it's working.
      await this.stats.get().catch((error: Error) => console.error(error));
    });
    // New collection created.  Ping it to make sure it's working.
    await this.stats.get().catch((error: Error) => console.error(error));
    console.log("Collection 'Stats' loaded.");
    return this;
  }
}

export default new DB();
