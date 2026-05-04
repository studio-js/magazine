const defaultSupabaseUrl = "https://suszwslmjdhbbvxhipej.supabase.co";
const defaultSupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c3p3c2xtamRoYmJ2eGhpcGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODc2NDMsImV4cCI6MjA5MzM2MzY0M30.83ivb3FUYehjNMbZL-7U9Sn_QgcZcxRGStQ9gMdBApM";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const supabaseUrl = trimTrailingSlash(process.env.SUPABASE_URL || defaultSupabaseUrl);
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const supabasePublicConfig = {
  enabled: Boolean(supabaseUrl && supabaseAnonKey),
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  functionsUrl: supabaseUrl ? `${supabaseUrl}/functions/v1` : ""
};
