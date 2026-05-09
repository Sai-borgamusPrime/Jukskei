import { supabase } from "../lib/supabaseClient";

const ASSET_BUCKET = "jukskei-assets";

function assertSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeError(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  return error.message || fallback;
}

async function getCurrentUserId() {
  assertSupabase();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(normalizeError(error, "Could not verify the active user."));
  }

  return data?.user?.id || null;
}

async function insertAudit(action, tableName, recordId, metadata = {}) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) return;

    await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId || null,
      metadata,
    });
  } catch (error) {
    console.warn("Audit log failed:", error.message);
  }
}

async function withUserColumns(payload, mode) {
  const userId = await getCurrentUserId();

  if (!userId) return payload;

  return {
    ...payload,
    ...(mode === "create" ? { created_by: userId } : {}),
    updated_by: userId,
  };
}

export async function fetchRows(tableName, options = {}) {
  assertSupabase();

  const {
    select = "*",
    orderBy = "created_at",
    ascending = false,
    filters = [],
    limit,
  } = options;

  let query = supabase.from(tableName).select(select);

  filters.forEach((filter) => {
    if (filter?.type === "eq") query = query.eq(filter.column, filter.value);
    if (filter?.type === "neq") query = query.neq(filter.column, filter.value);
    if (filter?.type === "ilike") query = query.ilike(filter.column, filter.value);
  });

  if (orderBy) query = query.order(orderBy, { ascending });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    throw new Error(normalizeError(error, `Could not load ${tableName}.`));
  }

  return data || [];
}

export async function createRow(tableName, payload) {
  assertSupabase();

  const body = await withUserColumns(payload, "create");

  const { data, error } = await supabase
    .from(tableName)
    .insert(body)
    .select()
    .single();

  if (error) {
    throw new Error(normalizeError(error, `Could not create ${tableName}.`));
  }

  await insertAudit("created", tableName, data?.id, body);

  return data;
}

export async function updateRow(tableName, id, payload) {
  assertSupabase();

  const body = await withUserColumns(payload, "update");

  const { data, error } = await supabase
    .from(tableName)
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(normalizeError(error, `Could not update ${tableName}.`));
  }

  await insertAudit("updated", tableName, id, body);

  return data;
}

export async function deleteRow(tableName, id) {
  assertSupabase();

  const { error } = await supabase.from(tableName).delete().eq("id", id);

  if (error) {
    throw new Error(normalizeError(error, `Could not delete ${tableName}.`));
  }

  await insertAudit("deleted", tableName, id);
}

export async function uploadAsset(file, folder = "general") {
  assertSupabase();

  if (!file) return "";

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(normalizeError(error, "Could not upload image."));
  }

  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function listTeams() {
  return fetchRows("teams", {
    orderBy: "total_score",
    ascending: false,
  });
}

export async function saveTeam(form, existingId = null) {
  const payload = {
    name: cleanText(form.name),
    slug: cleanText(form.slug) || slugify(form.name),
    division: cleanText(form.division),
    logo_url: cleanText(form.logo_url),
    banner_logo_url: cleanText(form.banner_logo_url),
    total_score: parseNumber(form.total_score),
    is_active: Boolean(form.is_active),
  };

  return existingId
    ? updateRow("teams", existingId, payload)
    : createRow("teams", payload);
}

export async function listMatches() {
  return fetchRows("matches", {
    orderBy: "created_at",
    ascending: false,
  });
}

export async function saveMatch(form, existingId = null) {
  const payload = {
    title: cleanText(form.title),
    team_a_id: form.team_a_id || null,
    team_b_id: form.team_b_id || null,
    team_a_name: cleanText(form.team_a_name),
    team_b_name: cleanText(form.team_b_name),
    team_a_score: parseNumber(form.team_a_score),
    team_b_score: parseNumber(form.team_b_score),
    match_date: form.match_date ? new Date(form.match_date).toISOString() : null,
    venue: cleanText(form.venue),
    status: cleanText(form.status) || "Upcoming",
    round_label: cleanText(form.round_label),
    is_featured: Boolean(form.is_featured),
  };

  return existingId
    ? updateRow("matches", existingId, payload)
    : createRow("matches", payload);
}

export async function listScheduleEvents() {
  return fetchRows("schedule_events", {
    orderBy: "date",
    ascending: true,
  });
}

export async function saveScheduleEvent(form, existingId = null) {
  const payload = {
    date: form.date,
    time: cleanText(form.time),
    title: cleanText(form.title),
    location: cleanText(form.location),
    color: cleanText(form.color) || "green",
    sort_order: parseNumber(form.sort_order),
    is_active: Boolean(form.is_active),
  };

  return existingId
    ? updateRow("schedule_events", existingId, payload)
    : createRow("schedule_events", payload);
}

export async function listMenuItems() {
  return fetchRows("menu_items", {
    orderBy: "created_at",
    ascending: false,
  });
}

export async function saveMenuItem(form, existingId = null) {
  const categories =
    Array.isArray(form.categories)
      ? form.categories
      : cleanText(form.categories)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  const payload = {
    name: cleanText(form.name),
    description: cleanText(form.description),
    price: parseNumber(form.price),
    dow: cleanText(form.dow),
    categories,
    image_url: cleanText(form.image_url),
    is_available: Boolean(form.is_available),
  };

  return existingId
    ? updateRow("menu_items", existingId, payload)
    : createRow("menu_items", payload);
}

