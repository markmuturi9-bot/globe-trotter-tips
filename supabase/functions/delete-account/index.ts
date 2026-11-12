import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Deletes the CALLER'S OWN account. In order:
//   1. identify the user from their own login token (never from a value in the request)
//   2. check the password
//   3. refuse if the user is the last admin
//   4. delete the user's files in the "tip-images" bucket (abort if that fails)
//   5. delete the account; the database removes profile, tips, friendships,
//      chats, messages, notifications and roles through "on delete cascade".
//
// Answers are JSON: { success: true } or { error: "<code>" } with a matching
// HTTP status. Codes: unauthorized, invalid_request, wrong_password,
// last_admin, files_failed, delete_failed.

const BUCKET = "tip-images";
const PAGE_SIZE = 100;
const MAX_PAGES = 200; // safety stop: 20 000 files

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Who is calling? Taken from the caller's own JWT.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401, corsHeaders);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user || !user.email) {
      return json({ error: "unauthorized" }, 401, corsHeaders);
    }

    let password: unknown;
    try {
      ({ password } = await req.json());
    } catch {
      return json({ error: "invalid_request" }, 400, corsHeaders);
    }
    if (typeof password !== "string" || password.length === 0) {
      return json({ error: "invalid_request" }, 400, corsHeaders);
    }

    // 2. Check the password with a separate client, so the caller's own session is untouched.
    const passwordClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: passwordError } = await passwordClient.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (passwordError) {
      return json({ error: "wrong_password" }, 403, corsHeaders);
    }
    // We only needed the check; drop the session this created.
    await passwordClient.auth.signOut();

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 3. The last admin cannot be deleted (the database enforces this too).
    const { data: admins, error: adminsError } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (adminsError) {
      console.error("Admin check failed:", adminsError);
      return json({ error: "delete_failed" }, 500, corsHeaders);
    }
    const isAdmin = admins.some((r) => r.user_id === user.id);
    if (isAdmin && admins.length <= 1) {
      return json({ error: "last_admin" }, 409, corsHeaders);
    }

    // 4. Delete the user's files (profile picture and tip images live in "<user id>/...").
    let allFilesDeleted = false;
    for (let page = 0; page < MAX_PAGES; page++) {
      const { data: files, error: listError } = await admin.storage
        .from(BUCKET)
        .list(user.id, { limit: PAGE_SIZE });
      if (listError) {
        console.error("Listing files failed:", listError);
        return json({ error: "files_failed" }, 500, corsHeaders);
      }
      if (!files || files.length === 0) {
        allFilesDeleted = true;
        break;
      }

      const { error: removeError } = await admin.storage
        .from(BUCKET)
        .remove(files.map((f) => `${user.id}/${f.name}`));
      if (removeError) {
        console.error("Removing files failed:", removeError);
        return json({ error: "files_failed" }, 500, corsHeaders);
      }
    }
    if (!allFilesDeleted) {
      console.error("Too many files, stopping before deleting the account");
      return json({ error: "files_failed" }, 500, corsHeaders);
    }

    // 5. Delete the account. Everything else follows through "on delete cascade".
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("Deleting user failed:", deleteError);
      // The database blocks deleting the last admin, but Auth hides that reason
      // behind a generic message. Look again to give the right answer.
      const { data: adminsNow } = await admin.from("user_roles").select("user_id").eq("role", "admin");
      if (adminsNow && adminsNow.length <= 1 && adminsNow.some((r) => r.user_id === user.id)) {
        return json({ error: "last_admin" }, 409, corsHeaders);
      }
      return json({ error: "delete_failed" }, 500, corsHeaders);
    }

    return json({ success: true }, 200, corsHeaders);
  } catch (error) {
    console.error("Error:", error);
    return json({ error: "delete_failed" }, 500, corsHeaders);
  }
});
