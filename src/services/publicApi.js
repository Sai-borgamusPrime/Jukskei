import { supabase } from "../lib/supabaseClient";

function assertSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }
}

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStatus(value) {
  const status = normalizeText(value, "Upcoming");
  const lower = status.toLowerCase();

  if (lower === "live") return "Live";

  if (lower === "past" || lower === "completed" || lower === "finished") {
    return "Past";
  }

  if (lower === "cancelled" || lower === "canceled") return "Cancelled";

  return "Upcoming";
}

function cleanSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateLabel(value) {
  if (!value) return "Date TBC";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date TBC";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTimeLabel(value) {
  if (!value) return "Time TBC";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Time TBC";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSafeImage(value) {
  return normalizeText(value, "/logo.webp");
}

function mapTeam(row, divisionLookup = new Map()) {
  const divisionCode = normalizeText(row.division, "");

  return {
    id: row.id,
    name: normalizeText(row.name, "Unnamed Team"),
    slug: normalizeText(row.slug) || cleanSlug(row.name || row.id),
    division: divisionCode,
    divisionName: divisionLookup.get(divisionCode) || divisionCode || "-",
    logo: getSafeImage(row.logo_url),
    logo_url: getSafeImage(row.logo_url),
    bannerLogo: getSafeImage(row.banner_logo_url || row.logo_url),
    banner_logo_url: getSafeImage(row.banner_logo_url || row.logo_url),
    totalScore: toNumber(row.total_score),
    total_score: toNumber(row.total_score),
    isActive: row.is_active !== false,
  };
}

function getJoinedTeam(match, side) {
  const value = side === "a" ? match.team_a : match.team_b;

  if (Array.isArray(value)) return value[0] || null;

  return value || null;
}

function mapMatch(row, teamLookup = new Map()) {
  const teamA = teamLookup.get(row.team_a_id) || getJoinedTeam(row, "a");
  const teamB = teamLookup.get(row.team_b_id) || getJoinedTeam(row, "b");
  const status = normalizeStatus(row.status);

  const teamAName = normalizeText(row.team_a_name || teamA?.name, "Team A");
  const teamBName = normalizeText(row.team_b_name || teamB?.name, "Team B");

  return {
    id: row.id,
    title: normalizeText(row.title) || `${teamAName} vs ${teamBName}`,
    date: formatDateLabel(row.match_date),
    time: formatTimeLabel(row.match_date),
    datetime: row.match_date
      ? `${formatDateLabel(row.match_date)} • ${formatTimeLabel(
          row.match_date
        )}`
      : "Date and time TBC",
    matchDate: row.match_date,
    match_date: row.match_date,
    status,
    venue: normalizeText(row.venue),
    roundLabel: normalizeText(row.round_label),
    round_label: normalizeText(row.round_label),
    isFeatured: row.is_featured === true,
    is_featured: row.is_featured === true,
    teamAId: row.team_a_id,
    teamBId: row.team_b_id,
    team_a_id: row.team_a_id,
    team_b_id: row.team_b_id,
    teamA: {
      id: row.team_a_id,
      name: teamAName,
      logo: getSafeImage(teamA?.logo_url),
    },
    teamB: {
      id: row.team_b_id,
      name: teamBName,
      logo: getSafeImage(teamB?.logo_url),
    },
    teamAScore: toNumber(row.team_a_score),
    teamBScore: toNumber(row.team_b_score),
    team_a_score: toNumber(row.team_a_score),
    team_b_score: toNumber(row.team_b_score),
  };
}

function mapScheduleEvent(row) {
  return {
    id: row.id,
    date: row.date,
    time: normalizeText(row.time),
    title: normalizeText(row.title),
    location: normalizeText(row.location),
    color: normalizeText(row.color, "green"),
    sortOrder: toNumber(row.sort_order),
    sort_order: toNumber(row.sort_order),
  };
}

function mapMenuItem(row) {
  return {
    id: row.id,
    name: normalizeText(row.name),
    description: normalizeText(row.description),
    price: toNumber(row.price),
    DOW: normalizeText(row.dow, "Everyday"),
    dow: normalizeText(row.dow, "Everyday"),
    categories: Array.isArray(row.categories) ? row.categories : [],
    image: getSafeImage(row.image_url),
    image_url: getSafeImage(row.image_url),
    isAvailable: row.is_available !== false,
    is_available: row.is_available !== false,
  };
}

