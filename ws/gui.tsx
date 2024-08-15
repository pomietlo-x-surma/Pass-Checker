import React, { useState, useEffect } from "react";
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";
import "./App.css";

const client = new W3CWebSocket("ws://localhost:8080");

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/new-page/:message" element={<NewPage />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </Router>
  );
};

const CreateAccount: React.FC = () => {
  const [message1, setMessage1] = useState<string>(""); // login
  const [message2, setMessage2] = useState<string>(""); // mail
  const [message3, setMessage3] = useState<string>(""); // haslo
  const [message4, setMessage4] = useState<string>(""); // powtorz haslo
  const [response, setResponse] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    client.onopen = () => {
      console.log("połączono");
      setIsConnected(true);
    };
    client.onclose = () => {
      console.log("Brak połączenia");
      setIsConnected(false);
    };

    client.onmessage = (message: IMessageEvent) => {
      if (typeof message.data === "string") {
        if (message.data === "0") {
          navigate(`/new-page/${message.data}`);
        } else {
          console.log("Received Data:", message.data);
          setResponse(message.data);
        }
      }
    };
  }, [navigate]);

  const handleSend = () => {
    if (isConnected) {
      const combinedMessage = `1,${message1} ${message2} ${message3} ${message4}`;
      client.send(combinedMessage);
      setResponse(`Wysłano: ${combinedMessage}`);
    }
  };

  return (
    <div className="container" style={{height: "15vw", fontSize: "2vw"}}>
      <p style={{fontSize: "5vw", position: "relative", top: "2vw"}}>Rejestracja</p>
        <p style={{margin: "0vw", position: "relative", top: "-3vw"}}>E-mail</p>
        <br />
        <input
          value={message1}
          onChange={(e) => setMessage1(e.target.value)}
          placeholder="Wpisz E-mail"
        />
        <br />
        <p style={{margin: "0vw", position: "relative", top: "-3vw"}}>Login</p>
        <br />
        <input
          value={message2}
          onChange={(e) => setMessage2(e.target.value)}
          placeholder="Wpisz Login"
        />
        <br />
        <p style={{margin: "0vw", position: "relative", top: "-3vw"}}>Hasło</p>
        <br />
        <input
          value={message3}
          onChange={(e) => setMessage3(e.target.value)}
          placeholder="Wpisz Hasło"
        />
        <br />
        <p style={{margin: "0vw", position: "relative", top: "-3vw"}}>Powtórz hasło</p>
        <br />
        <input
          value={message4}
          onChange={(e) => setMessage4(e.target.value)}
          placeholder="Wpisz Hasło ponownie"
        />
        <br />
        <button onClick={handleSend} style={{position:"relative", top: "-3.5vw", padding: "0.8vw"}}>Zaloguj</button>
        <p>{response}</p>
    </div>
  );
};

