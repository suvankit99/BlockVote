import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import AdminOnly from "../../AdminOnly";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

import "./Verification.css";
import NotInit from "../../NotInit";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
    };
  }

  // refreshing once
  componentDidMount = async () => {
    if (!window.location.hash) {
      console.log(window.location.hash);
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });

      // Total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();

      this.setState({ candidateCount: candidateCount });
      // Total candidates

      for (let i = 0; i < this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i)
          .call();
        this.state.candidates.push({
          candidateAddress: candidate.candidateAddress,
          candidateId: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          voteCount: candidate.voteCount,
          isVerified: candidate.isVerified,
        });
      }

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  verifyCandidate = async (verifiedStatus, candidateId) => {
    await this.state.ElectionInstance.methods
      .verifyCandidate(verifiedStatus, candidateId)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  renderUnverifiedCandidates = (candidate) => {
    return (
      <>
        {candidate.isVerified ? (
          <div key={candidate.candidateId} className="container-list success">
            <p style={{ margin: "7px 0px" }}>
              AC: {candidate.candidateAddress}
            </p>
            <table>
              <tr>
                <th>Name</th>
                <th>Party</th>
                <th>Verified</th>
              </tr>
              <tr>
                <td>{candidate.header}</td>
                <td>{candidate.slogan}</td>
                <td>{candidate.isVerified ? "True" : "False"}</td>
              </tr>
            </table>
          </div>
        ) : (
          <div
            key={candidate.candidateId}
            className="container-list attention"
            style={{ display: candidate.isVerified ? "none" : null }}
          >
            <table>
              <tr>
                <th>Account address</th>
                <td>{candidate.candidateAddress}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{candidate.header}</td>
              </tr>
              <tr>
                <th>Verified</th>
                <td>{candidate.isVerified ? "True" : "False"}</td>
              </tr>
            </table>
            <div style={{}}>
              <button
                className="btn-verification approve"
                disabled={candidate.isVerified}
                onClick={() =>
                  this.verifyCandidate(true, candidate.candidateId)
                }
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </>
    );
  };
  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }

    if (!this.state.isAdmin) {
      return (
        <>
          <Navbar />
          <AdminOnly page="Verification Page." />
        </>
      );
    }

    
    return (
      <>
        <NavbarAdmin />
        <div className="container-main">
          <h3>Verification</h3>
          <small>
            Total candidates applied : {this.state.candidates.length}
          </small>
          {this.state.candidates.length < 1 ? (
            <div className="container-item info">None has registered yet.</div>
          ) : (
            <>
              <div className="container-item info">
                <center>List of registered candidates</center>
              </div>
              {this.state.candidates.map(this.renderUnverifiedCandidates)}
              {console.log("Inside = ", this.state.candidates.length)}
            </>
          )}
        </div>
      </>
    );
  }
}
