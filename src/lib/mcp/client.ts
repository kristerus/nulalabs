import { experimental_createMCPClient as createMCPClient } from 'ai';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { loadMCPConfig, getFirstServerConfig } from './config';

let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;

export async function getMCPClient() {
  if (mcpClient) {
    return mcpClient;
  }

  const config = loadMCPConfig();
  const serverConfig = getFirstServerConfig(config);

  console.log('[MCP] Connecting to:', serverConfig.name);

  // Use AI SDK's createMCPClient
  mcpClient = await createMCPClient({
    transport: new StdioClientTransport({
      command: serverConfig.config.command,
      args: serverConfig.config.args,
      env: serverConfig.config.env,
    }),
  });

  console.log(`[MCP] Connected to ${serverConfig.name}`);
  
  return mcpClient;
}