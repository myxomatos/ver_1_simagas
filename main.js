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
      if (e.name === 'AbortError') {
        throw new Error('Timeout: el servidor tardó demasiado en responder.');
      }
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

  function setBtnLoading(btn, isLoading, labelWhenIdle = 'Cargar') {
    if (!btn) return;

    if (isLoading) {
      btn.disabled = true;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Cargando...
    `;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalHtml || labelWhenIdle;
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
  // Clientes (cliente.html) + Debug en varios.html
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
  // Dropdown de cliente (varios.html)
  // =========================
  function getSelectedClient() {
    const sel = document.getElementById('cliSelect');
    return (sel?.value || '').trim();
  }

  function requireClientSelected() {
    const cli = getSelectedClient();
    if (!cli) {
      alert('Selecciona un cliente primero.');
      return null;
    }
    return cli;
  }

  async function loadClientsIntoDropdown() {
    const sel = document.getElementById('cliSelect');
    if (!sel) return;

    sel.innerHTML = `<option value="">-- Cargando clientes... --</option>`;

    try {
      const clients = await fetchJSON('/api/vencli');
      const list = Array.isArray(clients) ? clients : [];

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

  // Botón refrescar dropdown
  document
    .getElementById('refreshClientsBtn')
    ?.addEventListener('click', () => {
      loadClientsIntoDropdown();
    });

  // Al cargar la página, llena el dropdown (solo si existe el select)
  loadClientsIntoDropdown();

  // =========================
  // Edificios (varios.html) - TODO
  // =========================
  const loadEdiButton = wireBtn('loadEdiBtn', () =>
    loadIntoList({
      listId: 'EdiList',
      url: '/api/venedif',
      renderItem: (i) =>
        `CLIENTE ${i.edi_cli} EDIFICIO ${i.edi_llave} - ${i.edi_nombre} - ${i.edi_calle} - ${i.edi_colonia} - ${i.edi_pais} - ${i.edi_ruta}`,
      onStart: () => setBtnLoading(loadEdiButton, true),
      onEnd: () => setBtnLoading(loadEdiButton, false),
    }),
  );

  // Edificios (varios.html) - POR CLIENTE
  const loadEdiByCliButton = wireBtn('loadEdiByCliBtn', () => {
    const cli = requireClientSelected();
    if (!cli) return;

    loadIntoList({
      listId: 'EdiList',
      url: `/api/venedif?cli=${encodeURIComponent(cli)}`,
      renderItem: (i) =>
        `CLIENTE ${i.edi_cli} EDIFICIO ${i.edi_llave} - ${i.edi_nombre} - ${i.edi_calle} - ${i.edi_colonia} - ${i.edi_pais} - ${i.edi_ruta}`,
      onStart: () => setBtnLoading(loadEdiByCliButton, true),
      onEnd: () => setBtnLoading(loadEdiByCliButton, false),
    });
  });

  // =========================
  // Tanques (varios.html) - TODO
  // =========================
  const loadTqeButton = wireBtn('loadTqeBtn', () =>
    loadIntoList({
      listId: 'TqeList',
      url: '/api/ventanq',
      sortFn: (a, b) =>
        (a.tqe_medidor || '').localeCompare(b.tqe_medidor || ''),
      renderItem: (i) =>
        `CLIENTE ${i.tqe_cli} EDIFICIO ${i.tqe_edi} MEDIDOR/TQE ${i.tqe_medidor} - ${i.tqe_capacidad} - ${i.tqe_f_alt} - ${i.tqe_f_mod}`,
      onStart: () => setBtnLoading(loadTqeButton, true),
      onEnd: () => setBtnLoading(loadTqeButton, false),
    }),
  );

  // Tanques (varios.html) - POR CLIENTE
  const loadTqeByCliButton = wireBtn('loadTqeByCliBtn', () => {
    const cli = requireClientSelected();
    if (!cli) return;

    loadIntoList({
      listId: 'TqeList',
      url: `/api/ventanq?cli=${encodeURIComponent(cli)}`,
      sortFn: (a, b) =>
        (a.tqe_medidor || '').localeCompare(b.tqe_medidor || ''),
      renderItem: (i) =>
        `CLIENTE ${i.tqe_cli} EDIFICIO ${i.tqe_edi} MEDIDOR/TQE ${i.tqe_medidor} - ${i.tqe_capacidad} - ${i.tqe_f_alt} - ${i.tqe_f_mod}`,
      onStart: () => setBtnLoading(loadTqeByCliButton, true),
      onEnd: () => setBtnLoading(loadTqeByCliButton, false),
    });
  });

  // =========================
  // Departamentos (varios.html) - TODO
  // =========================
  const loadDeptoButton = wireBtn('loadDeptoBtn', () =>
    loadIntoList({
      listId: 'DeptoList',
      url: '/api/vendepto',
      sortFn: (a, b) => (a.dep_depto || '').localeCompare(b.dep_depto || ''),
      renderItem: (i) =>
        `CLIENTE ${i.dep_cli} EDIFICIO ${i.dep_edi} MEDIDOR/TQE ${i.dep_tqe} DEPTO ${i.dep_depto} - ${i.dep_servicio} - ${i.dep_f_alt} - ${i.dep_f_mod}`,
      onStart: () => setBtnLoading(loadDeptoButton, true),
      onEnd: () => setBtnLoading(loadDeptoButton, false),
    }),
  );

  // Departamentos (varios.html) - POR CLIENTE
  const loadDeptoByCliButton = wireBtn('loadDeptoByCliBtn', () => {
    const cli = requireClientSelected();
    if (!cli) return;

    loadIntoList({
      listId: 'DeptoList',
      url: `/api/vendepto?cli=${encodeURIComponent(cli)}`,
      sortFn: (a, b) => (a.dep_depto || '').localeCompare(b.dep_depto || ''),
      renderItem: (i) =>
        `CLIENTE ${i.dep_cli} EDIFICIO ${i.dep_edi} MEDIDOR/TQE ${i.dep_tqe} DEPTO ${i.dep_depto} - ${i.dep_servicio} - ${i.dep_f_alt} - ${i.dep_f_mod}`,
      onStart: () => setBtnLoading(loadDeptoByCliButton, true),
      onEnd: () => setBtnLoading(loadDeptoByCliButton, false),
    });
  });

  // =========================
  // Departamentos Aux (varios.html) - TODO
  // =========================
  const loadDeptoAuxButton = wireBtn('loadDeptoAuxBtn', () =>
    loadIntoList({
      listId: 'DeptoAuxList',
      url: '/api/vendeptoaux',
      sortFn: (a, b) => (a.adep_depto || '').localeCompare(b.adep_depto || ''),
      renderItem: (i) =>
        `CLIENTE ${i.adep_cli} EDIFICIO ${i.adep_edi} MEDIDOR/TQE ${i.adep_tqe} DEPTO ${i.adep_depto} MEDIDOR ${i.adep_depto_medidor} SERVICIO ${i.adep_servicio} - ${i.adep_f_alt} - ${i.adep_f_mod}`,
      onStart: () => setBtnLoading(loadDeptoAuxButton, true),
      onEnd: () => setBtnLoading(loadDeptoAuxButton, false),
    }),
  );

  // Departamentos Aux (varios.html) - POR CLIENTE
  const loadDeptoAuxByCliButton = wireBtn('loadDeptoAuxByCliBtn', () => {
    const cli = requireClientSelected();
    if (!cli) return;

    loadIntoList({
      listId: 'DeptoAuxList',
      url: `/api/vendeptoaux?cli=${encodeURIComponent(cli)}`,
      sortFn: (a, b) => (a.adep_depto || '').localeCompare(b.adep_depto || ''),
      renderItem: (i) =>
        `CLIENTE ${i.adep_cli} EDIFICIO ${i.adep_edi} MEDIDOR/TQE ${i.adep_tqe} DEPTO ${i.adep_depto} MEDIDOR ${i.adep_depto_medidor} SERVICIO ${i.adep_servicio} - ${i.adep_f_alt} - ${i.adep_f_mod}`,
      onStart: () => setBtnLoading(loadDeptoAuxByCliButton, true),
      onEnd: () => setBtnLoading(loadDeptoAuxByCliButton, false),
    });
  });

  wireBtn('resetVariosBtn', () => {
    // Limpia listas
    const listIds = [
      'EdiList',
      'TqeList',
      'DeptoList',
      'DeptoAuxList',
      'CtesList',
    ];
    for (const id of listIds) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    }

    // Resetea contador KPI
    const depsBox = document.getElementById('depsCountBox');
    if (depsBox)
      depsBox.textContent = 'Selecciona un cliente y ejecuta una acción.';

    // Resetea selector cliente (sin borrar opciones)
    const sel = document.getElementById('cliSelect');
    if (sel) sel.value = '';

    const selected = document.getElementById('selectedClientValue');
    if (selected) selected.textContent = 'Ninguno';
  });

  // =========================
  // Contar departamentos por cliente (dropdown)
  // =========================
  const countDepsButton = wireBtn('countDepsBtn', () => {
    const cli = requireClientSelected();
    if (!cli) return;
    loadDeptCount(cli);
  });

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

  // =========================
  // clientes.html - helpers
  // =========================
  function formToObject(formEl) {
    const fd = new FormData(formEl);
    const obj = {};
    for (const [k, v] of fd.entries()) {
      if (k === 'advanced_json') continue;
      const val = (v ?? '').toString().trim();
      if (val === '') continue;

      // Convertir números comunes
      if (
        ['cli_tipo_adm', 'cli_ruta', 'cli_lista_pre', 'cli_plazo'].includes(k)
      ) {
        obj[k] = Number(val);
        continue;
      }
      if (['cli_limite', 'cli_saldo'].includes(k)) {
        obj[k] = Number(val);
        continue;
      }

      obj[k] = val;
    }

    const adv = (fd.get('advanced_json') || '').toString().trim();
    if (adv) {
      let advObj;
      try {
        advObj = JSON.parse(adv);
      } catch {
        throw new Error('JSON avanzado inválido');
      }
      Object.assign(obj, advObj);
    }

    return obj;
  }

  function pretty(obj) {
    return `<pre class="mb-0">${JSON.stringify(obj, null, 2)}</pre>`;
  }

  // Limpiar lista clientes
  wireBtn('clearCtesBtn', () => {
    const ul = document.getElementById('CtesList');
    if (ul) ul.innerHTML = '';
  });

  // =========================
  // GET /api/vencli/:cli_llave (buscar)
  // =========================
  wireBtn('getCliBtn', async () => {
    const key = (document.getElementById('getCliKey')?.value || '').trim();
    const box = document.getElementById('getCliResult');
    if (!box) return;

    if (!key) {
      box.className = 'alert alert-warning mb-0';
      box.textContent = 'Escribe una llave (ej. C0000001).';
      return;
    }

    box.className = 'alert alert-info mb-0';
    box.textContent = 'Buscando...';

    try {
      const data = await fetchJSON(`/api/vencli/${encodeURIComponent(key)}`);
      box.className = 'alert alert-success mb-0';
      box.innerHTML = pretty(data);

      // Autollenar form UPDATE
      const upd = document.getElementById('updateCliForm');
      if (upd) {
        upd.querySelector('[name="cli_llave"]').value = data.cli_llave || key;
        if (upd.querySelector('[name="cli_nombre"]'))
          upd.querySelector('[name="cli_nombre"]').value =
            data.cli_nombre || '';
        if (upd.querySelector('[name="cli_cp"]'))
          upd.querySelector('[name="cli_cp"]').value = data.cli_cp || '';
        if (upd.querySelector('[name="cli_mail"]'))
          upd.querySelector('[name="cli_mail"]').value = data.cli_mail || '';
      }
    } catch (e) {
      box.className = 'alert alert-danger mb-0';
      box.textContent = `Error: ${e.message}`;
    }
  });

  // =========================
  // POST /api/vencli (crear)
  // =========================
  document
    .getElementById('resetCreateCliBtn')
    ?.addEventListener('click', () => {
      document.getElementById('createCliForm')?.reset();
      const msg = document.getElementById('createCliMsg');
      if (msg) msg.textContent = '—';
    });

  document
    .getElementById('createCliForm')
    ?.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const msg = document.getElementById('createCliMsg');
      const btn = document.getElementById('createCliBtn');
      if (msg) {
        msg.className = 'alert alert-info border mb-0';
        msg.textContent = 'Creando...';
      }
      if (btn) btn.disabled = true;

      try {
        const body = formToObject(ev.target);
        await fetchJSON('/api/vencli', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (msg) {
          msg.className = 'alert alert-success border mb-0';
          msg.textContent = 'Cliente creado ✅';
        }

        // refrescar lista si está visible
        document.getElementById('loadCtesBtn')?.click();
      } catch (e) {
        if (msg) {
          msg.className = 'alert alert-danger border mb-0';
          msg.textContent = `Error: ${e.message}`;
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    });

  // =========================
  // PUT /api/vencli/:cli_llave (actualizar)
  // =========================
  document
    .getElementById('resetUpdateCliBtn')
    ?.addEventListener('click', () => {
      document.getElementById('updateCliForm')?.reset();
      const msg = document.getElementById('updateCliMsg');
      if (msg) msg.textContent = '—';
    });

  document
    .getElementById('updateCliForm')
    ?.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const msg = document.getElementById('updateCliMsg');
      const btn = document.getElementById('updateCliBtn');
      if (msg) {
        msg.className = 'alert alert-info border mb-0';
        msg.textContent = 'Actualizando...';
      }
      if (btn) btn.disabled = true;

      try {
        const form = ev.target;
        const key = (
          form.querySelector('[name="cli_llave"]')?.value || ''
        ).trim();
        if (!key) throw new Error('La llave es obligatoria para actualizar.');

        const body = formToObject(form);
        delete body.cli_llave; // la llave va en la URL

        await fetchJSON(`/api/vencli/${encodeURIComponent(key)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (msg) {
          msg.className = 'alert alert-success border mb-0';
          msg.textContent = 'Cliente actualizado ✅';
        }

        // refrescar lista si está visible
        document.getElementById('loadCtesBtn')?.click();
      } catch (e) {
        if (msg) {
          msg.className = 'alert alert-danger border mb-0';
          msg.textContent = `Error: ${e.message}`;
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    });
});
