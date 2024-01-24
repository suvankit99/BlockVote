// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";

// CSS
import "./Voting.css";

export default class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      verifiedCandidatesCount:0,
      candidates: [],
      isElStarted: false,
      isElEnded: false,
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
        otp: "",
        ipfsHash:""
      },
      emailVerified: false,
      otpEntered: "",
    };
  }
  componentDidMount = async () => {
    // refreshing once
    if (!window.location.hash) {
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
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      // Get total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });
      console.log("start = " , this.state.isElStarted) ; 
      console.log("end = " , this.state.isElEnded) ; 
      // Loading Candidates details
      let verifiedCandidatesCount = 0 ;

      for (let i = 1; i <= this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i - 1)
          .call();
        
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          address: candidate.candidateAddress,
          isVerified: candidate.isVerified,
          ipfsHash: candidate.ipfsHash
        });
        if(candidate.isVerified) verifiedCandidatesCount++ ; 
      }
      this.setState({verifiedCandidatesCount : verifiedCandidatesCount})

      // Loading current voter
      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
          otp: voter.otp,
          ipfsHash:voter.ipfsHash
        },
      });

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
  checkOTP = () => {
    if (this.state.currentVoter.otp === this.state.otpEntered) {
      this.setState({ emailVerified: true });
      alert("OTP accepted ! Go ahead and cast your vote");
    } else {
      alert("Invalid OTP !!");
    }
  };
  renderCandidates = (candidate) => {
    const castVote = async (id) => {
      await this.state.ElectionInstance.methods
        .vote(id)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };
    const confirmVote = (id, header) => {
      var r = window.confirm(
        "Vote for " + header + " with Id " + id + ".\nAre you sure?"
      );
      if (r === true) {
        castVote(id);
      }
    };
    return candidate.isVerified ? (
      <div className="container-item">
        <div className="candidate-info">
          <table>
            <tr>
              <th>Name : </th><th><p>{candidate.header}</p></th>
            </tr>
            <tr>
              <th>Party : </th><th><p>{candidate.slogan}</p></th>
            </tr>
            <tr>
              <th>Account : </th><th><p>{candidate.address}</p></th>
            </tr>
          </table>
        </div>
        
        <div className="vote-btn-container">
        <img src={candidate.ipfsHash} alt="candidate-img" className="candidate-img"></img>
          <button
            onClick={() => {
              confirmVote(candidate.id, candidate.header) ; 
              console.log(this.state.currentVoter.ipfsHash) ; 
            }}
            className="button-9"
            disabled={
              !this.state.currentVoter.isRegistered ||
              this.state.currentVoter.hasVoted ||
              !this.state.emailVerified
            }
          >
            Vote
          </button>
        </div>
      </div>
    ) : null;
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

    if (!this.state.isElStarted && !this.state.isElEnded) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <NotInit />
        </>
      );
    }

    if (this.state.isElStarted && this.state.isElEnded) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <div className="container-item attention">
            <center>
              <h3>The Election ended.</h3>
              <br />
              <Link
                to="/Results"
                style={{ color: "black", textDecoration: "underline" }}
              >
                See results
              </Link>
            </center>
          </div>
        </>
      );
    }

    if (!this.state.isElStarted && this.state.isElEnded) {
      return <>
      {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
      {this.state.currentVoter.isRegistered ? (
        // this.state.currentVoter.isVerified ? (
        this.state.currentVoter.hasVoted ? (
          <div className="container-item success">
            <div>
              <strong>You've casted your vote.</strong>
              <p />
              <center>
                <Link
                  to="/Results"
                  style={{
                    color: "black",
                    textDecoration: "underline",
                  }}
                >
                  See Results
                </Link>
              </center>
            </div>
          </div>
        ) : (
          <div className="container-item info">
            <center>Go ahead and cast your vote.</center>
          </div>
        )
      ) : (
        <>
          <div className="container-item attention">
            <center>
              <p>You're not registered. Please register first.</p>
              <br />
              <Link
                to="/Registration"
                style={{ color: "black", textDecoration: "underline" }}
              >
                Registration Page
              </Link>
            </center>
          </div>
        </>
      )}
      <div className="container-main">
        {this.state.currentVoter.isRegistered && (
          <div className="container-main-special">
            <h2>OTP Verification </h2>
            <form>
              <label>Enter the OTP sent over email</label>
              <input
                className={"input-r"}
                type="password"
                style={{ width: "400px", marginTop: "20px" }}
                disabled={this.state.currentVoter.hasVoted}
                onChange={(e) => {
                  this.setState({ otpEntered: e.target.value });
                }}
                required
              ></input>
              <button
                type="submit"
                style={{
                  width: "100px",
                  padding: "10px",
                  marginTop: "22px",
                }}
                disabled={this.state.emailVerified || this.state.currentVoter.hasVoted}
                onClick={this.checkOTP}
              >
                Submit
              </button>
            </form>
          </div>
        )}

        <h2>Candidates</h2>
        <small>Total candidates: {this.state.verifiedCandidatesCount}</small>
        {this.state.candidates.length < 1 ? (
          <div className="container-item attention">
            <center>
              No one to vote for, insufficient number of candidates .
            </center>
          </div>
        ) : (
          <>
            {this.state.candidates.map(this.renderCandidates)}
            <div
              className="container-item"
              style={{ border: "1px solid black" }}
            >
              <center>That is all.</center>
            </div>
          </>
        )}
      </div>
    </>
    }
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <div className="container-item attention">
          <center>
            <h3>Voting Phase hasn't started yet </h3>
            <p>Please wait ...</p>
          </center>
        </div>
      </>
    );
  }
}
