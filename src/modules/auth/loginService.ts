import { verifyWordpressPassword } from "@/lib/auth/wordpressPassword";
import type { SupabaseClientType } from "@/lib/supabase/types";
import type { RegisterType } from "@/constants/registerTypes";
import { resolvePostTypeForUser } from "./postTypeResolver";
import { findProfileByEmail, insertProfileFromLegacy } from "./repositories/profileRepository";
import {
  findLegacyUserByEmail,
  markLegacyUserAsMigrated,
  upsertLegacyUser,
  type LegacyUserRecord,
} from "./repositories/wpUsersLegacyRepository";
import { findRawUserByEmail } from "./repositories/wpUsersRawRepository";

type SupabaseAuthClient = SupabaseClientType;
type SupabaseAdminClient = SupabaseClientType;

type AttemptLoginResult =
  | { success: true; userId: string; accessToken: string; refreshToken: string }
  | { success: false; reason?: string };

type MigrationResult =
  | { success: true; userId: string; email: string | null; accessToken: string; refreshToken: string }
  | { success: false; status: number; errorMessage: string };
type LegacyLookupResult = { legacyUser: LegacyUserRecord | null; error: Error | null };

export type LoginServiceResult =
  | {
      ok: true;
      migrated: boolean;
      postType: RegisterType | null;
      status: 200;
      accessToken: string;
      refreshToken: string;
    }
  | { ok: false; status: number; errorMessage: string };

async function attemptSupabaseLogin(
  supabase: SupabaseAuthClient,
  email: string,
  password: string,
): Promise<AttemptLoginResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, reason: error?.message };
  }

  return {
    success: true,
    userId: data.user.id,
    accessToken: data.session?.access_token ?? "",
    refreshToken: data.session?.refresh_token ?? "",
  };
}

async function findOrSeedLegacyUser(
  supabaseAdmin: SupabaseAdminClient,
  email: string,
): Promise<LegacyLookupResult> {
  const { legacyUser, error } = await findLegacyUserByEmail(supabaseAdmin, email);
  if (error || legacyUser) {
    return { legacyUser, error };
  }

  const { rawUser, error: rawError } = await findRawUserByEmail(supabaseAdmin, email);
  if (rawError) {
    return { legacyUser: null, error: rawError };
  }

  if (!rawUser || !rawUser.user_pass) {
    return { legacyUser: null, error: null };
  }

  const { legacyUser: seededUser, error: seedError } = await upsertLegacyUser(supabaseAdmin, {
    id: rawUser.id,
    user_pass: rawUser.user_pass,
    user_email: rawUser.user_email,
    user_login: rawUser.user_login,
    display_name: rawUser.display_name,
  });

  if (seedError) {
    return { legacyUser: null, error: seedError };
  }

  return { legacyUser: seededUser, error: null };
}

async function attemptLegacyMigration(
  supabase: SupabaseAuthClient,
  supabaseAdmin: SupabaseAdminClient,
  email: string,
  password: string,
  existingLegacyUser?: LegacyUserRecord | null,
): Promise<MigrationResult> {
  const legacyLookup: LegacyLookupResult = existingLegacyUser
    ? { legacyUser: existingLegacyUser, error: null }
    : await findOrSeedLegacyUser(supabaseAdmin, email);
  const { legacyUser, error: legacyError } = legacyLookup;

  if (legacyError) {
    return { success: false, status: 500, errorMessage: "Erro ao buscar usuário" };
  }

  if (!legacyUser) {
    return { success: false, status: 401, errorMessage: "Credenciais inválidas" };
  }

  const isValidPassword = await verifyWordpressPassword(password, legacyUser.user_pass);
  if (!isValidPassword) {
    return { success: false, status: 401, errorMessage: "Credenciais inválidas" };
  }

  const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError || !createdUser.user) {
    console.error("loginService: erro ao criar usuário no Auth", createUserError);
    return { success: false, status: 500, errorMessage: "Erro ao migrar conta" };
  }

  const supabaseUserId = createdUser.user.id;

  await insertProfileFromLegacy(supabaseAdmin, {
    id: supabaseUserId,
    email: legacyUser.user_email ?? email,
    full_name: legacyUser.display_name,
    wp_user_id: legacyUser.id,
    origin: "wordpress_migrated",
  });

  await markLegacyUserAsMigrated(supabaseAdmin, legacyUser.id);

  const loginAfterMigration = await attemptSupabaseLogin(supabase, email, password);
  if (!loginAfterMigration.success) {
    return { success: false, status: 500, errorMessage: "Erro ao autenticar após migração" };
  }

  return {
    success: true,
    userId: supabaseUserId,
    email: legacyUser.user_email,
    accessToken: loginAfterMigration.accessToken,
    refreshToken: loginAfterMigration.refreshToken,
  };
}

async function resolvePostType(
  supabaseAdmin: SupabaseAdminClient,
  params: { supabaseUserId?: string; email: string },
): Promise<RegisterType | null> {
  return resolvePostTypeForUser(supabaseAdmin, {
    supabaseUserId: params.supabaseUserId,
    email: params.email,
  });
}

export async function loginWithMigration(
  supabase: SupabaseAuthClient,
  supabaseAdmin: SupabaseAdminClient,
  email: string,
  password: string,
): Promise<LoginServiceResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  const profileLookupPromise = findProfileByEmail(supabaseAdmin, normalizedEmail);

  const supabaseLogin = await attemptSupabaseLogin(supabase, normalizedEmail, trimmedPassword);

  if (supabaseLogin.success) {
    const postType = await resolvePostType(supabaseAdmin, {
      supabaseUserId: supabaseLogin.userId,
      email: normalizedEmail,
    });

    return {
      ok: true,
      migrated: true,
      postType,
      status: 200,
      accessToken: supabaseLogin.accessToken,
      refreshToken: supabaseLogin.refreshToken,
    };
  }

  const [{ profile, error: profileError }, legacyLookup] = await Promise.all([
    profileLookupPromise,
    findOrSeedLegacyUser(supabaseAdmin, normalizedEmail),
  ]);

  if (profileError) {
    return { ok: false, status: 500, errorMessage: "Erro ao buscar usuário" };
  }

  if (legacyLookup.error) {
    return { ok: false, status: 500, errorMessage: "Erro ao buscar usuário legado" };
  }

  const migrationResult = await attemptLegacyMigration(
    supabase,
    supabaseAdmin,
    normalizedEmail,
    trimmedPassword,
    legacyLookup.legacyUser,
  );

  if (migrationResult.success) {
    const postType = await resolvePostType(supabaseAdmin, {
      supabaseUserId: migrationResult.userId,
      email: migrationResult.email ?? normalizedEmail,
    });

    return {
      ok: true,
      migrated: false,
      postType,
      status: 200,
      accessToken: migrationResult.accessToken,
      refreshToken: migrationResult.refreshToken,
    };
  }

  const hasAnyUser = Boolean(profile) || Boolean(legacyLookup.legacyUser);
  const errorMessage = hasAnyUser ? "Senha inválida" : "Usuário não encontrado";

  return {
    ok: false,
    status: hasAnyUser ? 401 : 404,
    errorMessage,
  };
}
