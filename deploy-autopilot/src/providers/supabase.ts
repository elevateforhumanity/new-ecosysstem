import axios from "axios";
import fs from "fs";

const api = axios.create({
  baseURL: "https://api.supabase.com/v1",
  headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}` }
});

// Run SQL via the Postgres query endpoint
export async function runSql(projectRef: string, sql: string) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const { data } = await axios.post(
    url,
    { query: sql },
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

// Run SQL from a file
export async function runSqlFile(projectRef: string, filePath: string) {
  const sql = fs.readFileSync(filePath, "utf8");
  return runSql(projectRef, sql);
}

// Create a storage bucket
export async function createBucket(
  projectRef: string,
  bucket: string,
  public_ = false
) {
  const url = `https://${projectRef}.supabase.co/storage/v1/bucket`;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  
  const { data } = await axios.post(
    url,
    { name: bucket, public: public_ },
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`
      }
    }
  );
  return data;
}

// List all projects
export async function listProjects() {
  const { data } = await api.get("/projects");
  return data;
}

// Get project details
export async function getProject(projectRef: string) {
  const { data } = await api.get(`/projects/${projectRef}`);
  return data;
}

// Create database migration
export async function createMigration(projectRef: string, name: string, sql: string) {
  const { data } = await api.post(`/projects/${projectRef}/database/migrations`, {
    name,
    statements: [{ statement: sql }]
  });
  return data;
}

// Apply pending migrations
export async function applyMigrations(projectRef: string) {
  const { data } = await api.post(`/projects/${projectRef}/database/migrations/apply`);
  return data;
}
