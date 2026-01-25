import React, { useState } from "react";
import {
  Menu,
  X,
  Users,
  Clock,
  Star,
  Mail,
  Instagram,
  Facebook,
  Leaf,
  Globe,
} from "lucide-react";

export default function NinjaSasquatchGames() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("tous");
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 1,
      title: "Origines Mystérieuses",
      category: "famille",
      image:
        "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=600&fit=crop",
      shortDesc:
        "Plongez dans les légendes du Sasquatch et découvrez ses secrets",
      players: "2-6",
      duration: "30-45 min",
      age: "8+",
      fullDesc:
        "Origines Mystérieuses vous transporte dans l'univers fascinant du Sasquatch. Explorez les forêts, décodez les indices et percez les mystères de cette créature légendaire. Un jeu captivant qui allie stratégie et découverte pour toute la famille.",
      eco: true,
    },
    {
      id: 2,
      title: "Mission Ninja",
      category: "stratégie",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
      shortDesc:
        "Infiltration, discrétion et tactiques pour devenir le meilleur ninja",
      players: "2-4",
      duration: "45-60 min",
      age: "10+",
      fullDesc:
        "Dans Mission Ninja, devenez un maître de la discrétion. Planifiez vos mouvements, déjouez vos adversaires et accomplissez vos objectifs secrets. Chaque décision compte dans ce jeu de stratégie où le mystère règne.",
      eco: true,
    },
    {
      id: 3,
      title: "Festin Forestier",
      category: "party",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
      shortDesc: "Des rires garantis autour d'un festin sauvage et déjanté",
      players: "4-8",
      duration: "20-30 min",
      age: "12+",
      fullDesc:
        "Festin Forestier transforme vos soirées en aventures hilarantes. Entre défis loufoques et situations absurdes, ce party game garantit des moments inoubliables et des fous rires incontrôlables.",
      eco: true,
    },
    {
      id: 4,
      title: "Gardiens de la Forêt",
      category: "famille",
      image:
        "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=600&fit=crop",
      shortDesc: "Coopérez pour protéger la nature et ses habitants",
      players: "2-5",
      duration: "40-50 min",
      age: "7+",
      fullDesc:
        "Gardiens de la Forêt célèbre nos valeurs environnementales. Travaillez ensemble pour préserver l'écosystème, sauver les animaux et restaurer l'équilibre naturel. Un jeu coopératif qui sensibilise tout en amusant.",
      eco: true,
    },
    {
      id: 5,
      title: "Légendes du Québec",
      category: "stratégie",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      shortDesc: "Explorez les mythes et créatures fantastiques du Québec",
      players: "3-6",
      duration: "50-70 min",
      age: "10+",
      fullDesc:
        "Légendes du Québec vous invite à découvrir le folklore québécois. Du Sasquatch aux créatures des légendes locales, parcourez le territoire et collectez les récits mythiques dans une aventure stratégique unique.",
      eco: true,
    },
    {
      id: 6,
      title: "Soirée Mystère",
      category: "party",
      image:
        "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&h=600&fit=crop",
      shortDesc: "Enquêtes et énigmes pour une soirée pleine de suspense",
      players: "4-10",
      duration: "60-90 min",
      age: "14+",
      fullDesc:
        "Soirée Mystère plonge vos invités dans des enquêtes palpitantes. Indices cachés, suspects intrigants et rebondissements garantis pour une expérience immersive qui marquera les esprits.",
      eco: true,
    },
  ];

  const categories = [
    { id: "tous", label: "Tous nos jeux" },
    { id: "famille", label: "Famille" },
    { id: "stratégie", label: "Stratégie" },
    { id: "party", label: "Party Game" },
  ];

  const filteredGames =
    selectedCategory === "tous"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  if (selectedGame) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#ffffe9" }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-6 hover:opacity-80 transition-opacity font-medium"
            style={{ color: "#142d17" }}
          >
            ← Retour aux jeux
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={selectedGame.image}
                alt={selectedGame.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              {selectedGame.eco && (
                <div
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ backgroundColor: "#077e16", color: "#ffffe9" }}
                >
                  <Leaf size={20} />
                  <span className="font-medium">
                    100% compostable et écoresponsable
                  </span>
                </div>
              )}
            </div>

            <div>
              <h1
                className="text-4xl font-bold mb-4"
                style={{
                  fontFamily: "'Luckiest Guy', cursive",
                  color: "#9b5824",
                }}
              >
                {selectedGame.title}
              </h1>

              <div className="flex gap-6 mb-6" style={{ color: "#142d17" }}>
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{selectedGame.players} joueurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{selectedGame.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={20} />
                  <span>{selectedGame.age}</span>
                </div>
              </div>

              <p
                className="text-lg mb-6 leading-relaxed"
                style={{ color: "#142d17" }}
              >
                {selectedGame.fullDesc}
              </p>

              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: "rgba(7, 126, 22, 0.1)",
                  borderLeft: "4px solid #077e16",
                }}
              >
                <h3 className="font-semibold mb-3" style={{ color: "#142d17" }}>
                  Caractéristiques
                </h3>
                <ul className="space-y-2" style={{ color: "#142d17" }}>
                  <li>
                    • Catégorie:{" "}
                    {selectedGame.category.charAt(0).toUpperCase() +
                      selectedGame.category.slice(1)}
                  </li>
                  <li>• Matériaux 100% compostables et écoresponsables</li>
                  <li>• Conçu et fabriqué au Québec</li>
                  <li>• Règles claires et accessibles à tous</li>
                  <li>• Engagement environnemental garanti</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffe9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
      `}</style>

      {/* Navigation */}
      <nav
        className="fixed w-full backdrop-blur-sm shadow-sm z-50"
        style={{ backgroundColor: "rgba(255, 255, 233, 0.95)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="text-2xl font-bold"
              style={{ fontFamily: "'Luckiest Guy', cursive" }}
            >
              <span style={{ color: "#9b5824" }}>Ninja </span>
              <span style={{ color: "#142d17" }}>Sasquatch</span>
            </div>

            <div className="hidden md:flex space-x-8 items-center">
              <button
                onClick={() => scrollToSection("accueil")}
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: "#142d17" }}
              >
                Accueil
              </button>
              <button
                onClick={() => scrollToSection("jeux")}
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: "#142d17" }}
              >
                Nos Jeux
              </button>
              <button
                onClick={() => scrollToSection("univers")}
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: "#142d17" }}
              >
                Notre Univers
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: "#142d17" }}
              >
                Contact
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-all"
                style={{ backgroundColor: "#077e16", color: "#ffffe9" }}
              >
                <Globe size={18} />
                FR / EN
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ color: "#142d17" }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="md:hidden border-t"
            style={{ backgroundColor: "#ffffe9", borderColor: "#9b5824" }}
          >
            <div className="px-4 py-3 space-y-3">
              <button
                onClick={() => scrollToSection("accueil")}
                className="block w-full text-left font-medium"
                style={{ color: "#142d17" }}
              >
                Accueil
              </button>
              <button
                onClick={() => scrollToSection("jeux")}
                className="block w-full text-left font-medium"
                style={{ color: "#142d17" }}
              >
                Nos Jeux
              </button>
              <button
                onClick={() => scrollToSection("univers")}
                className="block w-full text-left font-medium"
                style={{ color: "#142d17" }}
              >
                Notre Univers
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left font-medium"
                style={{ color: "#142d17" }}
              >
                Contact
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium w-full justify-center"
                style={{ backgroundColor: "#077e16", color: "#ffffe9" }}
              >
                <Globe size={18} />
                FR / EN
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="accueil"
        className="pt-16 min-h-screen flex items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(155, 88, 36, 0.1) 0%, rgba(7, 126, 22, 0.1) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1
              className="text-5xl md:text-7xl font-bold mb-6"
              style={{
                fontFamily: "'Luckiest Guy', cursive",
                color: "#9b5824",
              }}
            >
              Origines Mystérieuses
            </h1>
            <h2
              className="text-3xl md:text-4xl mb-8"
              style={{
                fontFamily: "'Luckiest Guy', cursive",
                color: "#142d17",
              }}
            >
              L'univers de Ninja Sasquatch Games
            </h2>
            <p
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
              style={{ color: "#142d17" }}
            >
              Une jeune compagnie québécoise qui sort des sentiers battus pour
              vous offrir des jeux de société originaux, amusants et accessibles
              à tous.
            </p>
            <p
              className="text-lg md:text-xl mb-12 max-w-3xl mx-auto"
              style={{ color: "#142d17" }}
            >
              Ici, on allie créativité, rires, une touche de mystère, et des
              valeurs fortes pour l'environnement. Nos jeux sont conçus pour
              transformer vos soirées en moments mémorables, que ce soit en
              famille ou entre amis.
            </p>
            <button
              onClick={() => scrollToSection("jeux")}
              className="text-white px-8 py-4 rounded-lg text-lg font-bold hover:opacity-90 transition-opacity shadow-lg"
              style={{
                backgroundColor: "#077e16",
                fontFamily: "'Luckiest Guy', cursive",
              }}
            >
              Découvrir nos jeux
            </button>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="jeux" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
            style={{ fontFamily: "'Luckiest Guy', cursive", color: "#9b5824" }}
          >
            Nos Créations
          </h2>
          <p
            className="text-center mb-12 max-w-2xl mx-auto text-lg"
            style={{ color: "#142d17" }}
          >
            Chaque jeu est pensé avec passion pour offrir une expérience unique,
            amusante et respectueuse de l'environnement.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "text-white shadow-lg"
                    : "hover:opacity-80"
                }`}
                style={
                  selectedCategory === cat.id
                    ? { backgroundColor: "#142d17" }
                    : {
                        backgroundColor: "rgba(155, 88, 36, 0.2)",
                        color: "#142d17",
                      }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="group cursor-pointer"
              >
                <div className="overflow-hidden rounded-lg shadow-md mb-4 transition-transform group-hover:scale-105 relative">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-64 object-cover"
                  />
                  {game.eco && (
                    <div
                      className="absolute top-2 right-2 p-2 rounded-full shadow-lg"
                      style={{ backgroundColor: "#077e16" }}
                    >
                      <Leaf size={20} color="#ffffe9" />
                    </div>
                  )}
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    fontFamily: "'Luckiest Guy', cursive",
                    color: "#9b5824",
                  }}
                >
                  {game.title}
                </h3>
                <p className="mb-3" style={{ color: "#142d17" }}>
                  {game.shortDesc}
                </p>
                <div
                  className="flex gap-4 text-sm"
                  style={{ color: "#142d17" }}
                >
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {game.players}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {game.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="univers"
        className="py-20"
        style={{ backgroundColor: "rgba(155, 88, 36, 0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{
                  fontFamily: "'Luckiest Guy', cursive",
                  color: "#9b5824",
                }}
              >
                Notre Mission
              </h2>
              <p
                className="mb-4 leading-relaxed text-lg"
                style={{ color: "#142d17" }}
              >
                Ninja Sasquatch Games est née de la passion de créer des moments
                inoubliables autour de la table. Nous croyons fermement que les
                jeux de société ont le pouvoir de rassembler les gens et de
                créer des souvenirs durables.
              </p>
              <p
                className="mb-4 leading-relaxed text-lg"
                style={{ color: "#142d17" }}
              >
                Notre engagement environnemental n'est pas qu'une promesse :
                tous nos jeux sont fabriqués avec des matériaux 100%
                compostables. Parce que s'amuser ne devrait jamais se faire au
                détriment de notre planète.
              </p>
              <p
                className="leading-relaxed text-lg"
                style={{ color: "#142d17" }}
              >
                Basés au Québec, nous puisons notre inspiration dans les
                légendes locales, la nature mystérieuse et l'esprit d'aventure
                qui caractérise notre belle province.
              </p>

              <div
                className="mt-8 p-6 rounded-lg"
                style={{ backgroundColor: "#077e16" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Leaf size={28} color="#ffffe9" />
                  <h3
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "'Luckiest Guy', cursive",
                      color: "#ffffe9",
                    }}
                  >
                    Engagement Écoresponsable
                  </h3>
                </div>
                <p className="leading-relaxed" style={{ color: "#ffffe9" }}>
                  Chaque jeu Ninja Sasquatch est conçu dans le respect de
                  l'environnement, avec des matériaux compostables et une
                  production responsable.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div
                className="p-6 rounded-lg shadow-md"
                style={{
                  backgroundColor: "#fff",
                  borderTop: "4px solid #9b5824",
                }}
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{
                    fontFamily: "'Luckiest Guy', cursive",
                    color: "#9b5824",
                  }}
                >
                  100%
                </div>
                <div style={{ color: "#142d17" }}>Compostable</div>
              </div>
              <div
                className="p-6 rounded-lg shadow-md"
                style={{
                  backgroundColor: "#fff",
                  borderTop: "4px solid #077e16",
                }}
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{
                    fontFamily: "'Luckiest Guy', cursive",
                    color: "#077e16",
                  }}
                >
                  Québec
                </div>
                <div style={{ color: "#142d17" }}>Fait au Québec</div>
              </div>
              <div
                className="p-6 rounded-lg shadow-md"
                style={{
                  backgroundColor: "#fff",
                  borderTop: "4px solid #9b5824",
                }}
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{
                    fontFamily: "'Luckiest Guy', cursive",
                    color: "#9b5824",
                  }}
                >
                  Tous
                </div>
                <div style={{ color: "#142d17" }}>Accessible à tous</div>
              </div>
              <div
                className="p-6 rounded-lg shadow-md"
                style={{
                  backgroundColor: "#fff",
                  borderTop: "4px solid #077e16",
                }}
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{
                    fontFamily: "'Luckiest Guy', cursive",
                    color: "#077e16",
                  }}
                >
                  Fun
                </div>
                <div style={{ color: "#142d17" }}>Rires garantis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
            style={{ fontFamily: "'Luckiest Guy', cursive", color: "#9b5824" }}
          >
            Contactez-nous
          </h2>
          <p className="text-center mb-12 text-lg" style={{ color: "#142d17" }}>
            Une question ? Un projet de collaboration ? Envie de découvrir nos
            jeux ? Écrivez-nous !
          </p>

          <div
            className="p-8 rounded-lg shadow-lg"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: "#142d17" }}
                >
                  Nom
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: "#9b5824", backgroundColor: "#ffffe9" }}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: "#142d17" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: "#9b5824", backgroundColor: "#ffffe9" }}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="mb-8">
              <label
                className="block mb-2 font-medium"
                style={{ color: "#142d17" }}
              >
                Message
              </label>
              <textarea
                rows="5"
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: "#9b5824", backgroundColor: "#ffffe9" }}
                placeholder="Votre message..."
              ></textarea>
            </div>

            <button
              className="w-full text-white px-8 py-4 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-lg"
              style={{
                backgroundColor: "#077e16",
                fontFamily: "'Luckiest Guy', cursive",
              }}
            >
              Envoyer le message
            </button>
          </div>

          <div className="flex justify-center gap-6 mt-12">
            <a
              href="#"
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#142d17" }}
            >
              <Instagram size={28} />
            </a>
            <a
              href="#"
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#142d17" }}
            >
              <Facebook size={28} />
            </a>
            <a
              href="#"
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#142d17" }}
            >
              <Mail size={28} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-white py-8"
        style={{ backgroundColor: "#142d17" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-lg mb-2"
            style={{ fontFamily: "'Luckiest Guy', cursive", color: "#ffffe9" }}
          >
            <span style={{ color: "#9b5824" }}>Ninja </span>
            <span style={{ color: "#ffffe9" }}>Sasquatch Games</span>
          </p>
          <p style={{ color: "#ffffe9", opacity: 0.8 }}>
            © 2026 Ninja Sasquatch Games. Tous droits réservés.
          </p>
          <p
            className="mt-2 flex items-center justify-center gap-2"
            style={{ color: "#077e16" }}
          >
            <Leaf size={16} />
            <span>Fièrement québécois et 100% compostable</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
