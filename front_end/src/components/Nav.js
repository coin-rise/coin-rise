import React from "react";

function Nav() {
  return (
    <nav style={{ display: "flex" }}>
      <a href="/">
        <b>Coin rise</b>
      </a>
      <a href="/submit">
        <button>Submit a project</button>
      </a>
      <button>Connexion</button>
    </nav>
  );
}

export default Nav;
