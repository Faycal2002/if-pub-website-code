/*=============== DEMANDE DE DEVIS ===============*/
// Adresse qui reçoit les demandes de devis (via le service gratuit FormSubmit)
const DEVIS_EMAIL = "contact@ifpubdz.com";

/*----- Options de personnalisation de l'aperçu -----*/
const APERCU_COULEURS = [
  { name: "Rouge", hex: "#e6292e" },
  { name: "Bleu", hex: "#1d63ad" },
  { name: "Blanc", hex: "#ffffff" },
  { name: "Jaune", hex: "#f9c80e" },
  { name: "Vert", hex: "#2f9784" },
  { name: "Rose", hex: "#e60b7a" },
  { name: "Or", hex: "#c9a227" },
  { name: "Noir", hex: "#112e41" },
];

// Les polices sont chargées dans devis.html (Google Fonts)
const APERCU_POLICES = [
  { name: "Moderne", font: "'Oswald', sans-serif", weight: 700 },
  { name: "Élégante", font: "'Playfair Display', serif", weight: 700 },
  { name: "Manuscrite", font: "'Pacifico', cursive", weight: 400 },
  { name: "Arrondie", font: "'Poppins', sans-serif", weight: 700 },
  { name: "Classique", font: "'Roboto Slab', serif", weight: 700 },
  { name: "Arabe / bilingue", font: "'Cairo', sans-serif", weight: 700 },
];

const APERCU_FORMES = ["Rectangle", "Arrondie", "Ovale"];
const APERCU_ECLAIRAGES = ["Lettres lumineuses", "Caisson lumineux", "Rétro-éclairage"];

// Options affichées selon le type d'enseigne
const APERCU_OPTIONS = {
  fond: ["lumineuse", "nonlumineuse", "drapeau"],
  forme: ["lumineuse", "nonlumineuse", "drapeau", "plexiglas", "metal"],
  eclairage: ["lumineuse"],
};
const optionActive = (style, option) => APERCU_OPTIONS[option].includes(style);

// Réglages de départ de chaque type d'enseigne
const APERCU_DEFAUTS = {
  lumineuse: { couleur: "Blanc", fond: "Noir", police: "Moderne" },
  nonlumineuse: { couleur: "Blanc", fond: "Bleu", police: "Moderne" },
  neon: { couleur: "Rose", police: "Manuscrite", majuscules: false },
  drapeau: { couleur: "Blanc", fond: "Rouge", police: "Moderne", forme: "Ovale" },
  plexiglas: { couleur: "Noir", police: "Élégante" },
  metal: { couleur: "Noir", police: "Classique" },
};
const hexDe = (nom) => APERCU_COULEURS.find((c) => c.name === nom).hex;

const devisForm = document.getElementById("devis-form");

