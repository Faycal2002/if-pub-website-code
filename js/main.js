/*=============== MENU DES CATÉGORIES ===============*/
// Construit à partir du catalogue (js/catalogue.js). "Catégories" s'ouvre au survol :
// à gauche la liste des catégories, à droite les produits de la catégorie survolée.
// Chaque produit mène directement à la page devis avec ce produit déjà sélectionné.
// L'ordre des catégories est celui du catalogue : Design, Impression, Supports, Enseignes, Flocage.
// Raccourcis affichés directement dans la barre, dans le même ordre (catégorie, produit, texte affiché)
const MENU_RACCOURCIS = [
  ["design", "Logo / identité visuelle", "Logo"],
  ["impression", "Cartes de visite"],
  ["enseignes", "Enseigne lumineuse"],
  ["enseignes", "Néon / LED personnalisé", "Néon / LED"],
  ["enseignes", "Plaque en plexiglas"],
  ["flocage", "Flocage véhicule"],
];
const navMenu = document.getElementById("nav-menu");
const catbar = document.getElementById("catbar");

if (navMenu && typeof DEVIS_CATALOGUE !== "undefined") {
  const lienDevis = (catId, nom) => `devis.html?cat=${catId}&item=${encodeURIComponent(nom)}`;
  const categories = DEVIS_CATALOGUE;

  const carteProduit = (cat, item) => `<a class="mega__item" href="${lienDevis(cat.id, item.name)}">
      ${
        item.img
          ? `<img class="mega__img" src="${item.img}" alt="" loading="lazy" />`
          : `<span class="mega__img mega__img--icon"><img src="${cat.icon}" alt="" /></span>`
      }
      <span class="mega__name">${item.name === "Autre" ? "Autre demande" : item.name}</span>
      <span class="mega__cta">Faire un devis →</span>
    </a>`;

  navMenu.innerHTML =
    `<li class="catbar__item catbar__item--cats">
      <button type="button" class="catbar__btn" aria-expanded="false">
        <span class="catbar__burger" aria-hidden="true"></span>Catégories
      </button>
      <div class="mega">
        <div class="container">
          <ul class="mega__cats">
            ${categories
              .map(
                (cat, n) => `<li class="mega__cat-item${n === 0 ? " is-active" : ""}">
                  <button type="button" class="mega__cat">
                    <img src="${cat.icon}" alt="" />${cat.label}
                  </button>
                  <div class="mega__panel">
                    <p class="mega__title">${cat.label}</p>
                    <div class="mega__grid">${cat.items.map((item) => carteProduit(cat, item)).join("")}</div>
                  </div>
                </li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
    </li>` +
    MENU_RACCOURCIS.map(
      ([catId, nom, texte]) =>
        `<li class="catbar__item catbar__item--raccourci"><a class="catbar__link" href="${lienDevis(catId, nom)}">${texte || nom}</a></li>`
    ).join("");

  const menuCats = navMenu.querySelector(".catbar__item--cats");
  const btnCats = menuCats.querySelector(".catbar__btn");
  const ordinateur = window.matchMedia("(min-width: 993px)");

  const ouvrirMenu = (oui) => {
    menuCats.classList.toggle("is-open", oui);
    btnCats.setAttribute("aria-expanded", String(oui));
  };
  btnCats.addEventListener("click", () => ouvrirMenu(!menuCats.classList.contains("is-open")));
  document.addEventListener("click", (e) => {
    if (!menuCats.contains(e.target)) ouvrirMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ouvrirMenu(false);
  });

  // Ordinateur : le panneau prend la hauteur des produits affichés (pas de grand vide)
  const conteneur = menuCats.querySelector(".mega .container");
  const ajusterHauteur = () => {
    if (!ordinateur.matches) return (conteneur.style.minHeight = "");
    const panneau = menuCats.querySelector(".mega__cat-item.is-active .mega__panel");
    const liste = menuCats.querySelector(".mega__cats");
    conteneur.style.minHeight = `${Math.max(liste.offsetHeight, panneau ? panneau.offsetHeight : 0)}px`;
  };
  menuCats.addEventListener("mouseenter", ajusterHauteur);
  btnCats.addEventListener("click", ajusterHauteur);

  // Sur mobile, les catégories démarrent repliées
  if (!ordinateur.matches) menuCats.querySelector(".mega__cat-item").classList.remove("is-active");

  // Survol (ordinateur) ou clic : affiche les produits de cette catégorie
  menuCats.querySelectorAll(".mega__cat-item").forEach((li) => {
    const activer = () => {
      menuCats.querySelectorAll(".mega__cat-item.is-active").forEach((x) => x !== li && x.classList.remove("is-active"));
      li.classList.add("is-active");
      ajusterHauteur();
    };
    const btn = li.querySelector(".mega__cat");
    btn.addEventListener("mouseenter", () => ordinateur.matches && activer());
    btn.addEventListener("focus", () => ordinateur.matches && activer());
    btn.addEventListener("click", () => {
      // mobile : la catégorie se déplie ou se replie
      if (!ordinateur.matches && li.classList.contains("is-active")) li.classList.remove("is-active");
      else activer();
    });
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
