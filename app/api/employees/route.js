import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL is not configured.");
  }

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(url, key);
}

export async function GET(request) {
  try {
    const supabase = getSupabase();

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const department = searchParams.get("department")?.trim() || "";
    const office = searchParams.get("office")?.trim() || "";
    const active = searchParams.get("active");
    const questEnabled = searchParams.get("quest_enabled");

    let query = supabase
      .from("employees")
      .select(
        "id, name, department, office, active, quest_enabled, created_at"
      )
      .order("name", { ascending: true });

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,department.ilike.%${q}%,office.ilike.%${q}%`
      );
    }

    if (department) {
      query = query.eq("department", department);
    }

    if (office) {
      query = query.eq("office", office);
    }

    if (active === "true") {
      query = query.eq("active", true);
    } else if (active === "false") {
      query = query.eq("active", false);
    }

    if (questEnabled === "true") {
      query = query.eq("quest_enabled", true);
    } else if (questEnabled === "false") {
      query = query.eq("quest_enabled", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Employees GET error:", error);

      return Response.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json({
      employees: data || [],
    });
  } catch (error) {
    console.error("Employees GET exception:", error);

    return Response.json(
      {
        error: error.message || "Failed to fetch employees.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const name = body.name?.trim();
    const department = body.department?.trim() || null;
    const office = body.office?.trim() || null;
    const active =
      typeof body.active === "boolean" ? body.active : true;
    const quest_enabled =
      typeof body.quest_enabled === "boolean"
        ? body.quest_enabled
        : true;

    if (!name) {
      return Response.json(
        {
          error: "name is required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .insert({
        name,
        department,
        office,
        active,
        quest_enabled,
      })
      .select()
      .single();

    if (error) {
      console.error("Employees POST error:", error);

      return Response.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        employee: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Employees POST exception:", error);

    return Response.json(
      {
        error: error.message || "Failed to create employee.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const id = body.id;

    if (!id) {
      return Response.json(
        {
          error: "id is required.",
        },
        { status: 400 }
      );
    }

    const updateData = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (!name) {
        return Response.json(
          {
            error: "name cannot be empty.",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    if (typeof body.department === "string") {
      updateData.department = body.department.trim() || null;
    }

    if (typeof body.office === "string") {
      updateData.office = body.office.trim() || null;
    }

    if (typeof body.active === "boolean") {
      updateData.active = body.active;
    }

    if (typeof body.quest_enabled === "boolean") {
      updateData.quest_enabled = body.quest_enabled;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        {
          error: "No fields to update.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Employees PATCH error:", error);

      return Response.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json({
      employee: data,
    });
  } catch (error) {
    console.error("Employees PATCH exception:", error);

    return Response.json(
      {
        error: error.message || "Failed to update employee.",
      },
      { status: 500 }
    );
  }
}
