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

  // ===== Cargar usuarios (usuario.html) =====
  const loadUsersBtn = document.getElementById("loadUsersBtn");
  if (loadUsersBtn) {
    loadUsersBtn.addEventListener("click", loadUsers);
  }

  async function loadUsers() {
    const list = document.getElementById("usersList");
    if (!list) return;

    list.innerHTML = "<li>Cargando...</li>";

    const res = await fetch("/api/users");
    const users = await res.json();

    list.innerHTML = "";
    users.forEach((u) => {
      const li = document.createElement("li");
      li.textContent = `#${u.id} - ${u.name} (${u.created_at})`;
      list.appendChild(li);
    });
  }
});