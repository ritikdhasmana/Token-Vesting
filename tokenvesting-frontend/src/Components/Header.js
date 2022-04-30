import React from "react";

function Header(props) {
  return (
    <div className="navbar">
      <div className="header-logo">
        <span className="block-logo">Token Vesting</span>
      </div>
      <div className="menu">
        {props.isLoggedIn ? (
          <div className="user-address">
            {props.account.slice(0, 2) + "..." + props.account.slice(38, 43)}
          </div>
        ) : (
          <div className="connect-button" onClick={props.login}>
            Connect
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
