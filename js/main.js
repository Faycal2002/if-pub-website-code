/*=============== MENU DES CATÉGORIES ===============*/
// Construit à partir du catalogue (js/catalogue.js) : chaque produit mène
// directement à la page devis avec ce produit déjà sélectionné.
const MENU_ORDRE = ["enseignes", "impression", "supports", "flocage", "design"];
const navMenu = document.getElementById("nav-menu");
const catbar = document.getElementById("catbar");

if (navMenu && typeof DEVIS_CATALOGUE !== "undefined") {
  const lienDevis = (cat, item) => `devis.html?cat=${cat.id}&item=${encodeURIComponent(item.name)}`;

  navMenu.innerHTML = MENU_ORDRE.map((id) => DEVIS_CATALOGUE.find((cat) => cat.id === id))
    .map(
      (cat) => `<li class="catbar__item">
        <button type="button" class="catbar__btn" aria-expanded="false">${cat.label}</button>
        <div class="mega">
          <div class="container">
            <p class="mega__title">${cat.label}</p>
            <div class="mega__grid">
              ${cat.items
                .map(
                  (item) => `<a class="mega__item" href="${lienDevis(cat, item)}">
                    ${
                      item.img
                        ? `<img class="mega__img" src="${item.img}" alt="" loading="lazy" />`
                        : `<span class="mega__img mega__img--icon"><img src="${cat.icon}" alt="" /></span>`
                    }
                    <span class="mega__name">${item.name === "Autre" ? "Autre demande" : item.name}</span>
                    <span class="mega__cta">Faire un devis →</span>
                  </a>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </li>`
    )
    .join("");

  // Clic sur une catégorie : ouvre ses produits (mobile, tablette, clavier)
  const fermerTout = (sauf) =>
    navMenu.querySelectorAll(".catbar__item.is-open").forEach((li) => {
      if (li === sauf) return;
      li.classList.remove("is-open");
      li.querySelector(".catbar__btn").setAttribute("aria-expanded", "false");
    });
  navMenu.querySelectorAll(".catbar__btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const li = btn.parentElement;
      fermerTout(li);
      const ouvert = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(ouvert));
    })
  );
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target)) fermerTout();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerTout();
  });
}

/*===== MENU MOBILE (bouton burger) =====*/
const navToggle = document.getElementById("nav-toggle");
if (navToggle && catbar) {
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const ouvert = catbar.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(ouvert));
  });
}

/*=============== SHOW SCROLL UP BUTTON ===============*/
function scrollUp() {
  const scrollUp = document.getElementById("scroll-up");
  // When the scroll is higher than 560 viewport height, show the scroll top button
  this.scrollY >= 560
    ? scrollUp.classList.add("show-scroll")
    : scrollUp.classList.remove("show-scroll");
}
window.addEventListener("scroll", scrollUp);

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
  origin: "top",
  distance: "60px",
  duration: 2000,
  delay: 200,
  //     reset: true
});

sr.reveal(".home__data, .about__img, .skills__subtitle, .skills__text", {});
sr.reveal(".home__img, .about__subtitle, .about__text, .skills__img", {
  delay: 400,
});
sr.reveal(".home__social-icon", { interval: 200 });
sr.reveal(".skills__data, .project__img, .contact__input", { interval: 200 });
