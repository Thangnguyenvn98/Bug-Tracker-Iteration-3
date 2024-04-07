import { Link } from "react-router-dom";
import bugicon from "../assets/bug_insect_ladybird_animal_virus_error_add-512.webp";

const Header = () => {
  return (
    <div className="p-4">
      <div className="flex justify-center p-4">
        <div className="flex items-center gap-x-4">
          <Link to="/">
            <img src={bugicon} alt="bugLogo" className="w-20 h-20" />
          </Link>
          <h1>Bug Report System (BRS)</h1>
        </div>
      </div>
      <div className="bg-red-500 min-h-6"> </div>
    </div>
  );
};

export default Header;
