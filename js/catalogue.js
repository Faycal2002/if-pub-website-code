/*=============== CATALOGUE DES PRODUITS ===============*/
// Utilisé par le menu des catégories (js/main.js) et par la page devis (js/devis.js).
// Pour ajouter, retirer ou renommer un produit, c'est ici et nulle part ailleurs.

/*----- Questions posées pour chaque produit -----*/
// Types : "choix" (boutons), "liste" (menu déroulant), "texte", "nombre", "date".
// si: ["format", "Sur mesure"] → la question n'apparaît que si "format" vaut "Sur mesure".
const champChoix = (id, label, options, extra = {}) => ({ id, label, type: "choix", options, ...extra });
const champListe = (id, label, options, extra = {}) => ({ id, label, type: "liste", options, ...extra });
const champTexte = (id, label, placeholder = "", extra = {}) => ({ id, label, type: "texte", placeholder, ...extra });
const champNombre = (id, label, defaut = 1) => ({ id, label, type: "nombre", defaut });
const champDate = (id, label) => ({ id, label, type: "date" });

// Questions qui reviennent souvent
const CHAMP = {
  dimensions: champTexte("dimensions", "Dimensions (L x H)", "ex : 300 x 80 cm"),
  surMesure: (champ) => champTexte("dimensions", "Dimensions sur mesure", "ex : 45 x 25 cm", { si: [champ, "Sur mesure"] }),
  quantite: champNombre("quantite", "Quantité"),
  visuel: champChoix("visuel", "Visuel / fichier", ["Je l'ai déjà", "À créer par IF pub"]),
  faces: champChoix("faces", "Impression", ["Recto", "Recto-verso"]),
  emplacement: champChoix("emplacement", "Emplacement", ["Intérieur", "Extérieur"]),
  pose: champChoix("pose", "Pose / installation", ["À discuter", "Oui, avec pose", "Non, livraison seulement"]),
  style: champChoix("style", "Style souhaité", ["Moderne", "Classique", "Minimaliste", "Ludique", "Luxe"]),
  avecImpression: champChoix("impression", "Impression", ["Design seul", "Design + impression"]),
  precision: champTexte("precision", "Précisez votre besoin", "ex : ce que vous souhaitez, quantités, dimensions…"),
};
const FORMATS_PLAQUE = ["30 x 20 cm", "40 x 30 cm", "50 x 40 cm", "60 x 40 cm", "Sur mesure"];

