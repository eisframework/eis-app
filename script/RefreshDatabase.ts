import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as readline from "readline";

const environments = ['dev', 'test', 'production'];

class Command {
   public args: string[] = [];
   public commandName = "db:refresh";

   public run() {
      const databases = environments.map(env => ({
         name: env.charAt(0).toUpperCase() + env.slice(1),
         file: `./data/${env}.sqlite`,
         env: env
      }));

      console.log("\n📦 Available Databases:");
      console.log("─────────────────────────");
      databases.forEach((db, index) => {
         const exists = fs.existsSync(db.file);
         const status = exists ? "✓" : "✗";
         console.log(`${index + 1}. ${db.name} (${db.file}) ${status}`);
      });
      console.log("─────────────────────────\n");

      const selection = this.args[1];

      if (!selection) {
         const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
         });

         rl.question("Select database number (1-3): ", (answer) => {
            rl.close();
            const index = parseInt(answer) - 1;
            
            if (isNaN(index) || index < 0 || index >= databases.length) {
               console.log("❌ Invalid selection");
               process.exit(1);
            }

            this.refreshDatabase(databases[index]);
         });
         return;
      }

      const index = parseInt(selection) - 1;

      if (isNaN(index) || index < 0 || index >= databases.length) {
         console.log("❌ Invalid selection");
         process.exit(1);
      }

      this.refreshDatabase(databases[index]);
   }

   private refreshDatabase(selectedDb: { name: string; file: string; env: string }) {

      console.log(`\n🔄 Refreshing ${selectedDb.name} database...`);
      console.log(`   File: ${selectedDb.file}\n`);

      const dbPath = path.resolve(selectedDb.file);

      if (fs.existsSync(dbPath)) {
         fs.unlinkSync(dbPath);
         console.log("✅ Database file deleted");
      } else {
         console.log("ℹ️  Database file doesn't exist, skipping deletion");
      }

      const dataDir = path.resolve("./data");
      if (!fs.existsSync(dataDir)) {
         fs.mkdirSync(dataDir, { recursive: true });
         console.log("✅ Data directory created");
      }

      console.log("\n🚀 Running migrations...\n");

      try {
         execSync("bun run backend/database/migrate.ts", {
            stdio: "inherit",
            env: { ...process.env, NODE_ENV: selectedDb.env, DB_PATH: selectedDb.file }
         });
         console.log("\n✅ Database refreshed successfully!");
      } catch (error) {
         console.error("\n❌ Migration failed:", error);
         process.exit(1);
      }
   }
}

const cmd = new Command();
cmd.args = ["", ...process.argv.slice(2)];
cmd.run();

export default new Command();
