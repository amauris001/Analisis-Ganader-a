/* Hacienda El Caoba — navegación de la versión móvil */
(function () {
  var TABS = ["ganado", "gastos", "insumos", "lluvia", "economia"];

  function redimensionar(zona) {
    if (!window.Plotly) return;
    (zona || document).querySelectorAll(".js-plotly-plot").forEach(function (el) {
      if (el.offsetParent !== null) {
        try { window.Plotly.Plots.resize(el); } catch (e) {}
      }
    });
  }

  function redimensionarPronto(zona) {
    requestAnimationFrame(function () {
      redimensionar(zona);
      window.dispatchEvent(new Event("resize"));
    });
    setTimeout(function () { redimensionar(zona); }, 250);
  }

  function mostrar(id, guardar) {
    if (TABS.indexOf(id) === -1) id = TABS[0];
    var seccion = document.getElementById("tab-" + id);
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("activa", t === seccion);
    });
    document.querySelectorAll("nav.barra button").forEach(function (b) {
      b.classList.toggle("activa", b.getAttribute("data-tab") === id);
    });
    var titulo = document.getElementById("titulo-tab");
    if (titulo && seccion) titulo.textContent = seccion.getAttribute("data-titulo");
    window.scrollTo(0, 0);
    if (guardar !== false) {
      try { localStorage.setItem("caoba_tab", id); } catch (e) {}
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    }
    redimensionarPronto(seccion);
  }

  // Barra inferior
  document.querySelectorAll("nav.barra button").forEach(function (b) {
    b.addEventListener("click", function () { mostrar(b.getAttribute("data-tab")); });
  });

  // Selectores de año (sin servidor: muestran el gráfico pre-calculado)
  document.addEventListener("change", function (e) {
    var sel = e.target;
    if (!sel.matches || !sel.matches(".selector-anio select")) return;
    var cont = sel.closest(".selector-anio");
    cont.querySelectorAll(".anio-panel").forEach(function (p) {
      p.hidden = p.getAttribute("data-anio") !== sel.value;
    });
    redimensionarPronto(cont);
  });

  // Acordeones: redibujar el gráfico al abrir
  document.addEventListener("toggle", function (e) {
    if (e.target.open) redimensionarPronto(e.target);
  }, true);

  // Botón recargar
  var btn = document.getElementById("btn-recargar");
  if (btn) btn.addEventListener("click", function () {
    btn.classList.add("girando");
    location.reload();
  });

  // Pestaña inicial: la del enlace (#lluvia), o la última que abriste
  var inicial = (location.hash || "").replace("#", "");
  if (TABS.indexOf(inicial) === -1) {
    try { inicial = localStorage.getItem("caoba_tab") || TABS[0]; } catch (e) { inicial = TABS[0]; }
  }
  mostrar(inicial, false);
  window.addEventListener("load", function () {
    setTimeout(function () { redimensionar(document.querySelector(".tab.activa")); }, 300);
  });
  window.addEventListener("orientationchange", function () {
    setTimeout(function () { redimensionar(document.querySelector(".tab.activa")); }, 300);
  });

  // Modo app: funciona sin señal mostrando la última versión descargada
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
