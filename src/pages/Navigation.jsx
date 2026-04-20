import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/">Accueil</Link>
      <Link to="/about">À propos</Link>
      <Link to="/games">Jeux</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}
export default Navigation;
