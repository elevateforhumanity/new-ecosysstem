import axios from "axios";

const api = axios.create({
  baseURL: "https://api.cloudflare.com/client/v4",
  headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` }
});

export async function upsertDns({
  zoneId,
  type,
  name,
  content,
  proxied = true,
  ttl = 120
}: {
  zoneId: string;
  type: "A" | "AAAA" | "CNAME" | "TXT";
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
}) {
  const list = await api.get(`/zones/${zoneId}/dns_records`, { params: { type, name } });
  const existing = list.data.result?.[0];
  
  if (existing) {
    return api.put(`/zones/${zoneId}/dns_records/${existing.id}`, {
      type,
      name,
      content,
      proxied,
      ttl
    });
  }
  
  return api.post(`/zones/${zoneId}/dns_records`, {
    type,
    name,
    content,
    proxied,
    ttl
  });
}

export async function purgeCache(zoneId: string, files?: string[]) {
  if (files?.length) {
    return api.post(`/zones/${zoneId}/purge_cache`, { files });
  }
  return api.post(`/zones/${zoneId}/purge_cache`, { purge_everything: true });
}

export async function createPagesProject({
  accountId,
  name,
  productionBranch = "main",
  buildCommand,
  buildOutputDirectory
}: {
  accountId: string;
  name: string;
  productionBranch?: string;
  buildCommand: string;
  buildOutputDirectory: string;
}) {
  return api.post(`/accounts/${accountId}/pages/projects`, {
    name,
    production_branch: productionBranch,
    build_config: {
      build_command: buildCommand,
      destination_dir: buildOutputDirectory
    }
  });
}

export async function deployPages({
  accountId,
  projectName,
  branch = "main"
}: {
  accountId: string;
  projectName: string;
  branch?: string;
}) {
  return api.post(`/accounts/${accountId}/pages/projects/${projectName}/deployments`, {
    branch
  });
}
