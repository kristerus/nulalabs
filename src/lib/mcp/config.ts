import fs from 'fs';
import path from 'path';

export type MCPServerConfig = {
  command: string;
  args: string[];
  env?: Record<string, string>;
};

export type MCPConfig = {
  mcpServers: Record<string, MCPServerConfig>;
};

export function loadMCPConfig(): MCPConfig {
  const configPath = path.join(process.cwd(), 'mcp-config.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('MCP configuration not found. Create mcp-config.json');
  }
  
  const configContent = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configContent) as MCPConfig;
}

export function getFirstServerConfig(config: MCPConfig) {
  const [name, serverConfig] = Object.entries(config.mcpServers)[0];
  return { name, config: serverConfig };
}