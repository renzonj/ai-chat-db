/**
 * SERVER-SIDE AI QUERY MODULE
 *
 * docs: https://ai-sdk.dev/providers/ai-sdk-providers/azure
 * This module handles all interactions with Azure OpenAI and database operations.
 * It provides functions to analyze earthquake data through natural language queries.
 */
"use server"; // This directive ensures the code only runs on the server, not the client

// Import necessary libraries
import { generateObject, LanguageModelV1Prompt } from "ai";
import { z } from "zod"; // Zod is used for schema validation
import { azure } from '@ai-sdk/azure';
import { Result } from "@/lib/type";
import db from "@/db";

/**
 * STEP 1: Environment Validation & Azure Client Setup
 *
 * We first check that all required environment variables are defined before proceeding.
 * These variables contain sensitive API keys and endpoints for Azure OpenAI.
 */
if (!process.env.AZURE_API_KEY || !process.env.AZURE_RESOURCE_NAME || !process.env.AZURE_AI_DEPLOYMENT) {
  throw new Error('Azure OpenAI environment variables are not defined');
}

// Simple test prompt to verify Azure connection
const TEST_PROMPT: LanguageModelV1Prompt = [
  { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
];

/**
 * Tests the connection to Azure OpenAI
 *
 * This function is useful for verifying API credentials are working correctly
 * and the service is available before using it in production.
 *
 * @returns Object indicating success or failure with error details
 */
export const testAzureConnection = async () => {
  try {
    console.log("Testing Azure OpenAI connection...");

    // Send a simple test message to the API
    const result = await azure(process.env.AZURE_AI_DEPLOYMENT!).doGenerate({
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    });

    console.log(`🤖: ${result.text}`)
    console.log("✅ Azure connection successful!");

    return {
      success: true,
    };
  } catch (error) {
    console.error("🚫 Azure connection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

/**
 * Generates insights from query results using AI
 *
 * This function uses Azure OpenAI to analyze the database results and
 * generate meaningful insights about the earthquake data.
 *
 * @param results - Database query results to analyze
 * @param input - Original user query for context
 * @returns Array of insight strings
 */
export const generateInsights = async (results: Result[], input: string) => {
  try {
    console.log("Generating insights from data...");

    // Don't process empty results
    if (!results || results.length === 0) {
      return [];
    }

    // Use AI to analyze results and generate insights
    const result = await generateObject({
      model: azure(process.env.AZURE_AI_DEPLOYMENT!),
      // System prompt defines the AI's role and behavior
      system: `You are a data analyst specializing in seismic data. Analyze the given earthquake data query results and provide meaningful insights. Focus on patterns, trends, and interesting observations. Keep your insights concise and data-driven.`,
      // User prompt includes the original question and the data to analyze
      prompt: `The user asked: "${input}"

      Query results: ${JSON.stringify(results, null, 2)}

      Provide 3-5 key insights about this data.`,
      // Schema defines the expected response format using Zod
      schema: z.object({
        insights: z.array(z.string()),
      }),
    });

    // Return insights or empty array if something went wrong
    if (result) {
      return result.object.insights;
    }
    return [];
  } catch (e) {
    console.error("Error generating insights:", e);
    return ["Unable to generate insights due to an error."];
  }
};

/**
 * Generates and executes a SQL query based on natural language input
 *
 * This function:
 * 1. Uses AI to convert natural language to SQL
 * 2. Ensures the SQL is safe and has proper limits
 * 3. Executes the query against the database
 *
 * @param input - User's natural language question about earthquake data
 * @returns Query results as an array of objects
 */
export const generateQuery = async (input: string) => {
  try {
    console.log("Generating SQL query...");

    // Use AI to convert natural language to SQL
    const result = await generateObject({
      model: azure(process.env.AZURE_AI_DEPLOYMENT!),
      // Detailed system prompt with guidelines for SQL generation
      system: `You are a SQL (postgres) and data visualization expert specializing in seismic data analysis. Your job is to help the user write a SQL query to retrieve the earthquake data they need.

      SCOPE RESTRICTIONS:
      - ONLY respond to requests related to earthquake data analysis using the philvolcs_earthquakes table
      - Do NOT generate queries for any topic unrelated to earthquake data
      - If the user request is unrelated to earthquake data analysis, respond ONLY with: {"query": "ERROR: This request is not related to earthquake data analysis. Please ask a question about the earthquake dataset."}
      - Before generating any query, verify the request is specifically about analyzing earthquake data

      The table schema is as follows:

      philvolcs_earthquakes (
        id SERIAL PRIMARY KEY,
        date_time_ph TIMESTAMP NOT NULL,
        latitude DECIMAL(10, 6) NOT NULL,
        longitude DECIMAL(10, 6) NOT NULL,
        depth_in_km DECIMAL(6, 2) NOT NULL,
        magnitude DECIMAL(3, 1) NOT NULL,
        location TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL
      );

      IMPORTANT: The dataset contains ONLY 2025 records total. Be mindful of the small dataset size when writing queries and setting limits.

      Only retrieval queries are allowed.

      IMPORTANT AGGREGATION RULES:
      1. For any question about frequency, popularity, or common occurrences, ALWAYS use COUNT and GROUP BY.
      2. For questions like "which cities experience frequent earthquakes", extract the city from location, count occurrences,
         and limit results (e.g., "SELECT SUBSTRING(location FROM '([^,]+)') as city, COUNT(*) as earthquake_count FROM philvolcs_earthquakes
         GROUP BY city ORDER BY earthquake_count DESC LIMIT 10;")
      3. NEVER return thousands of raw rows - always aggregate data meaningfully.
      4. EVERY QUERY MUST INCLUDE A "LIMIT 20" CLAUSE. This is not optional.

      For location-based searches, use the ILIKE operator and convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(location) ILIKE LOWER('%manila%').

      When searching for geographic areas, consider using both location field searches and coordinate-based filtering with latitude and longitude bounds.

      For magnitude queries, remember that the earthquake magnitude scale is logarithmic, with each whole number representing a 10x increase in amplitude. Categories:
      - Minor: < 4.0
      - Light: 4.0-4.9
      - Moderate: 5.0-5.9
      - Strong: 6.0-6.9
      - Major: 7.0-7.9
      - Great: ≥ 8.0

      For depth analysis, typical depth categories (in km):
      - Shallow: 0-70
      - Intermediate: 70-300
      - Deep: >300

      When analyzing temporal patterns, you can use date_trunc() functions to group by different time periods (year, month, day, hour).

      EVERY QUERY SHOULD RETURN QUANTITATIVE DATA THAT CAN BE PLOTTED ON A CHART! There should always be at least two columns of data. If the user asks for a single dimension, pair it with a relevant count, average, or other aggregation. For time-series data, ensure proper time-based grouping.

      For geographic visualizations, return both latitude and longitude. When summarizing by region, consider counting occurrences or averaging magnitudes.
      `,
      prompt: `Generate the query necessary to retrieve the earthquake data the user wants: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });

    if (!result) {
      throw new Error("Failed to generate SQL query");
    }

    // Extract the generated SQL query
    let query = result.object.query;
    console.log("Generated SQL Query:", query);

    // SECURITY: Ensure the query has a LIMIT clause to prevent too many results
    query = ensureQueryHasLimit(query);

    // Execute the query and return results
    const queryResults = await runGenerateSQLQuery(query);
    console.log("Query Results:", queryResults);
    return queryResults;
  } catch (e) {
    console.error("Error generating or executing query:", e);
    throw new Error("Failed to generate or execute query: " + (e instanceof Error ? e.message : "Unknown error"));
  }
};

/**
 * Helper function to ensure SQL query has a proper LIMIT clause
 *
 * @param query - SQL query to check and modify
 * @returns SQL query with appropriate LIMIT clause
 */
function ensureQueryHasLimit(query: string): string {
  // Check if the query doesn't already have a LIMIT clause and add it
  if (!query.toLowerCase().includes("limit")) {
    // Check if query ends with semicolon
    if (query.trim().endsWith(";")) {
      query = query.trim().slice(0, -1) + " LIMIT 20;";
    } else {
      query = query.trim() + " LIMIT 20;";
    }
    console.log("Modified SQL Query with LIMIT:", query);
  } else {
    // If the query already has a LIMIT clause, ensure it's not greater than 20
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch && parseInt(limitMatch[1]) > 20) {
      query = query.replace(/LIMIT\s+\d+/i, "LIMIT 20");
      console.log("Modified SQL Query with reduced LIMIT:", query);
    }
  }

  return query;
}

/**
 * Main function to analyze earthquake data based on user input
 *
 * This function orchestrates the complete workflow:
 * 1. Generate and execute SQL query from natural language
 * 2. Generate insights from the query results
 * 3. Return combined results and insights
 *
 * @param input - User's natural language query about earthquakes
 * @returns Object containing query results and AI-generated insights
 */
export const analyzeEarthquakeData = async (input: string) => {
  try {
    // Step 1: Generate and execute the SQL query
    const queryResults = await generateQuery(input);

    // Handle empty results case
    if (!queryResults || queryResults.length === 0) {
      return {
        results: [],
        insights: []
      };
    }

    // Step 2: Generate insights based on the results
    const insights = await generateInsights(queryResults, input);

    // Step 3: Return combined results
    return {
      results: queryResults,
      insights
    };
  } catch (e) {
    console.error("Error analyzing earthquake data:", e);
    throw new Error("Failed to analyze earthquake data: " + (e instanceof Error ? e.message : "Unknown error"));
  }
};

/**
 * Executes a SQL query with security validations
 *
 * This function enforces security by:
 * 1. Ensuring only SELECT queries are allowed
 * 2. Checking for dangerous SQL operations
 * 3. Handling errors gracefully
 *
 * @param query - SQL query to execute
 * @returns Query results as an array of objects
 */
export const runGenerateSQLQuery = async (query: string) => {
  "use server"; // Ensures this only runs on the server

  // SECURITY: Check if the query is a SELECT statement
  if (!query.trim().toLowerCase().startsWith("select")) {
    throw new Error("Only SELECT queries are allowed");
  }

  // SECURITY: Block potentially harmful SQL operations
  const forbiddenOperations = [
    "drop", "delete", "insert", "update", "alter",
    "truncate", "create", "grant", "revoke"
  ];

  // Check each forbidden operation
  for (const operation of forbiddenOperations) {
    if (query.trim().toLowerCase().includes(operation)) {
      throw new Error(`SQL operation '${operation}' is not allowed`);
    }
  }

  // Execute the query and return results
  try {
    const data = await db.execute(query);
    return data.rows as Result[];
  } catch (e: any) {
    console.error("Error executing query:", e);
    throw new Error("Failed to execute query");
  }
};
