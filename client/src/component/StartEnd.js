import React from "react";
import { Link } from "react-router-dom";

const getText = (props) => {
  let start = props.elStarted ; 
  let end = props.elEnded ; 
  let message = "" ;
  if(start && !end){
    message = "Candidate Registration Phase has started ."
  }
  else if(!start && end){
    message = "Voting Phase has started . Go register and vote ."
  }
  return message ; 
}

const getButtonMessage = (props) => {
  let start = props.elStarted ; 
  let end = props.elEnded ; 
  let message = "End election" ;
  if(start && !end){
    message = "Start Voting" ;
  }
  if(!start && end){
    message = "End election" ; 
  }
  return message ; 
}

const controlElection = (props) => {
  let start = props.elStarted ; 
  let end = props.elEnded ; 
  if(start && !end){
    props.startVoting() ; 
  }
  else if(!start && end){
    props.endElFn() ; 
  }
}
const StartEnd = (props) => {
  const btn = {
    display: "block",
    padding: "21px",
    margin: "7px",
    minWidth: "max-content",
    textAlign: "center",
    width: "100px",
    alignSelf: "center",
    color: "#fff",
    fontWeight:200
  };
  if(!props.elStarted && !props.elEnded){
    return <div
    className="container-main"
    style={{ borderTop: "1px solid", marginTop: "0px" }}
  ><>
  <div className="container-item">
    <button type="submit" style={btn}>
      <strong style={{color:"white"}}> Start Election </strong>{props.elEnded ? "Again" : null}
    </button>
  </div>
</>
</div>
  }

  if(props.elStarted && props.elEnded){
    return (<div className="container-main"
    style={{ borderTop: "1px solid", marginTop: "0px" }}><div className="container-item">
         <center>
           <p>Re-deploy the contract to start election again.</p>
         </center>
       </div></div>)
  }

  return <div  className="container-main"
  style={{ borderTop: "1px solid", marginTop: "0px" }}>
     <div className="container-item">
     <center>
               <h4>The election started.</h4>
               <br></br>
               <p>{getText(props)}</p>
             </center>
           </div>
           <div className="container-item">
          <button
              type="button"
              onClick={() => {
                controlElection(props) ;
              }}
              style={btn}
            >
              {getButtonMessage(props)}
            </button>
          </div>
  </div>
  // return (
  //   <div
  //     className="container-main"
  //     style={{ borderTop: "1px solid", marginTop: "0px" }}
  //   >
  //     {!props.elStarted ? (
  //       <>
  //         {/* edit here to display start election Again button */}
  //         {!props.elStarted && !props.elEnded? (
  //           <>
  //             <div className="container-item">
  //               <button type="submit" style={btn}>
  //                 <strong style={{color:"white"}}> Start Election </strong>{props.elEnded ? "Again" : null}
  //               </button>
  //             </div>
  //           </>
  //         ) : (
  //           <>
  //         <div className="container-item">
  //           <center>
  //             <h4>The election started.</h4>
  //             <br></br>
  //             <p>{getText(props)}</p>
  //           </center>
  //         </div>
  //         <div className="container-item">
  //           <button
  //             type="button"
  //             onClick={() => {
  //               controlElection(props) ;
  //             }}
  //             style={btn}
  //           >
  //             {getButtonMessage(props)}
  //           </button>
  //         </div>
  //       </>)}
            
  //         //   <div className="container-item">
  //         //     <center>
  //         //       <p>Re-deploy the contract to start election again.</p>
  //         //     </center>
  //         //   </div>
  //         // )}
  //         // {props.elEnded && props.elStarted ? (
  //         //   <div className="container-item">
  //         //     <center>
  //         //       <p>The election ended.</p>
  //         //     </center>
  //         //   </div>
  //         // ) : null}
  //       </>
  //     ) : (
  //       <>
  //        <div className="container-item">
  //             <center>
  //               <p>Re-deploy the contract to start election again.</p>
  //             </center>
  //           </div>
          
  //         {props.elEnded && props.elStarted ? (
  //           <div className="container-item">
  //             <center>
  //               <p>The election ended.</p>
  //             </center>
  //           </div>
  //         ) : null}

  //       </>
        // <>
        //   <div className="container-item">
        //     <center>
        //       <h4>The election started.</h4>
        //       <br></br>
        //       <p>{getText(props)}</p>
        //     </center>
        //   </div>
        //   <div className="container-item">
        //     <button
        //       type="button"
        //       onClick={() => {
        //         controlElection(props) ;
        //       }}
        //       style={btn}
        //     >
        //       {getButtonMessage(props)}
        //     </button>
        //   </div>
        // </>
    //   )}
    // </div>
  // );
};

export default StartEnd;
