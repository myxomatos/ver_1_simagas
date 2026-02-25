document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Helpers reutilizables
  // =========================
  async function fetchJSON(url, options = {}) {
    // Timeout sencillo (8s). Evita que se quede “cargando” por siempre.
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 8000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text; // por si llega HTML o texto plano
      }

      if (!res.ok) {
        const msg =
          (data && typeof data === 'object' && (data.error || data.details)) ||
          (typeof data === 'string' && data) ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // Soporta { ok: true, data: ... }
      if (data && typeof data === 'object' && 'ok' in data && 'data' in data) {
        return data.data;
      }

      return data;
    } catch (e) {
      // Mensaje más amigable para aborts
      if (e.name === 'AbortError')
        throw new Error('Timeout: el servidor tardó demasiado en responder.');
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  function renderList(listId, items, renderItem) {
    const list = document.getElementById(listId);
    if (!list) return;

    if (!items || items.length === 0) {
      list.innerHTML = '<li>Sin resultados</li>';
      return;
    }

    list.innerHTML = '';
    for (const item of items) {
      const li = document.createElement('li');
      li.textContent = renderItem(item);
      list.appendChild(li);
    }
  }

  async function loadIntoList({
    listId,
    url,
    sortFn,
    renderItem,
    loadingText = 'Cargando...',
    timeoutMs = 8000,
    onStart,
    onEnd,
  }) {
    const list = document.getElementById(listId);
    if (!list) return;

    list.innerHTML = `<li>${loadingText}</li>`;
    onStart?.();

    try {
      const items = await fetchJSON(url, { timeoutMs });
      if (Array.isArray(items) && sortFn) items.sort(sortFn);
      renderList(listId, items, renderItem);
    } catch (e) {
      list.innerHTML = `<li>Error: ${e.message}</li>`;
      console.error(e);
    } finally {
      onEnd?.();
    }
  }

  function wireBtn(btnId, handler) {
    const btn = document.getElementById(btnId);
    if (!btn) return null;
    btn.addEventListener('click', handler);
    return btn;
  }

  // =========================
  // Contador (de 2 en 2)
  // =========================
  let count = 0;
  const boton = document.getElementById('botton_prueba');
  const contador = document.getElementById('contador');
  if (boton && contador) {
    boton.addEventListener('click', () => {
      count += 2;
      contador.textContent = String(count);
    });
  }

  // =========================
  // Crear usuario (index.html)
  // =========================
  const createUserButton = wireBtn('createUserBtn', async () => {
    const input = document.getElementById('nameInput');
    const name = (input?.value || '').trim();
    if (!name) return alert('Escribe un nombre');

    // Evita doble click
    if (createUserButton) createUserButton.disabled = true;

    try {
      await fetchJSON('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        timeoutMs: 8000,
      });

      input.value = '';
      alert('Usuario guardado en SQL ✅');
    } catch (e) {
      alert('Error: ' + e.message);
      console.error(e);
    } finally {
      if (createUserButton) createUserButton.disabled = false;
    }
  });

  // =========================
  // Usuarios (usuario.html)
  // =========================
  const loadUsersButton = wireBtn('loadUsersBtn', () =>
    loadIntoList({
      listId: 'UsersList',
      url: '/api/users',
      sortFn: (a, b) => (a.name || '').localeCompare(b.name || ''),
      renderItem: (u) => `${u.id} - ${u.name} - (${u.created_at})`,
      onStart: () => loadUsersButton && (loadUsersButton.disabled = true),
      onEnd: () => loadUsersButton && (loadUsersButton.disabled = false),
    }),
  );

  // =========================
  // Clientes (cliente.html)
  // =========================
  const loadCtesButton = wireBtn('loadCtesBtn', () =>
    loadIntoList({
      listId: 'CtesList',
      url: '/api/vencli',
      sortFn: (a, b) => (a.cli_nombre || '').localeCompare(b.cli_nombre || ''),
      renderItem: (i) =>
        `CLIENTE ${i.cli_llave} - ${i.cli_nombre} - ${i.cli_calle} - ${i.cli_colonia} - ${i.cli_cp} - ${i.cli_pais} - ${i.cli_rfc}`,
      onStart: () => loadCtesButton && (loadCtesButton.disabled = true),
      onEnd: () => loadCtesButton && (loadCtesButton.disabled = false),
    }),
  );

  // =========================
  // Edificios (varios.html)
  // =========================
  const loadEdiButton = wireBtn('loadEdiBtn', () =>
    loadIntoList({
      listId: 'EdiList',
      url: '/api/venedif',
      renderItem: (i) =>
        `CLIENTE ${i.edi_cli} EDIFICIO ${i.edi_llave} - ${i.edi_nombre} - ${i.edi_calle} - ${i.edi_colonia} - ${i.edi_pais} - ${i.edi_ruta}`,
      onStart: () => loadEdiButton && (loadEdiButton.disabled = true),
      onEnd: () => loadEdiButton && (loadEdiButton.disabled = false),
    }),
  );

  // =========================
  // Tanques (varios.html)
  // =========================
  const loadTqeButton = wireBtn('loadTqeBtn', () =>
    loadIntoList({
      listId: 'TqeList',
      url: '/api/ventanq',
      sortFn: (a, b) =>
        (a.tqe_medidor || '').localeCompare(b.tqe_medidor || ''),
      renderItem: (i) =>
        `CLIENTE ${i.tqe_cli} EDIFICIO ${i.tqe_edi} MEDIDOR/TQE ${i.tqe_medidor} - ${i.tqe_capacidad} - ${i.tqe_f_alt} - ${i.tqe_f_mod}`,
      onStart: () => loadTqeButton && (loadTqeButton.disabled = true),
      onEnd: () => loadTqeButton && (loadTqeButton.disabled = false),
    }),
  );

  // =========================
  // Departamentos (varios.html)
  // =========================
  const loadDeptoButton = wireBtn('loadDeptoBtn', () =>
    loadIntoList({
      listId: 'DeptoList',
      url: '/api/vendepto',
      sortFn: (a, b) => (a.dep_depto || '').localeCompare(b.dep_depto || ''),
      renderItem: (i) =>
        `CLIENTE ${i.dep_cli} EDIFICIO ${i.dep_edi} MEDIDOR/TQE ${i.dep_tqe} DEPTO ${i.dep_depto} - ${i.dep_servicio} - ${i.dep_f_alt} - ${i.dep_f_mod}`,
      onStart: () => loadDeptoButton && (loadDeptoButton.disabled = true),
      onEnd: () => loadDeptoButton && (loadDeptoButton.disabled = false),
    }),
  );

  // =========================
  // Departamentos Aux (varios.html)
  // =========================
  const loadDeptoAuxButton = wireBtn('loadDeptoAuxBtn', () =>
    loadIntoList({
      listId: 'DeptoAuxList',
      url: '/api/vendeptoaux',
      sortFn: (a, b) => (a.adep_depto || '').localeCompare(b.adep_depto || ''),
      renderItem: (i) =>
        `CLIENTE ${i.adep_cli} EDIFICIO ${i.adep_edi} MEDIDOR/TQE ${i.adep_tqe} DEPTO ${i.adep_depto} MEDIDOR ${i.adep_depto_medidor} SERVICIO ${i.adep_servicio} - ${i.adep_f_alt} - ${i.adep_f_mod}`,
      onStart: () => loadDeptoAuxButton && (loadDeptoAuxButton.disabled = true),
      onEnd: () => loadDeptoAuxButton && (loadDeptoAuxButton.disabled = false),
    }),
  );

  // =========================
  // Contar departamentos por cliente
  // =========================
  const countDepsButton = wireBtn('countDepsBtn', originalCountHandler);

  async function loadDeptCount(cli = 'C0000001') {
    const box = document.getElementById('depsCountBox');
    if (!box) return;

    box.textContent = 'Cargando...';
    if (countDepsButton) countDepsButton.disabled = true;

    try {
      const data = await fetchJSON(
        `/api/clientes/${encodeURIComponent(cli)}/departamentos/count`,
      );
      box.textContent = `Cliente ${data.cliente}: ${data.total_departamentos} departamentos`;
    } catch (e) {
      box.textContent = `Error: ${e.message}`;
      console.error(e);
    } finally {
      if (countDepsButton) countDepsButton.disabled = false;
    }
  }

  function getSelectedClient() {
    const sel = document.getElementById('cliSelect');
    return (sel?.value || '').trim();
  }

  async function loadClientsIntoDropdown() {
    const sel = document.getElementById('cliSelect');
    if (!sel) return;

    sel.innerHTML = `<option value="">-- Cargando clientes... --</option>`;

    try {
      const clients = await fetchJSON('/api/vencli');
      // clients puede venir como array (o data si ok:true)
      const list = Array.isArray(clients) ? clients : [];

      // Ordena por nombre
      list.sort((a, b) =>
        (a.cli_nombre || '').localeCompare(b.cli_nombre || ''),
      );

      sel.innerHTML = `<option value="">-- Selecciona un cliente --</option>`;
      for (const c of list) {
        const opt = document.createElement('option');
        opt.value = c.cli_llave;
        opt.textContent = `${c.cli_llave} - ${c.cli_nombre}`;
        sel.appendChild(opt);
      }
    } catch (e) {
      sel.innerHTML = `<option value="">Error cargando clientes</option>`;
      console.error(e);
    }
  }

  // Mostrar cliente seleccionado en el texto
  document.getElementById('cliSelect')?.addEventListener('change', () => {
    const cli = getSelectedClient();
    const out = document.getElementById('selectedClientValue');
    if (out) out.textContent = cli || 'Ninguno';
  });

  // Botón refrescar
  document
    .getElementById('refreshClientsBtn')
    ?.addEventListener('click', () => {
      loadClientsIntoDropdown();
    });

  // Al cargar la página, llena el dropdown
  loadClientsIntoDropdown();

  // Ajuste: contar usando el cliente seleccionado
  function originalCountHandler() {
    const cli = getSelectedClient();
    if (!cli) return alert('Selecciona un cliente primero.');
    loadDeptCount(cli);
  }

  // Si ya tenías wireBtn("countDepsBtn", ...) déjalo,
  // pero reemplázalo por esto:
  wireBtn('countDepsBtn', originalCountHandler);
});
