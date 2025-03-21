import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

process.env.CACHE_DIR = import.meta.dirname + "/cache";

const server = new McpServer({
  name: "storybook",
  version: "1.0.0",
});

server.tool(
  "get-stories",
  "Get stories from storybook",
  {
    configDir: z
      .string()
      .min(1)
      .describe(
        "The absolute path to directory containing the .storybook config folder"
      ),
  },
  async ({ configDir }) => {
    const { buildIndex } = await import("storybook/internal/core-server");

    const index = await buildIndex({
      configDir,
    });

    const content = Object.entries(index.entries)
      .filter(([_, entry]) => entry.type === "story")
      .map(([_storyId, entry]) => `${entry.title}/${entry.name}`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  }
);

// server.tool(
//   'go-to-story',
//   'Go to a story',
//   {
//     storyKind: z.string(),
//     storyName: z.string(),
//   },
//   async ({ storyKind, storyName }) => {
//     const storyId = toId(storyKind, storyName);
//     return {
//       content: [],
//     };
//   }
// );

async function main() {
  const transport = new StdioServerTransport();
  console.error("Server starting...");
  await server.connect(transport);
  console.error("Server started successfully");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
