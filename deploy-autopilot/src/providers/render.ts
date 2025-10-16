import axios from "axios";

const api = axios.create({
  baseURL: "https://api.render.com/v1",
  headers: { Authorization: `Bearer ${process.env.RENDER_API_KEY}` }
});

export async function listServices() {
  const { data } = await api.get("/services");
  return data;
}

export async function getService(serviceId: string) {
  const { data } = await api.get(`/services/${serviceId}`);
  return data;
}

export async function triggerDeploy(serviceId: string, clearCache = true) {
  const { data } = await api.post(`/services/${serviceId}/deploys`, {
    clearCache
  });
  return data;
}

export async function createService({
  name,
  type = "web_service",
  repo,
  branch = "main",
  rootDir,
  buildCommand,
  startCommand,
  envVars = []
}: {
  name: string;
  type?: string;
  repo: string;
  branch?: string;
  rootDir?: string;
  buildCommand: string;
  startCommand: string;
  envVars?: Array<{ key: string; value: string }>;
}) {
  const { data } = await api.post("/services", {
    type,
    name,
    repo,
    branch,
    rootDir,
    buildCommand,
    startCommand,
    envVars
  });
  return data;
}

export async function updateEnvVars(serviceId: string, envVars: Array<{ key: string; value: string }>) {
  const { data } = await api.put(`/services/${serviceId}/env-vars`, envVars);
  return data;
}

export async function getDeployStatus(serviceId: string, deployId: string) {
  const { data } = await api.get(`/services/${serviceId}/deploys/${deployId}`);
  return data;
}
