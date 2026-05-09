import { supabase } from "../lib/supabaseClient";

function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
}

async function read(table, options = {}) {
  assertSupabase();

  const { orderBy = "created_at", ascending = true, filters = [] } = options;

  let query = supabase.from(table).select("*");

  filters.forEach((filter) => {
    if (filter.type === "eq") query = query.eq(filter.column, filter.value);
  });

  if (orderBy) query = query.order(orderBy, { ascending });

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export function getPublicTeams() {
  return read("teams", {
    orderBy: "total_score",
    ascending: false,
    filters: [{ type: "eq", column: "is_active", value: true }],
  });
}

export function getPublicMatches() {
  return read("matches", {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getPublicScheduleEvents() {
  return read("schedule_events", {
    orderBy: "date",
    ascending: true,
    filters: [{ type: "eq", column: "is_active", value: true }],
  });
}

export function getPublicMenuItems() {
  return read("menu_items", {
    orderBy: "created_at",
    ascending: false,
    filters: [{ type: "eq", column: "is_available", value: true }],
  });
}

export function getPublicShopItems() {
  return read("shop_items", {
    orderBy: "created_at",
    ascending: false,
    filters: [{ type: "eq", column: "is_available", value: true }],
  });
}

export async function getPublicGallery() {
  assertSupabase();

  const { data: categories, error: categoryError } = await supabase
    .from("gallery_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoryError) throw categoryError;

  const { data: images, error: imageError } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (imageError) throw imageError;

  return (categories || []).map((category) => {
    const categoryImages = (images || []).filter(
      (image) => image.category_id === category.id,
    );

    const cover =
      category.cover_image_url ||
      categoryImages.find((image) => image.is_cover)?.image_url ||
      categoryImages[0]?.image_url ||
      category.fallback_image_url ||
      "";

    return {
      id: category.id,
      title: category.title,
      coverImage: cover,
      fallbackImage: category.fallback_image_url,
      images: categoryImages.map((image) => ({
        id: image.id,
        title: image.title,
        image: image.image_url,
        isCover: image.is_cover,
      })),
    };
  });
}
