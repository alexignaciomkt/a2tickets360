
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client, Databases, Users, Storage, ID } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://banco.euattendo.com.br/v1";
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "69ad87225fa699a67720";
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY!);

const databases = new Databases(client);
const users = new Users(client);
const storage = new Storage(client);

const server = new Server(
    {
        name: "a2-appwrite-manager",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_database",
                description: "Creates a new database in Appwrite",
                inputSchema: {
                    type: "object",
                    properties: {
                        databaseId: { type: "string" },
                        name: { type: "string" },
                    },
                    required: ["databaseId", "name"],
                },
            },
            {
                name: "create_collection",
                description: "Creates a new collection in a database",
                inputSchema: {
                    type: "object",
                    properties: {
                        databaseId: { type: "string" },
                        collectionId: { type: "string" },
                        name: { type: "string" },
                    },
                    required: ["databaseId", "collectionId", "name"],
                },
            },
            {
                name: "create_string_attribute",
                description: "Adds a string attribute to a collection",
                inputSchema: {
                    type: "object",
                    properties: {
                        databaseId: { type: "string" },
                        collectionId: { type: "string" },
                        key: { type: "string" },
                        size: { type: "number", default: 255 },
                        required: { type: "boolean", default: false },
                        defaultValue: { type: "string" },
                    },
                    required: ["databaseId", "collectionId", "key", "size"],
                },
            },
            {
                name: "create_boolean_attribute",
                description: "Adds a boolean attribute to a collection",
                inputSchema: {
                    type: "object",
                    properties: {
                        databaseId: { type: "string" },
                        collectionId: { type: "string" },
                        key: { type: "string" },
                        required: { type: "boolean", default: false },
                        defaultValue: { type: "boolean" },
                    },
                    required: ["databaseId", "collectionId", "key"],
                },
            },
            {
                name: "create_integer_attribute",
                description: "Adds an integer attribute to a collection",
                inputSchema: {
                    type: "object",
                    properties: {
                        databaseId: { type: "string" },
                        collectionId: { type: "string" },
                        key: { type: "string" },
                        required: { type: "boolean", default: false },
                        min: { type: "number" },
                        max: { type: "number" },
                        defaultValue: { type: "number" },
                    },
                    required: ["databaseId", "collectionId", "key"],
                },
            },
            {
                name: "list_collections",
                description: "Lists collections in a database",
                inputSchema: {
                    type: "object",
                    properties: {
                        databaseId: { type: "string" },
                    },
                    required: ["databaseId"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "create_database": {
                const result = await databases.create(args?.databaseId as string, args?.name as string);
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            case "create_collection": {
                const result = await databases.createCollection(
                    args?.databaseId as string,
                    args?.collectionId as string,
                    args?.name as string
                );
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            case "create_string_attribute": {
                const result = await databases.createStringAttribute(
                    args?.databaseId as string,
                    args?.collectionId as string,
                    args?.key as string,
                    args?.size as number,
                    args?.required as boolean,
                    args?.defaultValue as string
                );
                return { content: [{ type: "text", text: "Attribute creation initiated" }] };
            }
            case "create_boolean_attribute": {
                const result = await databases.createBooleanAttribute(
                    args?.databaseId as string,
                    args?.collectionId as string,
                    args?.key as string,
                    args?.required as boolean,
                    args?.defaultValue as boolean
                );
                return { content: [{ type: "text", text: "Attribute creation initiated" }] };
            }
            case "create_integer_attribute": {
                const result = await databases.createIntegerAttribute(
                    args?.databaseId as string,
                    args?.collectionId as string,
                    args?.key as string,
                    args?.required as boolean,
                    args?.min as number,
                    args?.max as number,
                    args?.defaultValue as number
                );
                return { content: [{ type: "text", text: "Attribute creation initiated" }] };
            }
            case "list_collections": {
                const result = await databases.listCollections(args?.databaseId as string);
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error: any) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("A2 Appwrite MCP Server running on stdio");
}

run().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
