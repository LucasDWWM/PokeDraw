import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full border-b border-neutral-200 bg-[#fbe9d2]">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-wide">
          PokeDraw
        </Link>

        <nav>
          <ul className="flex gap-4 text-sm">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `hover:underline ${isActive ? "font-semibold" : ""}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <a href="#" className="hover:underline">
                How to play
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
