import "dotenv/config";
import fs from "fs";
import yaml from "js-yaml";
import ora from "ora";
import { z } from "zod";
import { upsertDns, purgeCache, deployPages } from "./providers/cloudflare.js";
import { listServices, triggerDeploy, getDeployStatus } from "./providers/render.js";
import { runSql, runSqlFile, createBucket } from "./providers/supabase.js";

const schema = z.object({
  tasks: z.array(
    z.object({
      type: z.string(),
      args: z.any().optional()
    })
  )
});

const argv = process.argv.slice(2);
const cfgPath = argv.includes("--config")
  ? argv[argv.indexOf("--config") + 1]
  : "tasks.yaml";
const dry = argv.includes("--dry");

const doc = yaml.load(fs.readFileSync(cfgPath, "utf8"));
const { tasks } = schema.parse(doc);

async function run() {
  console.log(`\n🚀 EFH Deployment Autopilot ${dry ? "(DRY RUN)" : ""}\n`);

  for (const t of tasks) {
    const s = ora(`Running ${t.type}`).start();
    try {
      if (dry) {
        s.succeed(`DRY: ${t.type} ${JSON.stringify(t.args || {})}`);
        continue;
      }

      switch (t.type) {
        // Cloudflare tasks
        case "cloudflare.dns_upsert":
          await upsertDns({
            zoneId: process.env.CLOUDFLARE_ZONE_ID!,
            ...t.args
          });
          break;

        case "cloudflare.purge":
          await purgeCache(process.env.CLOUDFLARE_ZONE_ID!, t.args?.files);
          break;

        case "cloudflare.deploy_pages":
          await deployPages({
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
            projectName: t.args.projectName,
            branch: t.args.branch
          });
          break;

        // Render tasks
        case "render.list":
          const services = await listServices();
          console.log(`\n  Found ${services.length} services`);
          break;

        case "render.redeploy":
          const deploy = await triggerDeploy(t.args.serviceId, t.args.clearCache);
          s.text = `Deploying ${t.args.serviceId} (${deploy.id})`;
          break;

        case "render.wait_deploy":
          let status = "building";
          while (status === "building" || status === "uploading") {
            await new Promise((r) => setTimeout(r, 5000));
            const deployStatus = await getDeployStatus(
              t.args.serviceId,
              t.args.deployId
            );
            status = deployStatus.status;
            s.text = `Waiting for deploy: ${status}`;
          }
          if (status !== "live") {
            throw new Error(`Deploy failed with status: ${status}`);
          }
          break;

        // Supabase tasks
        case "supabase.sql":
          await runSql(process.env.SUPABASE_PROJECT_REF!, t.args.sql);
          break;

        case "supabase.sql_file":
          await runSqlFile(process.env.SUPABASE_PROJECT_REF!, t.args.file);
          break;

        case "supabase.create_bucket":
          await createBucket(
            process.env.SUPABASE_PROJECT_REF!,
            t.args.name,
            t.args.public
          );
          break;

        default:
          throw new Error(`Unknown task: ${t.type}`);
      }

      s.succeed(`✅ Done: ${t.type}`);
    } catch (e: any) {
      s.fail(`❌ ${t.type} failed: ${e.message}`);
      if (e.response?.data) {
        console.error("  API Error:", JSON.stringify(e.response.data, null, 2));
      }
      process.exitCode = 1;
      if (!t.args?.continueOnError) {
        break; // Stop on first error unless continueOnError is true
      }
    }
  }

  console.log(
    `\n${process.exitCode ? "❌ Deployment failed" : "✅ Deployment complete"}\n`
  );
}

run();