// Pour ajouter ou retirer un choix proposé au client, il suffit de modifier cette liste.
//   img    : photo affichée (sans photo, c'est l'icône de la catégorie qui s'affiche)
//   apercu : style de l'aperçu en direct (plexiglas, metal, lumineuse, nonlumineuse, neon, drapeau)
//   champs : questions posées au client pour ce produit
const DEVIS_CATALOGUE = [
  {
    id: "design",
    label: "Design",
    icon: "svg/services/pen.svg",
    items: [
      {
        name: "Logo / identité visuelle",
        img: "img/products/logo.jpg",
        champs: [
          champTexte("marque", "Nom de l'entreprise / marque", "ex : El Amel"),
          champTexte("activite", "Activité", "ex : boulangerie, cabinet médical…"),
          champChoix("langue", "Langue du logo", ["Français", "Arabe", "Bilingue"]),
          CHAMP.style,
          champTexte("couleurs", "Couleurs souhaitées", "ex : bleu et or, ou libre"),
          champListe("livrables", "Ce qu'il vous faut", [
            "Logo seul",
            "Logo + charte graphique",
            "Identité complète (logo, cartes, papeterie)",
          ]),
        ],
      },
      {
        name: "Carte de visite",
        img: "img/products/product13.png",
        champs: [
          champTexte("noms", "Nom(s) à afficher", "ex : Dr Amrani – Dentiste"),
          CHAMP.faces,
          CHAMP.style,
          CHAMP.avecImpression,
          champListe("quantite", "Quantité", ["100", "250", "500", "1000", "2000"], { si: ["impression", "Design + impression"] }),
          champChoix("couleur", "Couleurs d'impression", ["Couleur", "Noir et blanc"], { si: ["impression", "Design + impression"] }),
        ],
      },
      {
        name: "Flyer / dépliant",
        img: "img/products/flyer.jpg",
        champs: [
          champChoix("format", "Format", ["A6", "A5", "A4", "DL (10 x 21 cm)"]),
          champChoix("pliage", "Pliage", ["Sans pliage", "2 volets", "3 volets"]),
          champChoix("textes", "Textes", ["Je fournis les textes", "À rédiger par IF pub"]),
          CHAMP.avecImpression,
          champListe("quantite", "Quantité", ["500", "1000", "2500", "5000", "10000"], { si: ["impression", "Design + impression"] }),
        ],
      },
      {
        name: "Affiche",
        img: "img/products/product9.png",
        champs: [
          champTexte("sujet", "Sujet / événement", "ex : promotion d'été, ouverture…"),
          champChoix("format", "Format", ["A3", "A2", "A1", "A0", "Sur mesure"]),
          CHAMP.surMesure("format"),
          CHAMP.avecImpression,
          { ...CHAMP.quantite, si: ["impression", "Design + impression"] },
        ],
      },
      {
        name: "Maquette d'enseigne",
        img: "img/products/maquette-enseigne.jpg",
        champs: [
          champTexte("commerce", "Nom du commerce", "ex : Pharmacie Ennour"),
          champListe("type", "Type d'enseigne", [
            "Lumineuse",
            "Non lumineuse",
            "Néon",
            "Verticale (drapeau)",
            "Je ne sais pas encore",
          ]),
          CHAMP.dimensions,
        ],
      },
      { name: "Autre", champs: [CHAMP.precision] },
    ],
  },
  {
    id: "impression",
    label: "Impression",
    icon: "svg/services/impriment.svg",
    items: [
      {
        name: "Cartes de visite",
        img: "img/products/product13.png",
        champs: [
          champListe("quantite", "Quantité", ["100", "250", "500", "1000", "2000"]),
          CHAMP.faces,
          champChoix("couleur", "Couleurs d'impression", ["Couleur", "Noir et blanc"]),
          champListe("papier", "Papier", ["Standard 350 g", "Pelliculé mat", "Pelliculé brillant", "Premium texturé"]),
          champChoix("coins", "Coins", ["Droits", "Arrondis"]),
          CHAMP.visuel,
        ],
      },
      {
        name: "Affiches",
        img: "img/products/product9.png",
        champs: [
          champChoix("format", "Format", ["A3", "A2", "A1", "A0", "Sur mesure"]),
          CHAMP.surMesure("format"),
          champChoix("papier", "Papier", ["Standard", "Photo brillant", "Dos bleu (extérieur)"]),
          CHAMP.quantite,
          CHAMP.visuel,
        ],
      },
      {
        name: "Flyers / dépliants",
        img: "img/products/flyer.jpg",
        champs: [
          champChoix("format", "Format", ["A6", "A5", "A4", "DL (10 x 21 cm)"]),
          champChoix("pliage", "Pliage", ["Sans pliage", "2 volets", "3 volets"]),
          CHAMP.faces,
          champListe("quantite", "Quantité", ["500", "1000", "2500", "5000", "10000"]),
          CHAMP.visuel,
        ],
      },
      {
        name: "Vinyle imprimé et toile",
        img: "img/products/product10.png",
        champs: [
          champListe("matiere", "Matière", ["Vinyle adhésif", "Bâche PVC", "Toile canvas", "Micro-perforé (vitrine)"]),
          CHAMP.dimensions,
          CHAMP.quantite,
          champChoix("finition", "Finition", ["Sans", "Œillets", "Ourlets", "Lamination"]),
          CHAMP.emplacement,
          CHAMP.visuel,
        ],
      },
      {
        name: "Impression sur matériaux rigides",
        img: "img/products/product12.png",
        champs: [
          champListe("support", "Support", ["Forex / PVC", "Dibond (alu composite)", "Plexiglas", "Akilux", "Bois"]),
          CHAMP.dimensions,
          CHAMP.quantite,
          CHAMP.emplacement,
          CHAMP.visuel,
        ],
      },
      { name: "Autre", champs: [CHAMP.precision, CHAMP.quantite] },
    ],
  },
  {
    id: "supports",
    label: "Supports publicitaires",
    icon: "svg/services/support.svg",
    items: [
      {
        name: "Roll up",
        img: "img/products/product8.png",
        champs: [
          champChoix("format", "Format", ["80 x 200 cm", "85 x 200 cm", "100 x 200 cm", "120 x 200 cm", "150 x 200 cm"]),
          CHAMP.quantite,
          champChoix("sac", "Sac de transport", ["Oui", "Non"]),
          CHAMP.visuel,
        ],
      },
      {
        name: "Panneau publicitaire",
        img: "img/products/panneau.jpg",
        champs: [
          CHAMP.dimensions,
          champChoix("faces", "Faces", ["Simple face", "Double face"]),
          CHAMP.emplacement,
          champChoix("fixation", "Fixation", ["Au mur", "Sur poteau", "Pied au sol"]),
          CHAMP.quantite,
          CHAMP.pose,
          CHAMP.visuel,
        ],
      },
      {
        name: "Support pour événement",
        img: "img/products/evenement.jpg",
        champs: [
          champListe("type", "Type de support", [
            "X-banner / kakemono",
            "Stand parapluie",
            "Comptoir promotionnel",
            "Totem",
            "Beach flag / oriflamme",
            "Photocall",
          ]),
          CHAMP.quantite,
          champDate("date", "Date de l'événement"),
          CHAMP.visuel,
        ],
      },
      { name: "Autre", champs: [CHAMP.precision, CHAMP.quantite] },
    ],
  },
  {
    id: "enseignes",
    label: "Enseignes",
    icon: "svg/services/enseigne.svg",
    items: [
      {
        name: "Enseigne lumineuse",
        img: "img/products/product5.png",
        apercu: "lumineuse",
        champs: [
          CHAMP.dimensions,
          champChoix("emplacement", "Emplacement", ["Façade", "Intérieur", "Toiture", "Totem / mât"]),
          champChoix("retrait", "Ancienne enseigne à retirer", ["Non", "Oui"]),
          CHAMP.pose,
        ],
      },
      {
        name: "Enseigne non lumineuse",
        img: "img/products/product6.png",
        apercu: "nonlumineuse",
        champs: [
          CHAMP.dimensions,
          champListe("matiere", "Matière", [
            "Dibond (alu composite)",
            "Forex / PVC",
            "Lettres découpées en relief",
            "Bois",
            "Je ne sais pas",
          ]),
          champChoix("emplacement", "Emplacement", ["Façade", "Intérieur", "Toiture", "Totem / mât"]),
          CHAMP.pose,
        ],
      },
      {
        name: "Néon / LED personnalisé",
        img: "img/products/product3.png",
        apercu: "neon",
        champs: [
          champChoix("taille", "Taille", ["Petit (~50 cm)", "Moyen (~100 cm)", "Grand (150 cm et +)", "Sur mesure"]),
          CHAMP.surMesure("taille"),
          CHAMP.emplacement,
          champListe("support", "Support", ["Plexi découpé à la forme", "Plexi rectangulaire", "Sans support (fixé au mur)"]),
          champChoix("variateur", "Variateur / télécommande", ["Non", "Oui"]),
        ],
      },
      {
        name: "Enseigne verticale (drapeau)",
        img: "img/products/product4.png",
        apercu: "drapeau",
        champs: [
          champChoix("format", "Format", ["50 x 50 cm", "60 x 60 cm", "70 x 70 cm", "Sur mesure"]),
          CHAMP.surMesure("format"),
          champChoix("lumineuse", "Lumineuse", ["Oui", "Non"]),
          CHAMP.pose,
        ],
      },
      {
        name: "Plaque en plexiglas",
        img: "img/products/product1.png",
        apercu: "plexiglas",
        champs: [
          champChoix("format", "Format", FORMATS_PLAQUE),
          CHAMP.surMesure("format"),
          champChoix("epaisseur", "Épaisseur", ["5 mm", "8 mm", "10 mm"]),
          champChoix("fixation", "Fixation", ["Entretoises", "Adhésif double face", "Perçage simple"]),
          CHAMP.quantite,
        ],
      },
      {
        name: "Plaque métallique",
        img: "img/products/product2.png",
        apercu: "metal",
        champs: [
          champChoix("format", "Format", FORMATS_PLAQUE),
          CHAMP.surMesure("format"),
          champChoix("matiere", "Matière", ["Aluminium brossé", "Inox", "Laiton doré"]),
          champChoix("marquage", "Marquage", ["Gravure", "Impression UV"]),
          champChoix("fixation", "Fixation", ["Entretoises", "Adhésif double face", "Perçage simple"]),
          CHAMP.quantite,
        ],
      },
      {
        name: "Signalétique intérieure",
        img: "img/products/product7.png",
        champs: [
          champListe("type", "Type", [
            "Plaques de porte",
            "Pictogrammes (toilettes…)",
            "Numéros de chambre",
            "Plan d'orientation",
            "Autre",
          ]),
          champNombre("pieces", "Nombre de pièces"),
          champChoix("matiere", "Matière", ["Plexiglas", "Aluminium", "Forex / PVC"]),
          CHAMP.pose,
        ],
      },
      { name: "Autre", champs: [CHAMP.precision, CHAMP.dimensions, CHAMP.pose] },
    ],
  },
  {
    id: "flocage",
    label: "Flocage",
    icon: "svg/services/shirt.svg",
    items: [
      {
        name: "Flocage véhicule",
        img: "img/products/product11.png",
        champs: [
          champChoix("vehicule", "Type de véhicule", ["Voiture", "Utilitaire", "Camion", "Moto"]),
          champTexte("modele", "Marque et modèle", "ex : Renault Kangoo"),
          champChoix("couverture", "Couverture", ["Lettrage simple", "Covering partiel", "Covering total"]),
          champNombre("nombre", "Nombre de véhicules"),
          CHAMP.visuel,
        ],
      },
      {
        name: "Flocage vitrine",
        img: "img/products/vitrine.jpg",
        champs: [
          champTexte("dimensions", "Dimensions de la vitrine", "ex : 250 x 200 cm"),
          champListe("type", "Type", ["Lettrage découpé", "Vitrophanie imprimée", "Micro-perforé", "Effet sablé / dépoli"]),
          champChoix("cote", "Pose sur la vitre", ["Côté intérieur", "Côté extérieur"]),
          CHAMP.pose,
          CHAMP.visuel,
        ],
      },
      {
        name: "Flocage textile (t-shirt…)",
        img: "img/products/textile.jpg",
        champs: [
          champListe("article", "Article", ["T-shirt", "Polo", "Sweat", "Casquette", "Gilet", "Tablier"]),
          champTexte("couleurTextile", "Couleur du textile", "ex : blanc, noir…"),
          CHAMP.quantite,
          champTexte("tailles", "Tailles", "ex : 10 M, 5 L, 5 XL"),
          champChoix("marquage", "Emplacement du marquage", ["Cœur", "Dos", "Cœur + dos", "Manche"]),
          champChoix("technique", "Technique", ["Flocage", "Sérigraphie", "Broderie", "Impression DTF", "Je ne sais pas"]),
          CHAMP.visuel,
        ],
      },
      { name: "Autre", champs: [CHAMP.precision, CHAMP.quantite] },
    ],
  },
];
