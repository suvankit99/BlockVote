import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default function NavbarAdmin() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="blockvote">
        <h1>BlockVote</h1>
      </div>
      <nav>
        <div className="header">
          <NavLink to="/">
            {/* <i className="fab fa-hive" /> */}
            Admin
          </NavLink>
        </div>
        <ul
          className="navbar-links"
          style={{ transform: open ? "translateX(0px)" : "" }}
        >
          {/* <li>
            <NavLink to="/AddCandidate" activeClassName="nav-active">
              Candidate Registration
            </NavLink>
          </li> */}
          <li>
            <NavLink to="/Verification" activeClassName="nav-active">
              Candidate Verification
            </NavLink>
          </li>

          {/* <li>
            <NavLink to="/Registration" activeClassName="nav-active">
              Voter Registration
            </NavLink>
          </li>
          <li>
            <NavLink to="/Voting" activeClassName="nav-active">
              Voting
            </NavLink>
          </li> */}
          <li>
            <NavLink to="/Results" activeClassName="nav-active">
              Results
            </NavLink>
          </li>
        </ul>
        <i
          onClick={() => setOpen(!open)}
          className="fas fa-bars burger-menu"
        ></i>
      </nav>
    </>
  );
}
