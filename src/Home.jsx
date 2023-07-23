import { React, useState } from "react";
import "./Home.scss";
function Home() {
  const [content, setContent] = useState("**IPFS TextEditor**");
  const [platools, setPlatools] = useState(["infura", "fleek", "pinata"]);
  const [curplat, setCurplat] = useState("infura");
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [msg, setMsg] = useState("");
  const [publishing, setPublishing] = useState(false);
  

  

  


  return (
    <div className="bg">
      <div className="warpper">
        <header className="header">IPFS TextEditor</header>
        <p className="notice">
          ⚠️ Notice ⚠️ - &nbsp;Please rest assured that we do not save or upload
          your project key or project secret, we only use them to obtain
          platform upload permissions.
        </p>
        <div className="checkboxs">
          {platools.map((platool) => (
            <label className="label" key={platool}>
              <input
                className="checkbox"
                checked={curplat === platool}
                onChange={() => {
                  setCurplat(platool);
                  setKey("");
                  setSecret("");
                }}
                type="checkbox"
              />
              {platool}
            </label>
          ))}
        </div>
        <div className="keyblock">
          <div className="project">
          </div>

          <div className="keybox">
            <div className="pid">
              <p className="name">PROJECT KEY</p>
              <input
                type="text"
                className="name"
                value={key}
                onChange={(e) => {
                  console.log(e);
                  setKey(e.target.value);
                }}
                size="30"
              ></input>
            </div>
            <div className="pid">
              <p className="name">PROJECT SECRET</p>
              <input
                type="password"
                className="name"
                value={secret}
                onChange={(e) => {
                  console.log(e);
                  setSecret(e.target.value);
                }}
                size="30"
              ></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
