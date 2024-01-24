import React, { Component } from "react";
import axios from "axios";
import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

import AdminOnly from "../../AdminOnly";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

import "./AddCandidate.css";
import NotInit from "../../NotInit";

export default class AddCandidate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      header: "",
      slogan: "",
      candidates: [],
      candidateCount: undefined,
      candidateRegistered: false,
      isElStarted: false,
      isElEnded: false,
      file: null,
      ipfsHash: "",
    };
  }

  componentDidMount = async () => {
    // refreshing page only once
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

      // Total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Loading Candidates details
      for (let i = 0; i < this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i)
          .call();
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          address: candidate.candidateAddress,
        });
      }

      this.setState({ candidates: this.state.candidates });

      let registered = false;
      for (let i = 0; i < this.state.candidateCount; i++) {
        if (this.state.candidates[i].address === this.state.account) {
          registered = true;
          break;
        }
      }
      if (registered) {
        this.setState({ candidateRegistered: true });
      }

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  };

  uploadFile = async (e) => {
    console.log("Inside upload func");
    e.preventDefault();
    const apiKey = "8f6f2b64d6d4b3d98259";
    const apiSecret =
      "0aee858f697e84407ebb28a4dd8bdcae0227abca8c817e7f1d07e996acf9d37b";
    // return ;
    console.log(this.state.file);
    if (this.state.file) {
      try {
        console.log("1234");
        const formData = new FormData();
        formData.append("file", this.state.file);
        console.log(formData);
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: apiKey,
            pinata_secret_api_key: apiSecret,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        // contract.add(account,ImgHash);
        console.log("Successfully Image Uploaded = ", ImgHash);
        this.setState({ ipfsHash: ImgHash });
      } catch (e) {
        console.log("Unable to upload image to Pinata");
      }
    }
  };
  addCandidate = async (e) => {
    e.preventDefault();
    await this.state.ElectionInstance.methods
      .addCandidate(this.state.header, this.state.slogan, this.state.ipfsHash)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
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

      if (
        this.state.isElStarted && !this.state.isElEnded
      ) {return (
        <>
          {" "}
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <div className="container-main">
            <h2>Candidate Registration</h2>
            <small>Total candidates applied : {this.state.candidateCount}</small>
            <div className="container-item">
              <form className="form" onSubmit={this.handleSubmit}>
                <label className={"label-ac"}>
                  Name
                  <input
                    className={"input-ac"}
                    type="text"
                    placeholder="eg. Modi ..."
                    // value={this.state.header}
                    onChange={(e) => {
                      this.setState({header : e.target.value})
                    }}
                    disabled={this.state.candidateRegistered}
                  />
                </label>
                <label className={"label-ac"}>
                  Party
                  <input
                    className={"input-ac"}
                    type="text"
                    placeholder="eg. BJP "
                    // value={this.state.slogan}
                    onChange={(e) => {
                      this.setState({slogan : e.target.value})
                    }}
                    disabled={this.state.candidateRegistered}
                  />
                </label>
                <label className={"label-ac"}>
                  Account Address
                  <input
                    className={"input-ac"}
                    type="text"
                    placeholder="eg. 0xdf..."
                    value={this.state.account}
                    disabled={this.state.candidateRegistered}
                  />
                </label>
                <label className={"label-ac"}>
                  Profile Picture
                  <input
                    className={"input-ac"}
                    type="file"
                    onChange={(e) => {
                      this.setState({ file: e.target.files[0] });
                    }}
                    disabled={this.state.candidateRegistered}
                  />
                </label>
                <button
                  className="btn-add"
                  disabled={
                    this.state.candidateRegistered
                  }
                  onClick={async (event) => {
                    await this.uploadFile(event);
                    await this.addCandidate(event);
                  }}
                >
                  Register
                </button>
              </form>
            </div>
            {this.state.candidateRegistered && (
              <p>
                You have successfully registered as a candidate , wait for
                verification from admin side{" "}
              </p>
            )}
          </div>
          {loadAdded(this.state.candidates)}
        </>
      );}

      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <div className="container-item attention">
            <center>
              <h3>Candidate Registration has been completed  </h3>
              {/* <p>Please wait ...</p> */}
            </center>
          </div>
        </>
      );

  }
}
export function loadAdded(candidates) {
  const renderAdded = (candidate) => {
    return (
      <>
        <div className="container-list success">
          <div
            style={{
              maxHeight: "21px",
              overflow: "auto",
            }}
          >
            {candidate.id}. <strong>{candidate.header}</strong>:{" "}
            {candidate.slogan} : <strong>{candidate.address}</strong>
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="container-main" style={{ borderTop: "1px solid" }}>
      <div className="container-item info">
        <center>Candidates List</center>
      </div>
      {candidates.length < 1 ? (
        <div className="container-item alert">
          <center>No candidates added.</center>
        </div>
      ) : (
        <div
          className="container-item"
          style={{
            display: "block",
            backgroundColor: "#DDFFFF",
          }}
        >
          {candidates.map(renderAdded)}
        </div>
      )}
    </div>
  );
}
