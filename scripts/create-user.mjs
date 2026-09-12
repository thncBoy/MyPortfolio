import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually to ensure compatibility
const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (key === "NEXT_PUBLIC_SUPABASE_URL" && !supabaseUrl) supabaseUrl = val;
        if (key === "SUPABASE_SERVICE_ROLE_KEY" && !serviceKey) serviceKey = val;
      }
    }
  }
}

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: node scripts/create-user.mjs <email> <password>");
  console.log("Example: node scripts/create-user.mjs admin@example.com MyPass1234");
  process.exit(1);
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // Auto confirms email so you can log in immediately
});

if (error) {
  console.error("❌ Error creating user:", error.message);
  process.exit(1);
}

console.log("✅ User created successfully!");
console.log("Email:", data.user.email);
console.log("ID:", data.user.id);
console.log("You can now log in at /login with these credentials.");
