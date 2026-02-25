document.addEventListener("DOMContentLoaded", () => {
  // ===== Contador (de 2 en 2) =====
  let count = 0;

  const boton = document.getElementById("botton_prueba");
  const contador = document.getElementById("contador");

  if (boton && contador) {
    boton.addEventListener("click", () => {
      count += 2;
      contador.textContent = count;
    });
  }

  // ===== Crear usuario (index.html) =====
  const createUserBtn = document.getElementById("createUserBtn");
  if (createUserBtn) {
    createUserBtn.addEventListener("click", async () => {
      const input = document.getElementById("nameInput");
      const name = (input?.value || "").trim();

      if (!name) return alert("Escribe un nombre");

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return alert("Error: " + (err.error || res.status));
      }

      input.value = "";
      alert("Usuario guardado en SQL ✅");
    });
  }

  // ===== Cargar Usuarios (usuario.html) =====
  const loadUsersBtn = document.getElementById("loadUsersBtn");
  if (loadUsersBtn) {
    loadUsersBtn.addEventListener("click", loadUsers);
  }

  async function loadUsers() {
    const list = document.getElementById("UsersList");
    if (!list) return;

    list.innerHTML = "<li>Cargando...</li>";

    const res = await fetch("/api/users");
    const users = await res.json();
  
    users.sort((a, b) => a.name.localeCompare(b.name));
    list.innerHTML = "";
    users.forEach((u) => {
      const li = document.createElement("li");
      li.textContent = `${u.id} - ${u.name} - (${u.created_at})`;
      list.appendChild(li);
    });
  }

  // ===== Cargar Clientes (cliente.html) =====
  const loadCtesBtn = document.getElementById("loadCtesBtn");
  if (loadCtesBtn) {
    loadCtesBtn.addEventListener("click", loadCtes);
  }

  async function loadCtes() {
    const list = document.getElementById("CtesList");
    if (!list) return;

    list.innerHTML = "<li>Cargando...</li>";

    const res = await fetch("/api/vencli");
    const ctes = await res.json();
  
    ctes.sort((a, b) => a.cli_nombre.localeCompare(b.cli_nombre));
    list.innerHTML = "";
    ctes.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = `CLIENTE ${i.cli_llave} - ${i.cli_nombre} - ${i.cli_calle} - ${i.cli_colonia} - ${i.cli_cp} - ${i.cli_pais} - ${i.cli_rfc}`;
      list.appendChild(li);
    });
  }

  // ===== Cargar Edificios (varios.html) =====
  const loadEdiBtn = document.getElementById("loadEdiBtn");
  if (loadEdiBtn) {
    loadEdiBtn.addEventListener("click", loadEdi);
  }

  async function loadEdi() {
    const list = document.getElementById("EdiList");
    if (!list) return;

    list.innerHTML = "<li>Cargando...</li>";

    const res = await fetch("/api/venedif");
    const edi = await res.json();
  
    // edi.sort((a, b) => a.edi_nombre.localeCompare(b.edi_nombre));
    list.innerHTML = "";
    edi.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = `CLIENTE ${i.edi_cli} EDIFICIO ${i.edi_llave} - ${i.edi_nombre} - ${i.edi_calle} - ${i.edi_colonia} - ${i.edi_pais} - ${i.edi_ruta}`;
      list.appendChild(li);
    });
  }

  // ===== Cargar Tanques (varios.html) =====
  const loadTqeBtn = document.getElementById("loadTqeBtn");
  if (loadTqeBtn) {
    loadTqeBtn.addEventListener("click", loadTqe);
  }

  async function loadTqe() {
    const list = document.getElementById("TqeList");
    if (!list) return;

    list.innerHTML = "<li>Cargando...</li>";

    const res = await fetch("/api/ventanq");
    const tqe = await res.json();
  
    tqe.sort((a, b) => a.tqe_medidor.localeCompare(b.tqe_medidor));
    list.innerHTML = "";
    tqe.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = `CLIENTE ${i.tqe_cli} EDIFICIO ${i.tqe_edi} MEDIDOR/TQE ${i.tqe_medidor} - ${i.tqe_capacidad} - ${i.tqe_f_alt} - ${i.tqe_f_mod}`;
      list.appendChild(li);
    });
  }

  // ===== Cargar Departamento (varios.html) =====
  const loadDeptoBtn = document.getElementById("loadDeptoBtn");
  if (loadDeptoBtn) {
    loadDeptoBtn.addEventListener("click", loadDepto);
  }

  async function loadDepto() {
    const list = document.getElementById("DeptoList");
    if (!list) return;

    list.innerHTML = "<li>Cargando...</li>";

    const res = await fetch("/api/vendepto");
    const depto = await res.json();
  
    depto.sort((a, b) => a.dep_depto.localeCompare(b.dep_depto));
    list.innerHTML = "";
    depto.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = `CLIENTE ${i.dep_cli} EDIFICIO ${i.dep_edi} MEDIDOR/TQE ${i.dep_tqe} DEPTO ${i.dep_depto} - ${i.dep_servicio} - ${i.dep_f_alt} - ${i.dep_f_mod}`;
      list.appendChild(li);
    });
  }

  // ===== Cargar Departamento Auxiliar (varios.html) =====
  const loadDeptoAuxBtn = document.getElementById("loadDeptoAuxBtn");
  if (loadDeptoAuxBtn) {
    loadDeptoAuxBtn.addEventListener("click", loadDeptoAux);
  }

  async function loadDeptoAux() {
    const list = document.getElementById("DeptoAuxList");
    if (!list) return;

    list.innerHTML = "<li>Cargando...</li>";

    const res = await fetch("/api/vendeptoaux");
    const deptoaux = await res.json();
  
    deptoaux.sort((a, b) => a.adep_depto.localeCompare(b.adep_depto));
    list.innerHTML = "";
    deptoaux.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = `CLIENTE ${i.adep_cli} EDIFICIO ${i.adep_edi} MEDIDOR/TQE ${i.adep_tqe} DEPTO ${i.adep_depto} MEDIDOR ${i.adep_depto_medidor} SERVICIO ${i.adep_servicio} - ${i.adep_f_alt} - ${i.adep_f_mod}`;
      list.appendChild(li);
    });
  }


});