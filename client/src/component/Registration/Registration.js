// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";
import { useRef } from "react";
import 'dotenv'
import emailjs from "@emailjs/browser";
import axios from "axios";
import { Link } from "react-router-dom";

// const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ODI1NjY2Zi1kYTlmLTQxZjMtYjUyNS01YjU2YTcxMDVjZTciLCJlbWFpbCI6InN1dmFua2l0MjAwMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOGY2ZjJiNjRkNmQ0YjNkOTgyNTkiLCJzY29wZWRLZXlTZWNyZXQiOiIwYWVlODU4ZjY5N2U4NDQwN2ViYjI4YTRkZDhiZGNhZTAyMjdhYmNhOGM4MTdlN2YxZDA3ZTk5NmFjZjlkMzdiIiwiaWF0IjoxNzAzNTk0MTAzfQ.IlRWZYIpZMst3DEKw5nHgSpmSniS_9gyfijGD92wwyw' ;

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voterEmail: "",
      voterOTP: "",
      voters: [],
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
      buffer: [],
      ipfsHash:'',
      file:null 
    };
    this.captureFile = this.captureFile.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  }

  // refreshing once
  componentDidMount = async () => {
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

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Total number of voters
      const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();
      this.setState({ voterCount: voterCount });

      // Loading all the voters
      for (let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods
          .voters(i)
          .call();
        const voter = await this.state.ElectionInstance.methods
          .voterDetails(voterAddress)
          .call();
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
      }
      this.setState({ voters: this.state.voters });

      // Loading current voters
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
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  };
  captureFile = async (e) => {
    e.preventDefault() ;
    const data = e.target.files[0]; //files array of files object
    console.log(data);
    const reader = new FileReader();
    reader.readAsArrayBuffer(data);

    reader.onloadend = () => {
      console.log(reader.result);
      this.setState({file : reader.result})
      console.log(this.state.file)
    };
  };
  uploadFile = async (e) => {
    e.preventDefault();
    const apiKey = '8f6f2b64d6d4b3d98259' ;
    const apiSecret = '0aee858f697e84407ebb28a4dd8bdcae0227abca8c817e7f1d07e996acf9d37b' ;
    // return ; 
    console.log(this.state.file);
    if (this.state.file) {
      try {
        const formData = new FormData();
        formData.append("file", this.state.file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': apiSecret ,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        // contract.add(account,ImgHash);
        console.log("Successfully Image Uploaded");
      } catch (e) {
        console.log("Unable to upload image to Pinata");
      }
    }
  };
  updateVoterName = (event) => {
    this.setState({ voterName: event.target.value });
  };
  updateVoterPhone = (event) => {
    this.setState({ voterPhone: event.target.value });
  };

  getOTP = () => {
    let s = this.state.account;
    let otp = "";
    for (let i = 3; i < s.length; i += 7) {
      otp = otp + s[i];
    }
    return otp;
  };

  sendEmail = (e) => {
    e.preventDefault();

    let params = {
      to_name: this.state.account,
      from_name: "BlockVote team",
      to_email: this.state.voterEmail,
      message: "Your otp is ",
      otp: this.getOTP(),
    };
    emailjs
      .send("service_buqxw6o", "template_ycxvpio", params, "VDS1LqakODWmnIw9v")
      .then(
        (result) => {
          console.log(result.text);
          alert("An OTP has been sent to your email , use it for voting !!");
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  registerAsVoter = async () => {
    await this.state.ElectionInstance.methods
      .registerAsVoter(
        this.state.voterName,
        this.state.voterPhone,
        this.state.voterEmail,
        this.getOTP()
      )
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
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        
        {!this.state.isElStarted && !this.state.isElEnded ? (
          <NotInit />
        ) :
        !this.state.isElStarted && this.state.isElEnded ? (
          <>
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
        ) : (
          <>
            <div className="container-item info">
              <p>Total registered voters: {this.state.voters.length}</p>
            </div>
            <div className="container-main">
              <h3>Registration</h3>
              <small>Register to vote.</small>
              <div className="container-item">
                <form
                  ref={this.formRef}
                  onSubmit={this.sendEmail}
                >
                  <div className="div-li">
                    <label className={"label-r"}>
                      Account Address
                      <input
                        className={"input-r"}
                        type="text"
                        value={this.state.account}
                        style={{ width: "400px" }}
                        disabled={this.state.currentVoter.isRegistered}
                        required
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Name
                      <input
                        className={"input-r"}
                        type="text"
                        placeholder="eg. Ava"
                        value={this.state.voterName}
                        onChange={this.updateVoterName}
                        disabled={this.state.currentVoter.isRegistered}
                        required
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Phone number <span style={{ color: "tomato" }}>*</span>
                      <input
                        className={"input-r"}
                        type="number"
                        placeholder="eg. 9841234567"
                        value={this.state.voterPhone}
                        onChange={this.updateVoterPhone}
                        disabled={this.state.currentVoter.isRegistered}
                        required
                      />
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Email <span style={{ color: "tomato" }}>*</span>
                      <input
                        className={"input-r"}
                        type="email"
                        placeholder="eg. xxx@gmail.com"
                        value={this.state.voterEmail}
                        onChange={(event) => {
                          this.setState({ voterEmail: event.target.value });
                        }}
                        disabled={this.state.currentVoter.isRegistered}
                        required
                      />
                    </label>
                  </div>


                  {/* <div className="div-li">
                    <label className={"label-r"}>
                      Profile picture
                      <input
                        className={"input-r"}
                        type="file"
                        value={this.state.voterName}
                        onChange={this.captureFile}
                        disabled={this.state.currentVoter.isRegistered}
                        required
                      />{" "}
                    </label>
                  </div> */}


                  {this.state.currentVoter.isRegistered ? null : (
                    <div className="div-li"></div>
                  )}

                  {this.state.currentVoter.isRegistered ? (
                    <p className="note">
                      You have successfully registered , please wait for voting
                      phase to begin
                    </p>
                  ) : (
                    <>
                      <p className="note">
                        <span style={{ color: "tomato" }}> Note: </span>
                        <br /> Make sure the details you fill in are correct{" "}
                        <br />
                      </p>
                      <button
                        className="btn-add"
                        type="submit"
                        disabled={
                          this.state.currentVoter.isVerified ||
                          this.state.currentVoter.isRegistered
                        }
                        onClick={(event) => {
                          this.registerAsVoter();
                          this.setState({ voterOTP: this.getOTP() });
                          this.updateHash();
                          // this.uploadFile(event);
                          // console.log(this.state.voterOTP);
                        }}
                      >
                        {this.state.currentVoter.isRegistered
                          ? "You have already registered"
                          : "Register"}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
            <div
              className="container-main"
              style={{
                borderTop: this.state.currentVoter.isRegistered
                  ? null
                  : "1px solid",
              }}
            >
              {loadCurrentVoter(
                this.state.currentVoter,
                this.state.currentVoter.isRegistered
              )}
            </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: "1px solid" }}
              >
                <small>Total Voters: {this.state.voters.length}</small>
                {loadAllVoters(this.state.voters)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Your Registered Info</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tr>
            <th>Account Address</th>
            <td>{voter.address}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{voter.name}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>{voter.phone}</td>
          </tr>
          <tr>
            <th>Voted</th>
            <td>{voter.hasVoted ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Verification</th>
            <td>{voter.isVerified ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{voter.isRegistered ? "True" : "False"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllVoters(voters) {
  const renderAllVoters = (voter) => {
    return (
      <>
        <div className="container-list success">
          <table>
            <tr>
              <th>Account address</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>List of voters</center>
      </div>
      {voters.map(renderAllVoters)}
    </>
  );
}
