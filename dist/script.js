      document.documentElement.classList.add("js");
      const menu = document.querySelector(".menu"),
        nav = document.querySelector("nav");
      menu.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        menu.setAttribute("aria-expanded", open);
      });
      nav.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("open");
          menu.setAttribute("aria-expanded", "false");
        }),
      );
      document.querySelectorAll(".wa").forEach((a) => {
        const msg = a.dataset.stay
          ? "Hola, me gustaría conocer más sobre " +
            a.dataset.stay +
            " de Mirador Arbolino y su futura apertura."
          : "Hola, me gustaría conocer más sobre Mirador Arbolino y su futura apertura.";
        a.href = "https://wa.me/573204988059?text=" + encodeURIComponent(msg);
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
      const video = document.querySelector("video"),
        control = document.querySelector(".video-control");
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.pause();
        control.textContent = "Reproducir video ▶";
      }
      control.addEventListener("click", () => {
        if (video.paused) {
          video
            .play()
            .then(() => (control.textContent = "Pausar video Ⅱ"))
            .catch(() => {
              control.textContent = "Video no disponible";
            });
        } else {
          video.pause();
          control.textContent = "Reproducir video ▶";
        }
      });
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("visible");
                observer.unobserve(e.target);
              }
            }),
          { threshold: 0.08 },
        );
        document
          .querySelectorAll(".reveal")
          .forEach((e) => observer.observe(e));
      } else
        document
          .querySelectorAll(".reveal")
          .forEach((e) => e.classList.add("visible"));
      document.querySelector("#year").textContent = new Date().getFullYear();
      const bookingForm = document.querySelector("#booking-form"),
        arrival = document.querySelector("#arrival"),
        departure = document.querySelector("#departure"),
        accommodation = document.querySelector("#accommodation"),
        guestCount = document.querySelector("#guest-count");

      async function cargarAlojamientos() {
        try {
          const respuesta = await fetch("/api/alojamientos");

          if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los alojamientos");
          }

          const datos = await respuesta.json();

          const codigos = {
            1: "treehouse",
            2: "cabin",
          };

          const opciones = datos
            .filter((item) => codigos[item.id])
            .map((item) => {
              const opcion = new Option(item.nombre, codigos[item.id]);

              opcion.dataset.capacidad = item.capacidad;
              return opcion;
            });

          if (opciones.length === 0) {
            throw new Error("No hay alojamientos disponibles");
          }

          accommodation.replaceChildren(...opciones);
          accommodation.disabled = false;
          accommodation.dispatchEvent(new Event("change"));
        } catch (error) {
          console.error(error);

          accommodation.replaceChildren(
            new Option("Alojamientos no disponibles", ""),
          );

          accommodation.disabled = true;
        }
      }

      cargarAlojamientos();

      function dateISO(d) {
        return (
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0")
        );
      }
      function nextDay(value) {
        const d = new Date(value + "T12:00:00");
        d.setDate(d.getDate() + 1);
        return dateISO(d);
      }
      arrival.min = dateISO(new Date());
      departure.min = nextDay(arrival.min);
      arrival.addEventListener("change", () => {
        arrival.setCustomValidity("");
        departure.min = arrival.value
          ? nextDay(arrival.value)
          : nextDay(arrival.min);
        if (departure.value && departure.value < departure.min)
          departure.value = "";
        departure.setCustomValidity("");
        updateSummary();
      });
      departure.addEventListener("change", () => {
        departure.setCustomValidity("");
        updateSummary();
      });
      accommodation.addEventListener("change", () => {
        const previous = Number(guestCount.value);
        const max =
          Number(accommodation.selectedOptions[0]?.dataset.capacidad) || 1;
        guestCount.replaceChildren(
          ...Array.from({ length: max }, (_, i) => {
            const o = document.createElement("option");
            o.value = i + 1;
            o.textContent = i + 1 + " " + (i === 0 ? "huésped" : "huéspedes");
            return o;
          }),
        );
        guestCount.value = Math.min(previous, max);
        const fotos = {
          treehouse: {
            src: "assets/treehouse.png",
            descripcion: "Visualización conceptual · Casa del Árbol",
            caracteristicas: [
              "Cama doble",
              "Baño",
              "Terraza romántica",
              "Mirador hacia Neiva",
            ],
          },

          cabin: {
            src: "assets/cabin.webp",
            descripcion: "Imagen de referencia · La Cabaña",
            caracteristicas: [
              "3 habitaciones",
              "3 baños",
              "Hasta 6 huéspedes",
              "Escapadas en familia",
            ],
          },
        };

        const foto = fotos[accommodation.value];

        if (foto) {
          const imagen = document.querySelector("#booking-accommodation-photo");

          imagen.src = foto.src;
          imagen.alt = foto.descripcion;

          document.querySelector("#booking-accommodation-caption").textContent =
            foto.descripcion;

          const etiquetas = foto.caracteristicas.map((texto) => {
            const etiqueta = document.createElement("span");
            etiqueta.textContent = texto;
            return etiqueta;
          });

          document
            .querySelector("#booking-accommodation-features")
            .replaceChildren(...etiquetas);
        }
        updateSummary();
        cargarDisponibilidad();
      });
      guestCount.addEventListener("change", updateSummary);
      function formatDate(v) {
        return new Intl.DateTimeFormat("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(v + "T12:00:00"));
      }
      function updateSummary() {
        let text =
          accommodation.value === "cabin" ? "La Cabaña" : "Casa del Árbol";
        if (
          arrival.value &&
          departure.value &&
          departure.value > arrival.value
        ) {
          const nights = Math.round(
            (new Date(departure.value + "T12:00:00") -
              new Date(arrival.value + "T12:00:00")) /
              86400000,
          );
          text += " · " + nights + " " + (nights === 1 ? "noche" : "noches");
        }
        document.querySelector("#stay-summary").textContent = text;
      }
      bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (arrival.value < dateISO(new Date())) {
          arrival.setCustomValidity("Elige una fecha de hoy o posterior.");
          arrival.reportValidity();
          return;
        }
        arrival.setCustomValidity("");
        if (departure.value <= arrival.value) {
          departure.setCustomValidity(
            "La salida debe ser posterior a la llegada.",
          );
          departure.reportValidity();
          return;
        }
        if (!bookingForm.reportValidity()) return;

        const idsAlojamiento = {
          treehouse: 1,
          cabin: 2,
        };

        const alojamientoId = idsAlojamiento[accommodation.value];
        const fechaEntrada = arrival.value;
        const fechaSalida = departure.value;
        const feedback = document.querySelector("#booking-feedback");

        if (!alojamientoId) {
          feedback.textContent = "Selecciona un alojamiento válido.";
          return;
        }

        const boton = bookingForm.querySelector('button[type="submit"]');
        boton.disabled = true;
        feedback.textContent = "Comprobando disponibilidad...";

        try {
          const parametros = new URLSearchParams({
            alojamiento_id: String(alojamientoId),
            entrada: fechaEntrada,
            salida: fechaSalida,
          });

          const respuesta = await fetch(`/api/validar-fechas?${parametros}`, {
            cache: "no-store",
          });

          if (!respuesta.ok) {
            throw new Error("No se pudo verificar la disponibilidad");
          }

          const resultado = await respuesta.json();

          if (!resultado.disponible) {
            feedback.textContent =
              "Las fechas seleccionadas incluyen noches ocupadas. Elige otras fechas.";
            return;
          }

          if (
            accommodation.value !==
              (alojamientoId === 1 ? "treehouse" : "cabin") ||
            arrival.value !== fechaEntrada ||
            departure.value !== fechaSalida
          ) {
            feedback.textContent =
              "Las fechas cambiaron durante la consulta. Inténtalo nuevamente.";
            return;
          }
        } catch (error) {
          console.error(error);
          feedback.textContent =
            "No pudimos comprobar la disponibilidad. Inténtalo nuevamente.";
          return;
        } finally {
          boton.disabled = false;
        }

        const name = document.querySelector("#guest-name").value.trim();
        if (!name) {
          document.querySelector("#guest-name").focus();
          return;
        }
        const lines = [
          "Hola, me gustaría solicitar una futura reserva en Mirador Arbolino.",
          "Alojamiento: " +
            (accommodation.value === "cabin" ? "La Cabaña" : "Casa del Árbol"),
          "Llegada: " + formatDate(arrival.value),
          "Salida: " + formatDate(departure.value),
          "Huéspedes: " + guestCount.value,
          "Nombre: " + name,
          "Correo: " + document.querySelector("#guest-email").value.trim(),
          "Teléfono: " + document.querySelector("#guest-phone").value.trim(),
        ];
        const notes = document.querySelector("#guest-notes").value.trim();
        if (notes) lines.push("Comentarios: " + notes);
        lines.push(
          "Entiendo que la apertura, disponibilidad y tarifa están pendientes de confirmación.",
        );
        const link = document.createElement("a");
        link.href =
          "https://wa.me/573204988059?text=" +
          encodeURIComponent(lines.join("\n"));
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Continuar a WhatsApp";
        link.className = "button";

        feedback.replaceChildren(
          "Fechas verificadas. La reserva todavía no está confirmada. ",
          link,
        );
      });

      let calendarView = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const calendar = document.querySelector("#calendar");
      let reservasConfirmadas = [];
      let disponibilidadCargada = false;
      let solicitudActual = 0;

      async function cargarDisponibilidad() {
        const solicitud = ++solicitudActual;
        disponibilidadCargada = false;
        reservasConfirmadas = [];
        renderCalendar();

        const ids = {
          treehouse: 1,
          cabin: 2,
        };

        const id = ids[accommodation.value];

        if (!id) return;

        const mes = dateISO(calendarView).slice(0, 7);

        try {
          const respuesta = await fetch(
            `/api/disponibilidad?alojamiento_id=${id}&mes=${mes}`,
          );

          if (!respuesta.ok) {
            throw new Error("Error consultando disponibilidad");
          }

          const datos = await respuesta.json();

          if (solicitud !== solicitudActual) return;

          reservasConfirmadas = datos.reservas;
          disponibilidadCargada = true;
        } catch (error) {
          if (solicitud !== solicitudActual) return;
          console.error(error);
        }

        renderCalendar();
      }
      function selectCalendarDate(value) {
        arrival.setCustomValidity("");
        departure.setCustomValidity("");

        if (arrival.value && !departure.value && value > arrival.value) {
          const conflicto = reservasConfirmadas.some(
            (reserva) =>
              arrival.value < reserva.fecha_salida &&
              value > reserva.fecha_entrada,
          );

          if (conflicto) {
            departure.setCustomValidity(
              "El rango seleccionado incluye noches ocupadas. Elige otras fechas.",
            );
            departure.reportValidity();
            return;
          }
        }

        if (!arrival.value || departure.value || value <= arrival.value) {
          arrival.value = value;
          departure.value = "";
          departure.min = nextDay(value);
        } else {
          departure.value = value;
        }

        updateSummary();
        renderCalendar();
      }
      function renderCalendar() {
        document.querySelector("#calendar-month").textContent =
          new Intl.DateTimeFormat("es-CO", {
            month: "long",
            year: "numeric",
          }).format(calendarView);
        document.querySelector("#date-step").textContent = !arrival.value
          ? "1. Elige la fecha de llegada"
          : !departure.value
            ? "2. Elige la fecha de salida"
            : "Fechas elegidas · Haz clic para iniciar otra selección";
        calendar.replaceChildren();
        ["L", "M", "X", "J", "V", "S", "D"].forEach((day) => {
          const el = document.createElement("span");
          el.className = "calendar-week";
          el.textContent = day;
          calendar.append(el);
        });
        const offset = (calendarView.getDay() + 6) % 7;
        for (let i = 0; i < offset; i++)
          calendar.append(document.createElement("span"));
        const total = new Date(
          calendarView.getFullYear(),
          calendarView.getMonth() + 1,
          0,
        ).getDate();
        for (let day = 1; day <= total; day++) {
          const date = new Date(
              calendarView.getFullYear(),
              calendarView.getMonth(),
              day,
            ),
            value = dateISO(date),
            button = document.createElement("button");
          button.type = "button";
          button.className = "calendar-day";
          button.textContent = day;
          const ocupada = reservasConfirmadas.some(
            (reserva) =>
              value >= reserva.fecha_entrada && value < reserva.fecha_salida,
          );

          button.disabled =
            value < dateISO(new Date()) || !disponibilidadCargada || ocupada;

          button.setAttribute(
            "aria-label",
            formatDate(value) + (ocupada ? " - Ocupada" : ""),
          );

          if (ocupada) {
            button.title = "Fecha ocupada";
          }
          const selected = value === arrival.value || value === departure.value;
          button.setAttribute("aria-pressed", String(selected));
          if (selected) button.classList.add("selected");
          if (
            arrival.value &&
            departure.value &&
            value > arrival.value &&
            value < departure.value
          )
            button.classList.add("in-range");
          button.addEventListener("click", () => selectCalendarDate(value));
          calendar.append(button);
        }
        document.querySelector("#calendar-prev").disabled =
          calendarView.getFullYear() === new Date().getFullYear() &&
          calendarView.getMonth() === new Date().getMonth();
      }
      document.querySelector("#calendar-prev").addEventListener("click", () => {
        calendarView.setMonth(calendarView.getMonth() - 1);
        cargarDisponibilidad();
      });
      document.querySelector("#calendar-next").addEventListener("click", () => {
        calendarView.setMonth(calendarView.getMonth() + 1);
        cargarDisponibilidad();
      });
      document
        .querySelector("#calendar-reset")
        .addEventListener("click", () => {
          arrival.value = "";
          departure.value = "";
          arrival.setCustomValidity("");
          departure.setCustomValidity("");
          departure.min = nextDay(arrival.min);
          updateSummary();
          renderCalendar();
        });
      [arrival, departure].forEach((input) =>
        input.addEventListener("change", renderCalendar),
      );
      renderCalendar();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          nav.classList.remove("open");
          menu.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && !menu.contains(e.target)) {
          nav.classList.remove("open");
          menu.setAttribute("aria-expanded", "false");
        }
      });

      const carousel = document.querySelector("#interior-carousel"),
        slides = [...carousel.querySelectorAll("figure")];
      let slideIndex = 0;
      const slidePrev = document.querySelector("#slide-prev"),
        slideNext = document.querySelector("#slide-next");
      function showSlide(index) {
        slideIndex = Math.max(0, Math.min(index, slides.length - 1));
        carousel.scrollTo({
          left: slideIndex * carousel.clientWidth,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
        syncCarousel();
      }
      function syncCarousel() {
        slidePrev.disabled = slideIndex === 0;
        slideNext.disabled = slideIndex === slides.length - 1;
        document.querySelector("#slide-count").textContent =
          String(slideIndex + 1).padStart(2, "0") +
          " / " +
          String(slides.length).padStart(2, "0");
      }
      slidePrev.addEventListener("click", () => showSlide(slideIndex - 1));
      slideNext.addEventListener("click", () => showSlide(slideIndex + 1));
      carousel.addEventListener(
        "scroll",
        () => {
          slideIndex = Math.round(carousel.scrollLeft / carousel.clientWidth);
          syncCarousel();
        },
        { passive: true },
      );
      carousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          showSlide(slideIndex + 1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          showSlide(slideIndex - 1);
        }
      });
      window.addEventListener("resize", () => showSlide(slideIndex));
      syncCarousel();
      document
        .querySelectorAll(".swipe-hint")
        .forEach((button) =>
          button.addEventListener("click", () =>
            showSlide((slideIndex + 1) % slides.length),
          ),
        );
      const tourDialog = document.querySelector("#tour-dialog"),
        tourCanvas = document.querySelector("#tour-canvas"),
        tourLoading = document.querySelector("#tour-loading");
      let tourGL,
        tourProgram,
        tourTexture,
        tourReady = false,
        tourYaw = 0,
        tourPitch = 0,
        tourFov = 75,
        tourDrag = null,
        tourReturnFocus;
      function tourShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw Error("shader");
        return shader;
      }
      function drawTour() {
        if (!tourReady || !tourDialog.open) return;
        const gl = tourGL,
          ratio = Math.min(devicePixelRatio || 1, 2);
        tourCanvas.width = Math.round(tourCanvas.clientWidth * ratio);
        tourCanvas.height = Math.round(tourCanvas.clientHeight * ratio);
        gl.viewport(0, 0, tourCanvas.width, tourCanvas.height);
        gl.useProgram(tourProgram);
        gl.uniform2f(
          gl.getUniformLocation(tourProgram, "resolution"),
          tourCanvas.width,
          tourCanvas.height,
        );
        gl.uniform2f(
          gl.getUniformLocation(tourProgram, "rotation"),
          tourYaw,
          tourPitch,
        );
        gl.uniform1f(
          gl.getUniformLocation(tourProgram, "fov"),
          (tourFov * Math.PI) / 180,
        );
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      function initTour() {
        if (tourGL) {
          drawTour();
          return;
        }
        try {
          const gl = tourCanvas.getContext("webgl", { alpha: false });
          if (!gl) throw Error("webgl");
          tourGL = gl;
          const vertex = tourShader(
            gl,
            gl.VERTEX_SHADER,
            "attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}",
          );
          const fragment = tourShader(
            gl,
            gl.FRAGMENT_SHADER,
            `precision highp float;uniform sampler2D panorama;uniform vec2 resolution;uniform vec2 rotation;uniform float fov;const float PI=3.14159265359;void main(){vec2 p=(gl_FragCoord.xy/resolution)*2.0-1.0;float t=tan(fov*.5);vec3 d=normalize(vec3(p.x*resolution.x/resolution.y*t,p.y*t,1.0));float cp=cos(rotation.y),sp=sin(rotation.y);d=vec3(d.x,d.y*cp+d.z*sp,-d.y*sp+d.z*cp);float cy=cos(rotation.x),sy=sin(rotation.x);d=vec3(d.x*cy+d.z*sy,d.y,-d.x*sy+d.z*cy);vec2 uv=vec2(fract(atan(d.x,d.z)/(2.0*PI)+.5),.5-asin(clamp(d.y,-1.0,1.0))/PI);gl_FragColor=texture2D(panorama,uv);}`,
          );
          tourProgram = gl.createProgram();
          gl.attachShader(tourProgram, vertex);
          gl.attachShader(tourProgram, fragment);
          gl.linkProgram(tourProgram);
          if (!gl.getProgramParameter(tourProgram, gl.LINK_STATUS))
            throw Error("link");
          gl.useProgram(tourProgram);
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW,
          );
          const loc = gl.getAttribLocation(tourProgram, "position");
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
          tourTexture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, tourTexture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          const image = new Image();
          image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, tourTexture);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGB,
              gl.RGB,
              gl.UNSIGNED_BYTE,
              image,
            );
            tourReady = true;
            tourLoading.style.display = "none";
            drawTour();
          };
          image.onerror = () => {
            tourLoading.textContent =
              "No se pudo cargar el recorrido. Cierra la ventana e inténtalo otra vez.";
            tourGL = null;
          };
          image.src = "assets/panorama.webp";
        } catch (error) {
          tourLoading.textContent =
            "El visor 360 no está disponible en este navegador.";
          tourGL = null;
        }
      }
      function openTour() {
        tourReturnFocus = document.activeElement;
        tourDialog.showModal();
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => {
          initTour();
          tourCanvas.focus();
        });
      }
      function closeTour() {
        tourDialog.close();
      }
      document.querySelector(".tour-open").addEventListener("click", openTour);
      document
        .querySelector("#tour-close")
        .addEventListener("click", closeTour);
      tourDialog.addEventListener("close", () => {
        document.body.style.overflow = "";
        tourDrag = null;
        tourReturnFocus?.focus();
      });
      tourDialog.addEventListener("click", (e) => {
        if (e.target === tourDialog) {
          const r = tourDialog.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            closeTour();
        }
      });
      function clampTour() {
        tourPitch = Math.max(
          -Math.PI / 2 + 0.02,
          Math.min(Math.PI / 2 - 0.02, tourPitch),
        );
        tourFov = Math.max(35, Math.min(100, tourFov));
        drawTour();
      }
      tourCanvas.addEventListener("pointerdown", (e) => {
        tourDrag = { x: e.clientX, y: e.clientY, id: e.pointerId };
        tourCanvas.setPointerCapture(e.pointerId);
      });
      tourCanvas.addEventListener("pointermove", (e) => {
        if (!tourDrag || tourDrag.id !== e.pointerId) return;
        tourYaw -= (e.clientX - tourDrag.x) * 0.005;
        tourPitch += (e.clientY - tourDrag.y) * 0.005;
        tourDrag.x = e.clientX;
        tourDrag.y = e.clientY;
        clampTour();
      });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
        tourCanvas.addEventListener(type, () => (tourDrag = null)),
      );
      tourCanvas.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          tourFov += e.deltaY * 0.03;
          clampTour();
        },
        { passive: false },
      );
      tourCanvas.addEventListener("keydown", (e) => {
        if (
          ![
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "+",
            "-",
          ].includes(e.key)
        )
          return;
        e.preventDefault();
        if (e.key === "ArrowLeft") tourYaw -= 0.1;
        if (e.key === "ArrowRight") tourYaw += 0.1;
        if (e.key === "ArrowUp") tourPitch += 0.1;
        if (e.key === "ArrowDown") tourPitch -= 0.1;
        if (e.key === "+") tourFov -= 5;
        if (e.key === "-") tourFov += 5;
        clampTour();
      });
      document.querySelector("#tour-plus").addEventListener("click", () => {
        tourFov -= 10;
        clampTour();
      });
      document.querySelector("#tour-minus").addEventListener("click", () => {
        tourFov += 10;
        clampTour();
      });
      document.querySelector("#tour-reset").addEventListener("click", () => {
        tourYaw = 0;
        tourPitch = 0;
        tourFov = 75;
        drawTour();
      });
      window.addEventListener("resize", drawTour);

      const floatingWhatsApp = document.querySelector(".floating"),
        heroSection = document.querySelector("#inicio");
      function updateFloatingWhatsApp() {
        const visible = heroSection.getBoundingClientRect().bottom <= 0;
        floatingWhatsApp.classList.toggle("is-visible", visible);
        floatingWhatsApp.inert = !visible;
        floatingWhatsApp.setAttribute("aria-hidden", String(!visible));
      }
      let whatsappScrollPending = false;
      window.addEventListener(
        "scroll",
        () => {
          if (!whatsappScrollPending) {
            whatsappScrollPending = true;
            requestAnimationFrame(() => {
              updateFloatingWhatsApp();
              whatsappScrollPending = false;
            });
          }
        },
        { passive: true },
      );
      window.addEventListener("resize", updateFloatingWhatsApp);
      window.addEventListener("pageshow", updateFloatingWhatsApp);
      updateFloatingWhatsApp();
    
