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
  
    // ctes.sort((a, b) => a.cli_nombre.localeCompare(b.cli_nombre));
    list.innerHTML = "";
    ctes.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = `${i.cli_llave} - ${i.cli_nombre} - ${i.cli_calle} - ${i.cli_colonia} - ${i.cli_cp} - ${i.cli_pais} - ${i.cli_rfc}`;
      list.appendChild(li);
    });
  }
});