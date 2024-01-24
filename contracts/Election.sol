// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract Election {
    address public admin;
    uint256 candidateCount;
    uint256 voterCount;
    bool start;
    bool end;

    constructor() public {
        // Initilizing default values
        admin = msg.sender;
        candidateCount = 0;
        voterCount = 0;
        start = false;
        end = false; 
    }
    // start candidate registration 
    function startCandidateRegistration() public onlyAdmin(){
        start = true ; 
        end = false ;
    }
    // function start voting phase 
    function startVoting() public onlyAdmin(){
        start = false ;
        end = true ; 
    }
    // End election
    function endElection() public onlyAdmin {
        end = true;
        start = true;
    }

    function getAdmin() public view returns (address) {
        // Returns account address used to deploy contract (i.e. admin)
        return admin;
    }

    modifier onlyAdmin() {
        // Modifier for only admin access
        require(msg.sender == admin);
        _;
    }
    // Modeling a candidate
    struct Candidate {
        address candidateAddress;
        uint256 candidateId;
        string header;
        string slogan;
        uint256 voteCount;
        bool isVerified ;
        string ipfsHash ; 
    }
    mapping(uint256 => Candidate) public candidateDetails;

    // Adding new candidates
    function addCandidate(string memory _header, string memory _slogan , string memory _ipfsHash)
        public
        // Only admin can add
        // onlyAdmin
    {
        Candidate memory newCandidate =
            Candidate({
                candidateAddress:msg.sender ,
                candidateId: candidateCount,
                header: _header,
                slogan: _slogan,
                voteCount: 0,
                isVerified : false ,
                ipfsHash : _ipfsHash 
            });
        candidateDetails[candidateCount] = newCandidate;
        candidateCount += 1;
    }

    // Verify candidate
    function verifyCandidate(bool _verifiedStatus, uint256 candidateId)
        public
        // Only admin can verify
        onlyAdmin
    {
        candidateDetails[candidateId].isVerified = _verifiedStatus ;
    }

    // Modeling a Election Details
    struct ElectionDetails {
        string adminName;
        string adminEmail;
        string adminTitle;
        string electionTitle;
        string organizationTitle;
    }
    ElectionDetails electionDetails;

    function setElectionDetails(
        string memory _adminName,
        string memory _adminEmail,
        string memory _adminTitle,
        string memory _electionTitle,
        string memory _organizationTitle
    )
        public
        // Only admin can add
        onlyAdmin
    {
        electionDetails = ElectionDetails(
            _adminName,
            _adminEmail,
            _adminTitle,
            _electionTitle,
            _organizationTitle
        );
        start = true ;
        end = false ;
    }

    // Get Elections details
    function getElectionDetails()
    public
    view
    returns(string memory adminName, 
    string memory adminEmail, 
    string memory adminTitle, 
    string memory electionTitle, 
    string memory organizationTitle){
        return(electionDetails.adminName, 
        electionDetails.adminEmail, 
        electionDetails.adminTitle, 
        electionDetails.electionTitle, 
        electionDetails.organizationTitle);
    }

    // Get candidates count
    function getTotalCandidate() public view returns (uint256) {
        // Returns total number of candidates
        return candidateCount;
    }

    // Get voters count
    function getTotalVoter() public view returns (uint256) {
        // Returns total number of voters
        return voterCount;
    }

    // Modeling a voter
    struct Voter {
        address voterAddress;
        string name;
        string phone;
        string email;
        bool isVerified;
        bool hasVoted;
        bool isRegistered;
        string otp ; 
        string ipfsHash;
    }

    address[] public voters; // Array of address to store address of voters
    mapping(address => Voter) public voterDetails; 

    // Request to be added as voter
    function registerAsVoter(string memory _name, string memory _phone , string memory _email , string memory _otp , string memory _ipfsHash) public {
        Voter memory newVoter =
            Voter({
                voterAddress: msg.sender,
                name: _name,
                phone: _phone,
                email:_email ,
                hasVoted: false,
                isVerified: false,
                isRegistered: true,
                otp: _otp , 
                ipfsHash:_ipfsHash
            });
        voterDetails[msg.sender] = newVoter;
        voters.push(msg.sender);
        voterCount += 1;
    }

    // Voting
    function vote(uint256 candidateId) public {
        require(voterDetails[msg.sender].hasVoted == false);
        // require(voterDetails[msg.sender].isVerified == true);
        require(start == false);
        require(end == true);
        candidateDetails[candidateId].voteCount += 1;
        voterDetails[msg.sender].hasVoted = true;
    }


    // Get election start and end values
    function getStart() public view returns (bool) {
        return start;
    }

    function getEnd() public view returns (bool) {
        return end;
    }
}