const Login: React.FC = () => {
  const [message1, setMessage1] = useState<string>("");
  const [message2, setMessage2] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    client.onopen = () => {
      console.log("Połączono");
      setIsConnected(true);
    };

    client.onclose = () => {
      console.log("Brak połączenia");
      setIsConnected(false);
    };

    client.onmessage = (message: IMessageEvent) => {
      if (typeof message.data === "string") {
        console.log("Received Data:", message.data);
        setResponse(message.data);
        if (message.data === "5") {
          console.log("Received non-string message:", message.data);
          setResponse("Zły login lub hasło!");
        } else {
          navigate(`/new-page/${message.data}`);
        }
      }
    };
  }, [navigate]);

  const handleSend = () => {
    if (isConnected) {
      const combinedMessage = `0,${message1} ${message2}`;
      client.send(combinedMessage);
      setResponse(`Wysłano: ${combinedMessage}`);
    }
  };

  return (
    <div>
      <p style={{fontSize: "4vw", position: "relative", top: "-5vw", left: "-2vw"}}>E-mail:</p>
        <input
            type="text"
            value={message1}
            onChange={(e) => setMessage1(e.target.value)}
            placeholder="Wpisz E-mail"
            style={{padding:"1vw", fontSize: "3vw", width: "30vw", height: "4vw", top: "-8vw", position: "relative", margin:"0vw", left: "6vw"}}
          />
        <p style={{fontSize: "4vw", position: "relative", top: "-8vw", left: "-2vw"}}>Hasło:</p>
          <input
            type="password"
            value={message2}
            onChange={(e) => setMessage2(e.target.value)}
            placeholder="Hasło"
            style={{padding:"1vw", fontSize: "3vw", width: "30vw", height: "4vw", top: "-12vw", position: "relative", left: "8vw"}}
          />
        <button onClick={handleSend} style={{fontSize: "3vw", paddingBottom: "5vw", paddingTop:"1vw", height: "7vw",width: "20vw", 
          margin: "0vw", top: "-3vw",position: "relative",left: "-16vw",   flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          Zaloguj</button>
        <p style={{fontSize: "2vw"}}>{response}</p>
      <p style={{fontSize: "2vw", margin: "-5vw", position: "relative", left: "-2vw", top:"-0vw"}}>
        <Link to="/create-account" className="create-account-link">
          Utwórz nowe konto
        </Link>
      </p>
    </div>
  );
};
const NewPage: React.FC = () => {
  const [selectedCurrency1, setSelectedCurrency1] = useState("EUR");
  const [selectedCurrency2, setSelectedCurrency2] = useState("PLN");
  const [message1, setMessage1] = useState<string>("");
  const [message2, setMessage2] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");
  const [text, setText] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    client.onopen = () => {
      console.log("Połączono");
      setIsConnected(true);
    };

    client.onclose = () => {
      console.log("Brak połączenia");
      setIsConnected(false);
    };

    client.onmessage = (message: IMessageEvent) => {
      if (typeof message.data === "string") {
        const [money, code] = message.data.split(" ");
        const base64str = `data:image/png;base64,${code}`;
        const img = document.createElement('img');
        img.src = base64str;
        setResponse(money);
        if (selectedCurrency1!=selectedCurrency2){
          setMessage1(base64str);
        }
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (isConnected) {
      const combinedMessage = `3,${selectedCurrency2} ${selectedCurrency1}`;
      client.send(combinedMessage);
      console.log(`Waluta ${combinedMessage}`);
    }
  }, [selectedCurrency1, selectedCurrency2, isConnected]);

  const handleSelect1 = (currency: any) => {
    setSelectedCurrency1(currency);
  };

  const handleSelect2 = (currency: any) => {
    setSelectedCurrency2(currency);
  };

  return (
    <>
      <h3 style={{ top: '0vw', margin: '0vw', position: 'relative' }}>
        <p
          style={{
            color: "white",
            left: "1vw",
            position: "relative",
            margin: "0px",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: "5vw", fontWeight: "bold", top: "0vw", position: 'relative' }}>
            Witaj username!
          </span>
          <br />
          <br />
          <span style={{ fontSize: "3vw", position: "relative", top: '-4vw' }}>Kurs wybranej waluty:</span>
        </p>
        <br />
        <p className="plot">Wykres waluty:
        <img
        src={message1}
        alt="Image"
        style={{
          position: 'absolute',
          left: '0vw',
          zIndex: 1, 
          width: '40vw',
          margin: '0vw',
          height: '17vw',
          top: '3vw',
        }}></img>
        </p>
        <p className="saldo">Twoje saldo:</p>
        <div
          className="currencychange"
          style={{ left: "15vw", position: "relative" }}
        >
          <p className="dropdown-button">
            {selectedCurrency1}
          </p>
          <div className="dropdown-content">
            <a onClick={() => handleSelect1("USD")}>USD</a>
            <a onClick={() => handleSelect1("PLN")}>PLN</a>
            <a onClick={() => handleSelect1("EUR")}>EUR</a>
          </div>
        </div>
        <div className="currencychange">
          <p className="dropdown-button">
            {selectedCurrency2}
          </p>
          <div className="dropdown-content">
            <a onClick={() => handleSelect2("USD")}>USD</a>
            <a onClick={() => handleSelect2("PLN")}>PLN</a>
            <a onClick={() => handleSelect2("EUR")}>EUR</a>
          </div>
        </div>
        <p style={{ fontSize: '9vw', left: '9vw', top: '9vw', position: 'absolute', margin: '0.5vw' }}>→</p>
        <p style={{ fontSize: '6vw', left: '25.5vw', top: '11.5vw', position: 'absolute', margin: '0.5vw' }}>=</p>
        <p style={{
          fontSize: '2.5vw',
          left: '31vw',
          top: '13vw',
          position: 'absolute',
          margin: '0.5vw',
          backgroundColor: 'red',
          border: 'solid white 0.5vw',
          borderRadius: '1vw',
          padding: '1vw',
          minHeight: "4vw",
          minWidth: "10vw"
        }}>
          {response}
        </p>
      </h3>
    </>

  );
  
};

export default App;