export async function listShopItems() {
  return fetchRows("shop_items", {
    orderBy: "created_at",
    ascending: false,
  });
}

export async function saveShopItem(form, existingId = null) {
  const payload = {
    name: cleanText(form.name),
    subtitle: cleanText(form.subtitle),
    details: cleanText(form.details),
    price: parseNumber(form.price),
    category: cleanText(form.category),
    image_url: cleanText(form.image_url),
    is_available: Boolean(form.is_available),
  };

  return existingId
    ? updateRow("shop_items", existingId, payload)
    : createRow("shop_items", payload);
}

export async function listGalleryCategories() {
  return fetchRows("gallery_categories", {
    orderBy: "sort_order",
    ascending: true,
  });
}

export async function saveGalleryCategory(form, existingId = null) {
  const payload = {
    title: cleanText(form.title),
    slug: cleanText(form.slug) || slugify(form.title),
    cover_image_url: cleanText(form.cover_image_url),
    fallback_image_url: cleanText(form.fallback_image_url),
    sort_order: parseNumber(form.sort_order),
    is_active: Boolean(form.is_active),
  };

  return existingId
    ? updateRow("gallery_categories", existingId, payload)
    : createRow("gallery_categories", payload);
}

export async function listGalleryImages(categoryId = null) {
  const filters = categoryId
    ? [{ type: "eq", column: "category_id", value: categoryId }]
    : [];

  return fetchRows("gallery_images", {
    orderBy: "created_at",
    ascending: false,
    filters,
  });
}

export async function saveGalleryImage(form, existingId = null) {
  const payload = {
    category_id: form.category_id || null,
    title: cleanText(form.title),
    image_url: cleanText(form.image_url),
    is_cover: Boolean(form.is_cover),
    is_active: Boolean(form.is_active),
  };

  const saved = existingId
    ? await updateRow("gallery_images", existingId, payload)
    : await createRow("gallery_images", payload);

  if (saved.is_cover && saved.category_id) {
    await supabase
      .from("gallery_images")
      .update({ is_cover: false })
      .eq("category_id", saved.category_id)
      .neq("id", saved.id);

    await supabase
      .from("gallery_categories")
      .update({ cover_image_url: saved.image_url })
      .eq("id", saved.category_id);
  }

  return saved;
}

export async function getDashboardStats() {
  const [teams, matches, scheduleEvents, menuItems, shopItems, galleryImages] =
    await Promise.all([
      listTeams(),
      listMatches(),
      listScheduleEvents(),
      listMenuItems(),
      listShopItems(),
      listGalleryImages(),
    ]);

  return {
    totals: {
      teams: teams.length,
      matches: matches.length,
      liveMatches: matches.filter((item) => item.status === "Live").length,
      events: scheduleEvents.length,
      menuItems: menuItems.length,
      shopItems: shopItems.length,
      galleryImages: galleryImages.length,
    },
    recentMatches: matches.slice(0, 6),
    upcomingEvents: scheduleEvents.slice(0, 6),
  };
}

export async function listDivisions() {
  const { data, error } = await supabase
    .from("team_divisions")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function saveDivision(payload, id = null) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;

  const cleanPayload = {
    code: String(payload.code || "")
      .trim()
      .toUpperCase(),
    name: String(payload.name || "").trim(),
    sort_order: Number(payload.sort_order || 0),
    is_active: payload.is_active !== false,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  if (!cleanPayload.code || !cleanPayload.name) {
    throw new Error("Division name and code are required.");
  }

  if (id) {
    const { data, error } = await supabase
      .from("team_divisions")
      .update(cleanPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from("team_divisions")
    .insert({
      ...cleanPayload,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteDivision(id) {
  const { error } = await supabase.from("team_divisions").delete().eq("id", id);

  if (error) throw error;

  return true;
}

export async function listMenuCategories() {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function saveMenuCategory(payload, id = null) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;

  const cleanPayload = {
    name: String(payload.name || "").trim(),
    sort_order: Number(payload.sort_order || 0),
    is_active: payload.is_active !== false,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  if (!cleanPayload.name) {
    throw new Error("Category name is required.");
  }

  if (id) {
    const { data, error } = await supabase
      .from("menu_categories")
      .update(cleanPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from("menu_categories")
    .insert({
      ...cleanPayload,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteMenuCategory(id) {
  const { error } = await supabase
    .from("menu_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

export async function listShopCategories() {
  const { data, error } = await supabase
    .from("shop_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function saveShopCategory(payload, id = null) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;

  const cleanPayload = {
    name: String(payload.name || "").trim(),
    sort_order: Number(payload.sort_order || 0),
    is_active: payload.is_active !== false,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  if (!cleanPayload.name) {
    throw new Error("Category name is required.");
  }

  if (id) {
    const { data, error } = await supabase
      .from("shop_categories")
      .update(cleanPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from("shop_categories")
    .insert({
      ...cleanPayload,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteShopCategory(id) {
  const { error } = await supabase
    .from("shop_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

export async function updateShopItemsCategory(oldCategory, newCategory) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;

  const { error } = await supabase
    .from("shop_items")
    .update({
      category: newCategory,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("category", oldCategory);

  if (error) throw error;

  return true;
}