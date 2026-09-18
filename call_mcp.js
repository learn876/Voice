const { spawn } = require('child_process');
const fs = require('fs');

const agentData = JSON.parse(fs.readFileSync('patched_agent.json', 'utf-8'));

// Map context_title to title and context_body to body for the API
const mappedBreakdown = agentData.context_breakdown.map(ctx => ({
  ...ctx,
  title: ctx.context_title,
  body: ctx.context_body
}));

const rpcRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "updateAgent",
    arguments: {
      agent_id: 252539,
      requestBody: {
        context_breakdown: mappedBreakdown
      }
    }
  }
};

const mcp = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['@omnidim-ai/mcp-server'], {
  env: { ...process.env, OMNIDIM_API_KEY: 'DLOAJWjRpuyDwg9qyCBlil2QBHJCzk-qR5yFmdCFjG0' },
  shell: true
});

let output = '';

mcp.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
  mcp.kill();
});

mcp.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

mcp.on('close', (code) => {
  console.log('MCP server exited with code', code);
});

// Send the request
mcp.stdin.write(JSON.stringify(rpcRequest) + '\n');
