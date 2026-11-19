
export async function onRequestGet({ request, env }) {
  const params = new URL(request.url).searchParams;

  const alojamientoId = Number(params.get("alojamiento_id"));
  const entrada = params.get("entrada") || "";
  const salida = params.get("salida") || "";

  function fechaValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const fecha = new Date(`${valor}T00:00:00Z`);

    return (
      !Number.isNaN(fecha.getTime()) &&
      fecha.toISOString().slice(0, 10) === valor
    );
  }

  if (
    !Number.isSafeInteger(alojamientoId) ||
    alojamientoId <= 0 ||
    !fechaValida(entrada) ||
    !fechaValida(salida) ||
    salida <= entrada
  ) {
    return Response.json(
      { error: "Alojamiento o fechas inválidas" },
      { status: 400 }
    );
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return Response.json(
      { error: "Configuración incompleta" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "/rest/v1/reservas",
      env.SUPABASE_URL
    );

    url.searchParams.set("select", "fecha_entrada");
    url.searchParams.set("alojamiento_id", `eq.${alojamientoId}`);
    url.searchParams.set("estado", "eq.confirmada");
    url.searchParams.set("fecha_entrada", `lt.${salida}`);
    url.searchParams.set("fecha_salida", `gt.${entrada}`);
    url.searchParams.set("limit", "1");

    const respuesta = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        Accept: "application/json"
      }
    });

    if (!respuesta.ok) {
      console.error("Supabase status:", respuesta.status);
      return Response.json(
        { error: "No se pudo verificar la disponibilidad" },
        { status: 502 }
      );
    }

    const reservas = await respuesta.json();

    if (!Array.isArray(reservas)) {
      throw new Error("Respuesta inesperada de Supabase");
    }

    return Response.json(
      {
        alojamiento_id: alojamientoId,
        entrada,
        salida,
        disponible: reservas.length === 0
      },
      {
        headers: { "Cache-Control": "no-store" }
      }
    );

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Servicio no disponible" },
      { status: 502 }
    );
  }
}
