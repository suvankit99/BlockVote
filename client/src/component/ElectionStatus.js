import React from "react";

const ElectionStatus = (props) => {
  const electionStatus = {
    padding: "11px",
    margin: "7px",
    width: "100%",
    border: "1px solid #00ADB5",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    borderRadius: "0.5em",
    overflow: "auto",
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: "1px solid", marginTop: "0px" }}
    >
      <h3>Election Status</h3>
      <div style={electionStatus}>

        {(!props.elStarted && !props.elEnded) && <p>Election not yet initialized</p>}
        {(props.elStarted && !props.elEnded) && <p>Candidate Registration phase started </p>}
        {(!props.elStarted && props.elEnded) && <p>Voting Phase started </p>}
        {(props.elStarted && props.elEnded) && <p>Election ended </p>}
      </div>
      <div className="container-item" />
    </div>
  );
};

export default ElectionStatus;