if (devisForm) {
  const list = document.getElementById("devis-list");
  const template = document.getElementById("devis-template");
  const addBtn = document.getElementById("devis-add");
  const submitBtn = document.getElementById("devis-submit");
  const status = document.getElementById("devis-status");
  const blocs = [];
  let prochainId = 1;

  /*=============== RÈGLES DES FICHIERS JOINTS ===============*/
  // Limite du service d'envoi (FormSubmit) : 10 Mo pour toute la demande
  const FICHIERS_MAX = 10 * 1024 * 1024;
  // Seulement des formats qui passent sans problème par email
  // (pas de programmes ni de scripts, pas d'archives ZIP/RAR souvent bloquées, pas de vidéos trop lourdes)
  const FICHIERS_FORMATS = ["jpg", "jpeg", "png", "gif", "webp", "heic", "pdf", "ai", "eps", "psd", "cdr", "svg", "doc", "docx", "txt"];

  const tailleLisible = (octets) =>
    octets < 1024 * 1024 ? `${Math.max(1, Math.round(octets / 1024))} Ko` : `${(octets / 1024 / 1024).toFixed(1)} Mo`;
  const poidsTotal = () => blocs.reduce((t, b) => t + b.fichiers.reduce((s, f) => s + f.size, 0), 0);
  const extension = (nom) => (nom.includes(".") ? nom.split(".").pop().toLowerCase() : "");

  /*=============== UN BLOC DEVIS (un seul produit par devis) ===============*/
  const creerBloc = () => {
    const id = prochainId++;
    const el = template.content.firstElementChild.cloneNode(true);
    const $ = (role) => el.querySelector(`[data-role="${role}"]`);

    const catsBox = $("cats");
    const itemsBox = $("items");
    const apercuStep = $("apercu-step");
    const tabsBox = $("tabs");
    const scene = $("scene");
    const apercuText = $("text");
    const apercuText2 = $("text2");
    const texteInput = $("input");
    const texte2Input = $("input2");
    const majInput = $("maj");

    // Étapes 1 et 2 : catégories et produits générés depuis le catalogue
    const itemsParValeur = new Map();
    DEVIS_CATALOGUE.forEach((cat) => {
      cat.items.forEach((item) => itemsParValeur.set(`${cat.label} : ${item.name}`, item));
      catsBox.insertAdjacentHTML(
        "beforeend",
        `<label class="devis__cat">
          <input type="radio" name="categorie-${id}" data-kind="categorie" value="${cat.id}" />
          <span><img src="${cat.icon}" alt="" />${cat.label}</span>
        </label>`
      );
      itemsBox.insertAdjacentHTML(
        "beforeend",
        `<div class="devis__group" data-cat="${cat.id}" hidden>
          <p class="devis__group-title">${cat.label}</p>
          <div class="devis__products">
            ${cat.items
              .map(
                (item) => `<label class="devis__product">
                  <input type="radio" name="produit-${id}" data-kind="produit" value="${cat.label} : ${item.name}"
                    data-item="${item.name}" data-apercu="${item.apercu || ""}"
                    data-img="${item.img || cat.icon}" />
                  <span class="devis__product-card">
                    ${
                      item.img
                        ? `<img class="devis__product-photo" src="${item.img}" alt="" loading="lazy" />`
                        : `<span class="devis__product-icon"><img src="${cat.icon}" alt="" /></span>`
                    }
                    <span class="devis__product-name">${item.name}</span>
                  </span>
                </label>`
              )
              .join("")}
          </div>
        </div>`
      );
    });

    // Valeur de départ d'une question : 1er choix, quantité par défaut ou vide
    const valeurParDefaut = (c) =>
      c.type === "choix" || c.type === "liste" ? c.options[0] : c.type === "nombre" ? String(c.defaut) : "";

    // Détails propres à chaque produit choisi (réponses aux questions et personnalisation)
    const details = new Map();
    const detailsDe = (input) => {
      if (!details.has(input.value)) {
        const reponses = {};
        itemsParValeur.get(input.value).champs.forEach((c) => (reponses[c.id] = valeurParDefaut(c)));
        details.set(input.value, {
          reponses,
          texte: "",
          ligne2: "",
          couleur: "Rouge",
          fond: "Noir",
          police: "Moderne",
          forme: "Rectangle",
          eclairage: APERCU_ECLAIRAGES[0],
          majuscules: true,
          ...APERCU_DEFAUTS[input.dataset.apercu],
        });
      }
      return details.get(input.value);
    };
    const produitsChoisis = () => [...itemsBox.querySelectorAll('[data-kind="produit"]:checked')];

    /*----- Étape détails : les questions propres au produit choisi -----*/
    const visible = (c, reponses) => !c.si || reponses[c.si[0]] === c.si[1];

    const renderChamp = (c) => {
      const nom = `champ-${id}-${c.id}`;
      let controle;
      if (c.type === "choix") {
        controle = `<div class="apercu__choix">${c.options
          .map(
            (o) => `<label class="apercu__chip">
              <input type="radio" name="${nom}" value="${o}" data-champ="${c.id}" />
              <span>${o}</span>
            </label>`
          )
          .join("")}</div>`;
      } else if (c.type === "liste") {
        controle = `<select data-champ="${c.id}" aria-label="${c.label}">${c.options
          .map((o) => `<option>${o}</option>`)
          .join("")}</select>`;
      } else {
        const type = { texte: "text", nombre: "number", date: "date" }[c.type];
        controle = `<input type="${type}" data-champ="${c.id}" aria-label="${c.label}"
          placeholder="${c.placeholder || ""}" ${c.type === "nombre" ? 'min="1"' : ""} />`;
      }
      const large = c.type === "choix" ? " devis__field--full" : "";
      return `<div class="devis__field${large}" data-question="${c.id}"><span>${c.label}</span>${controle}</div>`;
    };

    const renderLines = () => {
      const choix = produitsChoisis();
      $("lines-hint").hidden = choix.length > 0;
      $("lines-intro").hidden = !choix.length;
      $("files-zone").hidden = !choix.length;
      const linesBox = $("lines");
      linesBox.innerHTML = "";

      choix.forEach((input) => {
        const d = detailsDe(input);
        const champs = itemsParValeur.get(input.value).champs;
        const [categorie] = input.value.split(" : ");
        const line = document.createElement("div");
        line.className = "devis__line";
        line.innerHTML = `
          <div class="devis__line-head">
            <img src="${input.dataset.img}" alt="" class="${input.dataset.img.endsWith(".svg") ? "is-icon" : ""}" />
            <div><strong>${input.dataset.item}</strong><small>${categorie}</small></div>
          </div>
          <div class="devis__fields">${champs.map(renderChamp).join("")}</div>`;

        // Affiche les réponses déjà données et les questions conditionnelles
        const majVisibles = () =>
          champs.forEach((c) => (line.querySelector(`[data-question="${c.id}"]`).hidden = !visible(c, d.reponses)));
        line.querySelectorAll("[data-champ]").forEach((champ) => {
          const valeur = d.reponses[champ.dataset.champ];
          if (champ.type === "radio") champ.checked = champ.value === valeur;
          else champ.value = valeur;
        });
        majVisibles();

        const enregistrer = (e) => {
          if (!e.target.dataset.champ) return;
          d.reponses[e.target.dataset.champ] = e.target.value;
          majVisibles();
        };
        line.addEventListener("input", enregistrer);
        line.addEventListener("change", enregistrer);
        linesBox.appendChild(line);
      });
    };

    /*----- Aperçu en direct des enseignes et plaques -----*/
    let apercuActif = null; // produit affiché dans l'aperçu

    // Groupes de boutons radio : un réglage par groupe, mémorisé pour le produit actif
    const choixGroupes = [
      { field: "police", box: "polices", cls: "apercu__chip", options: APERCU_POLICES,
        attrs: (o) => `style="font-family: ${o.font}; font-weight: ${o.weight}"`, label: (o) => o.name },
      { field: "couleur", box: "couleurs", cls: "apercu__color", options: APERCU_COULEURS,
        attrs: (o) => `style="--sw: ${o.hex}"`, label: () => "" },
      { field: "fond", box: "fonds", cls: "apercu__color", options: APERCU_COULEURS,
        attrs: (o) => `style="--sw: ${o.hex}"`, label: () => "" },
      { field: "forme", box: "formes", cls: "apercu__chip", options: APERCU_FORMES.map((name) => ({ name })),
        attrs: () => "", label: (o) => o.name },
      { field: "eclairage", box: "eclairages", cls: "apercu__chip", options: APERCU_ECLAIRAGES.map((name) => ({ name })),
        attrs: () => "", label: (o) => o.name },
    ];
    choixGroupes.forEach((g) => {
      g.box = $(g.box);
      g.box.innerHTML = g.options
        .map(
          (o) => `<label class="${g.cls}" title="${o.name}">
            <input type="radio" name="apercu-${g.field}-${id}" value="${o.name}" aria-label="${o.name}" />
            <span ${g.attrs(o)}>${g.label(o)}</span>
          </label>`
        )
        .join("");
      g.box.addEventListener("change", (e) => {
        detailsDe(apercuActif)[g.field] = e.target.value;
        renderApercu();
      });
    });

    const renderApercu = () => {
      if (!apercuActif) return;
      const d = detailsDe(apercuActif);
      const style = apercuActif.dataset.apercu;
      const texte = d.texte.trim() || "Votre texte";
      const ligne2 = d.ligne2.trim();
      const police = APERCU_POLICES.find((p) => p.name === d.police);

      scene.dataset.style = style;
      scene.dataset.forme = d.forme;
      scene.dataset.eclairage = d.eclairage;
      scene.style.setProperty("--c", hexDe(d.couleur));
      scene.style.setProperty("--f", hexDe(d.fond));
      apercuText.textContent = texte;
      apercuText2.textContent = ligne2;
      apercuText2.hidden = !ligne2;

      // Plus le texte est long, plus il est petit
      let taille = Math.max(18, Math.min(52, Math.round(560 / Math.max(texte.length, 6))));
      if (style === "drapeau") taille = Math.round(taille * 0.5);
      const taille2 = Math.max(11, Math.round(taille * 0.42));
      [
        [apercuText, taille],
        [apercuText2, taille2],
      ].forEach(([elText, t]) => {
        elText.style.fontSize = `clamp(${Math.min(14, t)}px, ${(t / 4).toFixed(1)}vw, ${t}px)`;
        elText.style.fontFamily = police.font;
        elText.style.fontWeight = police.weight;
        elText.style.textTransform = d.majuscules ? "uppercase" : "none";
      });
    };

    const choixApercu = () => produitsChoisis().filter((i) => i.dataset.apercu);

    // Affiche dans les champs les réglages du produit actif
    const chargerApercu = () => {
      const d = detailsDe(apercuActif);
      const style = apercuActif.dataset.apercu;
      texteInput.value = d.texte;
      texte2Input.value = d.ligne2;
      majInput.checked = d.majuscules;
      choixGroupes.forEach((g) => (g.box.querySelector(`input[value="${d[g.field]}"]`).checked = true));
      apercuStep.querySelectorAll("[data-option]").forEach((champ) => {
        champ.hidden = !optionActive(style, champ.dataset.option);
      });
      const index = String(choixApercu().indexOf(apercuActif));
      tabsBox.querySelectorAll(".apercu__tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.index === index));
      renderApercu();
    };

    const updateApercu = () => {
      const choix = choixApercu();
      apercuStep.hidden = !choix.length;
      if (!choix.length) {
        apercuActif = null;
        return;
      }
      if (!choix.includes(apercuActif)) apercuActif = choix[0];

      tabsBox.innerHTML = choix
        .map((i, n) => `<button type="button" class="apercu__tab" data-index="${n}">${i.dataset.item}</button>`)
        .join("");
      tabsBox.hidden = choix.length < 2;
      chargerApercu();
    };

    tabsBox.addEventListener("click", (e) => {
      const tab = e.target.closest(".apercu__tab");
      if (!tab) return;
      apercuActif = choixApercu()[Number(tab.dataset.index)];
      chargerApercu();
    });
    texteInput.addEventListener("input", () => {
      detailsDe(apercuActif).texte = texteInput.value;
      renderApercu();
    });
    texte2Input.addEventListener("input", () => {
      detailsDe(apercuActif).ligne2 = texte2Input.value;
      renderApercu();
    });
    majInput.addEventListener("change", () => {
      detailsDe(apercuActif).majuscules = majInput.checked;
      renderApercu();
    });

    /*----- Fichiers joints à ce devis -----*/
    const fichiers = [];
    const drop = $("drop");
    const fichierInput = $("fichiers");

    const renderFichiers = () => {
      const liste = $("files");
      liste.innerHTML = "";
      fichiers.forEach((f, i) => {
        const li = document.createElement("li");
        li.className = "devis__file";
        li.innerHTML = `<span class="devis__file-name"></span><small>${tailleLisible(f.size)}</small>
          <button type="button" aria-label="Retirer ce fichier">×</button>`;
        li.querySelector(".devis__file-name").textContent = f.name;
        li.querySelector("button").addEventListener("click", () => {
          fichiers.splice(i, 1);
          renderFichiers();
          $("files-msg").textContent = "";
        });
        liste.appendChild(li);
      });
    };

    const ajouterFichiers = (liste) => {
      const formatRefuse = [];
      const tropLourd = [];
      [...liste].forEach((f) => {
        if (!FICHIERS_FORMATS.includes(extension(f.name))) formatRefuse.push(f.name);
        else if (fichiers.some((x) => x.name === f.name && x.size === f.size)) return; // déjà ajouté
        else if (poidsTotal() + f.size > FICHIERS_MAX) tropLourd.push(f.name);
        else fichiers.push(f);
      });
      renderFichiers();
      const messages = [];
      if (formatRefuse.length)
        messages.push(`Format non accepté : ${formatRefuse.join(", ")}. Formats acceptés : JPG, PNG, HEIC, PDF, AI, EPS, PSD, CDR, SVG, Word.`);
      if (tropLourd.length)
        messages.push(
          `Trop lourd : ${tropLourd.join(", ")}. La demande est limitée à 10 Mo au total ` +
            `(déjà utilisé : ${tailleLisible(poidsTotal())}). Vous pourrez nous l'envoyer en répondant à notre email.`
        );
      $("files-msg").textContent = messages.join(" ");
    };

    fichierInput.addEventListener("change", () => {
      ajouterFichiers(fichierInput.files);
      fichierInput.value = ""; // permet de choisir à nouveau le même fichier
    });
    ["dragenter", "dragover"].forEach((type) =>
      drop.addEventListener(type, (e) => {
        e.preventDefault();
        drop.classList.add("is-over");
      })
    );
    ["dragleave", "drop"].forEach((type) =>
      drop.addEventListener(type, (e) => {
        e.preventDefault();
        drop.classList.remove("is-over");
      })
    );
    drop.addEventListener("drop", (e) => ajouterFichiers(e.dataTransfer.files));

    /*----- Résumé affiché quand le bloc est réduit -----*/
    const renderResume = () => {
      const noms = produitsChoisis().map((i) => i.dataset.item);
      $("resume").textContent = noms.length ? noms.join(", ") : "Aucun produit choisi";
    };

    const updateProduits = () => {
      updateApercu();
      renderLines();
      renderResume();
    };
    itemsBox.addEventListener("change", updateProduits);

    // Affiche les produits des catégories cochées
    const updateGroups = () => {
      let anyChecked = false;
      catsBox.querySelectorAll("input").forEach((catInput) => {
        const group = itemsBox.querySelector(`[data-cat="${catInput.value}"]`);
        group.hidden = !catInput.checked;
        if (catInput.checked) anyChecked = true;
        else group.querySelectorAll("input").forEach((i) => (i.checked = false));
      });
      $("hint").hidden = anyChecked;
      updateProduits();
    };
    catsBox.addEventListener("change", updateGroups);

    // Présélection d'un produit (boutons "Demander un devis" du site)
    const preselectionner = (catId, item) => {
      const catInput = catsBox.querySelector(`input[value="${catId}"]`);
      if (!catInput) return;
      catInput.checked = true;
      itemsBox.querySelectorAll(`[data-cat="${catId}"] input`).forEach((i) => {
        if (i.dataset.item === item) i.checked = true;
      });
      updateGroups();
    };

    // Une ligne lisible par produit dans l'email
    const resumeProduit = (input) => {
      const d = detailsDe(input);
      const parties = [input.value];
      itemsParValeur.get(input.value).champs.forEach((c) => {
        if (visible(c, d.reponses)) parties.push(`${c.label} : ${String(d.reponses[c.id]).trim() || "non précisé"}`);
      });
      const style = input.dataset.apercu;
      if (style) {
        parties.push(`Texte : « ${d.texte.trim() || "non précisé"} »`);
        if (d.ligne2.trim()) parties.push(`2e ligne : « ${d.ligne2.trim()} »`);
        parties.push(`Police : ${d.police}${d.majuscules ? " (majuscules)" : ""}`);
        parties.push(`Couleur du texte : ${d.couleur}`);
        if (optionActive(style, "fond")) parties.push(`Fond : ${d.fond}`);
        if (optionActive(style, "forme")) parties.push(`Forme : ${d.forme}`);
        if (optionActive(style, "eclairage")) parties.push(`Éclairage : ${d.eclairage}`);
      }
      return parties.join(" — ");
    };

    // Lignes de ce devis dans l'email
    const versEmail = (prefixe) => {
      const champs = {};
      produitsChoisis().forEach((input) => (champs[`${prefixe} – Produit`] = resumeProduit(input)));
      champs[`${prefixe} – Délai`] = $("delai").value;
      champs[`${prefixe} – Fichiers`] = fichiers.length ? fichiers.map((f) => f.name).join(", ") : "Aucun";
      champs[`${prefixe} – Description`] = $("description").value.trim() || "-";
      return champs;
    };

    const bloc = {
      el,
      fichiers,
      produitsChoisis,
      preselectionner,
      versEmail,
      setNumero: (n) => ($("num").textContent = n),
      reduire: (oui) => {
        el.classList.toggle("is-reduit", oui);
        $("toggle").textContent = oui ? "Modifier" : "Réduire";
      },
    };
    $("toggle").addEventListener("click", () => bloc.reduire(!el.classList.contains("is-reduit")));
    // Met en avant la remarque sur le tarif quand le délai est urgent
    $("delai").addEventListener("change", () =>
      $("delai-note").classList.toggle("is-urgent", $("delai").selectedIndex === $("delai").options.length - 1)
    );
    $("remove").addEventListener("click", () => supprimerBloc(bloc));

    updateGroups();
    return bloc;
  };

  /*=============== LISTE DES DEVIS ===============*/
  const majListe = () => {
    blocs.forEach((b, n) => b.setNumero(n + 1));
    list.classList.toggle("is-multiple", blocs.length > 1);
    submitBtn.textContent =
      blocs.length > 1 ? `Envoyer mes ${blocs.length} demandes de devis` : "Envoyer ma demande de devis";
  };

  const ajouterBloc = () => {
    blocs.forEach((b) => b.reduire(true)); // les devis précédents sont réduits
    const bloc = creerBloc();
    blocs.push(bloc);
    list.appendChild(bloc.el);
    majListe();
    return bloc;
  };

  const supprimerBloc = (bloc) => {
    if (blocs.length < 2) return;
    if (bloc.produitsChoisis().length && !confirm("Supprimer ce devis ?")) return;
    blocs.splice(blocs.indexOf(bloc), 1);
    bloc.el.remove();
    // S'il ne reste que des devis réduits, on rouvre le dernier pour qu'il reste modifiable
    if (blocs.every((b) => b.el.classList.contains("is-reduit"))) blocs[blocs.length - 1].reduire(false);
    majListe();
  };

  addBtn.addEventListener("click", () => {
    const bloc = ajouterBloc();
    bloc.el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Premier devis, avec le produit choisi sur la page d'accueil (devis.html?cat=...&item=...)
  const premier = ajouterBloc();
  const params = new URLSearchParams(window.location.search);
  if (params.get("cat")) premier.preselectionner(params.get("cat"), params.get("item"));

  const showStatus = (message, type = "") => {
    status.textContent = message;
    status.className = "devis__status" + (type ? ` is-${type}` : "");
  };

  /*=============== ENVOI DE TOUS LES DEVIS PAR EMAIL ===============*/
  devisForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(devisForm);

    const vide = blocs.find((b) => !b.produitsChoisis().length);
    if (vide) {
      vide.reduire(false);
      vide.el.scrollIntoView({ behavior: "smooth", block: "start" });
      const n = blocs.indexOf(vide) + 1;
      showStatus(
        blocs.length > 1
          ? `Le devis ${n} ne contient aucun produit : choisissez un produit ou supprimez ce devis.`
          : "Choisissez un produit.",
        "error"
      );
      return;
    }
    if (!devisForm.checkValidity()) {
      devisForm.reportValidity();
      return;
    }
    if (data.get("_honey")) return;

    submitBtn.disabled = true;
    showStatus("Envoi en cours…");

    let lignes = {};
    blocs.forEach((b, n) => (lignes = { ...lignes, ...b.versEmail(`Devis ${n + 1}`) }));
    const nombre = blocs.length > 1 ? ` (${blocs.length} devis)` : "";

    try {
      // Envoi en multipart pour pouvoir joindre les fichiers
      const envoi = new FormData();
      Object.entries({
        _subject: `Demande de devis${nombre} – ${data.get("nom")}`,
        _template: "table",
        _replyto: data.get("email"),
        ...lignes,
        Nom: data.get("nom"),
        Téléphone: data.get("telephone"),
        Email: data.get("email"),
        Ville: data.get("ville") || "-",
        Entreprise: data.get("entreprise") || "-",
      }).forEach(([cle, valeur]) => envoi.append(cle, valeur));
      blocs
        .flatMap((b) => b.fichiers)
        .forEach((f, i) => envoi.append(`attachment${i ? i + 1 : ""}`, f, f.name));

      const res = await fetch(`https://formsubmit.co/ajax/${DEVIS_EMAIL}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: envoi,
      });
      const json = await res.json();
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message);

      // On repart d'un formulaire vide avec un seul devis
      devisForm.reset();
      blocs.splice(0).forEach((b) => b.el.remove());
      ajouterBloc();
      showStatus("Merci ! Votre demande a bien été envoyée. Nous vous recontactons très vite avec votre devis.", "success");
    } catch (err) {
      showStatus("L'envoi n'a pas fonctionné. Réessayez ou appelez notre service commercial au 0777 50 68 62.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}
