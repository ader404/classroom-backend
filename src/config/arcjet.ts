import arcjet, { shield, detectBot } from "@arcjet/node";

const isTestEnv = process.env.NODE_ENV === "test";
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey && !isTestEnv) {
  throw new Error(
    "ARCJET_KEY environment variable is required. Sign up for your Arcjet key at https://app.arcjet.com"
  );
}

// Configure Arcjet with security rules.
const aj = arcjet({
  key: arcjetKey ?? "test-key",
  rules: [
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      // See the full list at https://arcjet.com/bot-list
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
  ],
});

export default aj;