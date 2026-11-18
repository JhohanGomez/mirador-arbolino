
export async function onRequestGet({ env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return Response.json(
      { error: "Configuración incompleta" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "/rest/v1/alojamientos",
      env.SUPABASE_URL
    );

    url.searchParams.set("select", "id,nombre,capacidad");
    url.searchParams.set("order", "id.asc");

    const response = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        Accept: "application/json"
      }
    });

if (!response.ok) {
  console.error("Supabase HTTP status:", response.status);

  return Response.json(
    {
      error: "Error al consultar alojamientos",
      supabase_status: response.status
    },
    { status: 502 }
  );
}

    return Response.json(await response.json(), {
      headers: { "Cache-Control": "no-store" }
    });

  } catch {
    return Response.json(
      { error: "Servicio no disponible" },
      { status: 502 }
    );
  }
}
