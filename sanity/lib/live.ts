// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity";
import { client } from "./client";

const token = process.env.SANITY_API_TOKEN;

if (!token) {
  throw new Error(
    "The SANITY_TOKEN environment variable is not set. " +
      "Make sure to add it to your environment variables or to a.env file."
  );
}

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    // Live content is currently only available on the experimental API
    // https://www.sanity.io/docs/api-versioning
    apiVersion: "vX",
  }),
  serverToken: token,
  browserToken: token,
});
