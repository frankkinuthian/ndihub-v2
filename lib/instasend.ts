import IntaSend from 'intasend-node';

// Create IntaSend instance with lazy initialization
function createIntaSendInstance() {
  if (!process.env.INSTASEND_API_KEY) {
    throw new Error("INSTASEND_API_KEY is not set");
  }

  if (!process.env.INSTASEND_API_SECRET) {
    throw new Error("INSTASEND_API_SECRET is not set");
  }

  return new IntaSend(
    process.env.INSTASEND_API_KEY,
    process.env.INSTASEND_API_SECRET,
    process.env.NODE_ENV === 'development' // Use sandbox in development, production is default
  );
}

// Export the factory function for use in server actions and API routes
export { createIntaSendInstance };

// For compatibility with the Stripe pattern, export a default instance
// This will work in Next.js server components and API routes where env vars are available
let intasendInstance: unknown = null;

const intasend = (() => {
  try {
    if (!intasendInstance) {
      intasendInstance = createIntaSendInstance();
    }
    return intasendInstance;
  } catch {
    // In development/testing, return null if env vars aren't loaded yet
    // Server actions and API routes should use createIntaSendInstance() directly
    return null;
  }
})();

export default intasend;