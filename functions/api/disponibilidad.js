
export async function onRequestGet({ request, env }) {
  const params = new URL(request.url).searchParams;

  const alojamientoId = Number(params.get("alojamiento_id"));
  const mes = params.get("mes") || "";

  if (
    !Number.isSafeInteger(alojamientoId) ||
    alojamientoId <= 0 ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)
  ) {
    return Response.json(
      { error: "Parámetros inválidos" },
      { status: 400 }
    );
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return Response.json(
      { error: "Configuración incompleta" },
      { status: 500 }
    );
  }

  const [year, month] = mes.split("-").map(Number);

  const inicio = `${mes}-01`;

  const fin = new Date(
    Date.UTC(year, month, 1)
  ).toISOString().slice(0, 10);

  try {
    const url = new URL(
      "/rest/v1/reservas",
      env.SUPABASE_URL
    );

    url.searchParams.set(
      "select",
      "fecha_entrada,fecha_salida"
    );

    url.searchParams.set(
      "alojamiento_id",
      `eq.${alojamientoId}`
    );

    url.searchParams.set("estado", "eq.confirmada");
    url.searchParams.set("fecha_entrada", `lt.${fin}`);
    url.searchParams.set("fecha_salida", `gt.${inicio}`);

    const response = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      console.error("Supabase status:", response.status);

      return Response.json(
        { error: "No se pudo consultar la ocupación" },
        { status: 502 }
      );
    }

    const reservas = await response.json();

    return Response.json(
      {
        alojamiento_id: alojamientoId,
        mes,
        reservas
      },
      {
        headers: { "Cache-Control": "no-store" }
      }
    );

  } catch (error) {
    console.error("Error de disponibilidad:", error);

    return Response.json(
      { error: "Servicio no disponible" },
      { status: 502 }
    );
  }
}
