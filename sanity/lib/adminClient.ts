import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";
import baseUrl from "@/lib/baseUrl";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for admin operations
  token: process.env.SANITY_WEBHOOK_TOKEN || process.env.SANITY_API_ADMIN_TOKEN,
});

// Log token status for debugging (remove in production)
const token = process.env.SANITY_WEBHOOK_TOKEN || process.env.SANITY_API_ADMIN_TOKEN;
if (!token) {
  console.error("No Sanity admin token found!");
} else {
  console.log("Sanity webhook token is configured");
}