function mapShopItem(row) {
  return {
    id: row.id,
    name: normalizeText(row.name),
    subtitle: normalizeText(row.subtitle || row.name),
    details: normalizeText(row.details),
    price: toNumber(row.price),
    category: normalizeText(row.category),
    image: getSafeImage(row.image_url),
    image_url: getSafeImage(row.image_url),
    isAvailable: row.is_available !== false,
    is_available: row.is_available !== false,
  };
}

export async function getPublicDivisions() {
  assertSupabase();

  const { data, error } = await supabase
    .from("team_divisions")
    .select("id, code, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function getPublicTeams() {
  assertSupabase();

  const [{ data: teams, error: teamsError }, { data: divisions, error: divisionsError }] =
    await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .eq("is_active", true)
        .order("total_score", { ascending: false }),
      supabase
        .from("team_divisions")
        .select("code, name")
        .eq("is_active", true),
    ]);

  if (teamsError) throw teamsError;
  if (divisionsError) throw divisionsError;

  const divisionLookup = new Map(
    (divisions || []).map((division) => [division.code, division.name])
  );

  return (teams || []).map((team) => mapTeam(team, divisionLookup));
}

export async function getPublicMatches() {
  assertSupabase();

  const [{ data: matchRows, error: matchError }, { data: teamRows, error: teamError }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("teams").select("id,name,logo_url"),
    ]);

  if (matchError) throw matchError;
  if (teamError) throw teamError;

  const teamLookup = new Map((teamRows || []).map((team) => [team.id, team]));

  return (matchRows || []).map((row) => mapMatch(row, teamLookup));
}

export async function getPublicTeamDetails(slug) {
  assertSupabase();

  const teams = await getPublicTeams();
  const team = teams.find((item) => item.slug === slug);

  if (!team) {
    return {
      team: null,
      matches: [],
    };
  }

  const matches = await getPublicMatches();

  const teamMatches = matches.filter((match) => {
    const teamName = team.name.toLowerCase();

    return (
      match.teamAId === team.id ||
      match.teamBId === team.id ||
      match.teamA.name.toLowerCase() === teamName ||
      match.teamB.name.toLowerCase() === teamName
    );
  });

  return {
    team,
    matches: teamMatches,
  };
}

export async function getPublicScheduleEvents() {
  assertSupabase();

  const { data, error } = await supabase
    .from("schedule_events")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data || []).map(mapScheduleEvent);
}

export async function getPublicMenuCategories() {
  assertSupabase();

  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function getPublicMenuItems() {
  assertSupabase();

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapMenuItem);
}

export async function getPublicShopCategories() {
  assertSupabase();

  const { data, error } = await supabase
    .from("shop_categories")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function getPublicShopItems() {
  assertSupabase();

  const { data, error } = await supabase
    .from("shop_items")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapShopItem);
}

export async function getPublicGallery() {
  assertSupabase();

  const { data: categories, error: categoryError } = await supabase
    .from("gallery_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (categoryError) throw categoryError;

  const { data: images, error: imageError } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (imageError) throw imageError;

  return (categories || []).map((category) => {
    const categoryImages = (images || []).filter(
      (image) => image.category_id === category.id
    );

    const coverImage =
      category.cover_image_url ||
      categoryImages.find((image) => image.is_cover)?.image_url ||
      categoryImages[0]?.image_url ||
      category.fallback_image_url ||
      "/logo.webp";

    return {
      id: category.id,
      title: normalizeText(category.title),
      coverImage,
      cover_image_url: coverImage,
      fallbackImage: getSafeImage(category.fallback_image_url),
      fallback_image_url: getSafeImage(category.fallback_image_url),
      images: categoryImages.map((image) => ({
        id: image.id,
        title: normalizeText(image.title, "Gallery image"),
        image: getSafeImage(image.image_url),
        image_url: getSafeImage(image.image_url),
        isCover: image.is_cover === true,
        is_cover: image.is_cover === true,
      })),
    };
  });
}

export function subscribeToPublicTables(tables, onChange) {
  if (!supabase || !Array.isArray(tables) || tables.length === 0) {
    return () => {};
  }

  const channel = supabase.channel(`public-page-${tables.join("-")}`);

  tables.forEach((table) => {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      () => {
        onChange?.();
      }
    );
  });

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}