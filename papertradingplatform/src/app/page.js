"use client"
import { useEffect, useState } from "react";

export default function Home() {

    const [price,setPrice] = useState(null);
    const [quantity,setQuantity] = useState("");
    const [balance,setBalance] = useState(2000);
    const [holdings,setHoldings] = useState([]);
    const [trades,setTrades] = useState([]);
    const [user,setUser] = useState(null);

    async function fetchUser() {
        const token = localStorage.getItem("token");

        const res = await fetch("https://personalpapertradingplatform.onrender.com/api/user/me",{
            headers:{
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok){
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }
        const data = await res.json();
        setUser(data.username);
        setBalance(data.balance);
        setHoldings(data.holdings);
        setTrades(data.trades);
    }
    
    useEffect(()=>{
        const script = document.createElement("script")
        script.src = "https://s3.tradingview.com/tv.js"
        script.async = true
        script.onload = () => {
            new window.TradingView.widget({
                container_id: "tv_chart",
                symbol: "NASDAQ:AAPL",
                interval: "D",
                autosize: true,
                theme: "dark"
            })
        }
        document.body.appendChild(script)
    },[]);

    useEffect(()=>{
        async function fetchprice() {
            const res = await fetch(
                "https://finnhub.io/api/v1/quote?symbol=AAPL&token=d6phg11r01qo88aj7pagd6phg11r01qo88aj7pb0"
            )
            const data = await res.json();
            setPrice(Number(data.c));
        }
        fetchprice();
        const interval = setInterval(fetchprice, 2000);
        return () => clearInterval(interval);
    },[]);

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if (!token){
            window.location.href = "/login";
            return;
        }
        fetchUser();
    },[]);

    function changequant(e){
        setQuantity(e.target.value);
    }

    function logout(){
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
    
    async function buyquant() {
        const token = localStorage.getItem("token");
        const qty = Number(quantity);
        if (!qty||qty<=0||!price){return;}
        
        const res = await fetch("https://personalpapertradingplatform.onrender.com/api/user/buy",{
            method: "POST",
            headers:{
                "Content-Type":"application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({qty,price: Number(price)})
        });

        const data = await res.json();
        if (!res.ok){
            alert(data.msg);
            return;
        }
        fetchUser();
        setQuantity("");
    }
    
    async function sellholding(idx) {
        const token = localStorage.getItem("token");

        const res = await fetch("https://personalpapertradingplatform.onrender.com/api/user/sell",{
            method: "POST",
            headers:{
                "Content-Type":"application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({index: idx, price: Number(price)})
        });

        const data = await res.json();
        if (!res.ok){
            alert(data.msg);
            return;
        }
        fetchUser();
    }
    
    async function resetaccount() {
        const token = localStorage.getItem("token");
        const confirmreset = window.confirm("Are you sure you want to reset your account?");
        if (!confirmreset){return;}

        const res = await fetch("https://personalpapertradingplatform.onrender.com/api/user/reset",{
            method: "POST",
            headers:{
                "Content-Type":"application/json",
                Authorization: `Bearer ${token}`
            },
        });

        const data = await res.json();
        if (!res.ok){
            alert(data.msg);
            return;
        }
        fetchUser();
    }

    return (
        <div id="maincontainer">
            <div id="navibar" className="glass">
                <div>Paper Trading Platform</div>
                <div>Portfolio Dashboard</div>
                <div onClick={logout} id="logoutbutton" className="glass" style={{cursor: "pointer"}}>Sign Out</div>
            </div>
            <div id="leftbar" className="glass">
                <div id="usernfo">
                    <img id = "pfp" src={`https://api.dicebear.com/7.x/initials/svg?seed=${user || "User"}`}  alt="pfp" className="glass"/>
                    <div>
                        <div>{user ?? "User"}</div>
                        {/* <div>Rank</div> */}
                    </div>
                </div>
                <div id="accnfo">
                    <div>Balance: ${balance.toFixed(2)}</div>
                    <div>P/L: {(((balance-2000)/2000)*100).toFixed(2)}%</div>
                </div>
                {/* <div id="leaderboard">
                    Leaderboard
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Eq</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>1</td><td>U1</td><td>$233</td></tr>
                            <tr><td>2</td><td>U2</td><td>$232</td></tr>
                            <tr><td>3</td><td>U3</td><td>$231</td></tr>
                            <tr><td>4</td><td>U4</td><td>$230</td></tr>
                            <tr><td>5</td><td>U5</td><td>$229</td></tr>
                        </tbody>
                    </table>
                </div> */}
                <div>
                    <button id="resetaccountbutton" className="glass" style={{cursor: "pointer"}} onClick={resetaccount}>Reset Account</button>
                </div>
                <div className="glass guide">
                    <div className="titleofguide"> User Guide </div>
                    <div> - Trade During Market Hours </div>
                    <div> - Enter Quantity And Execute Buy </div>
                    <div> - Sell Positions From Holdings </div>
                    <div> - Monitor Balance & P/L </div>
                    <div> - Reset Account Anytime </div>
                </div>
                <div className="glass guide">
                    <div className="titleofguide"> Notes </div>
                    <div> - Hosted On Free Tier Infrastructure </div>
                    <div> - Response Times May Vary </div>
                    <div> - Delays Possible During High Traffic</div>
                </div>
            </div>
            <div id="tradbar" className="glass">
                <div id="chartcontainer">
                    <div>AAPL(NASDAQ) -- ${price ??  "Loading..."}</div>
                    <div id="tv_chart" className="glass" style={{height: "500px"}}></div>
                </div>
                <div id="buyingarea" className="glass">
                    <textarea name="" id="buyingquantity" placeholder="Enter Quantity" maxLength={5} inputMode="numeric" onChange={changequant} value={quantity}></textarea>
                    <button id="buyingbutton" className="glass" onClick={buyquant} style={{cursor: "pointer"}}>Buy</button>
                </div>
                <div id="holdingandlogarea">
                    <div id="holdngarea">
                        <div className="titlesize">Holdings</div>
                        <table className="tablegen">
                            <thead>
                                <tr>
                                    <th>Quantity</th>
                                    <th>Entry Price</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.length === 0 && (
                                    <tr>
                                        <td colSpan={3}>No Holdings</td>
                                    </tr>
                                )}
                                {holdings.map((h,idx)=>(
                                    <tr key={idx}>
                                        <td>{h.qty}</td>
                                        <td>{h.buyPrice.toFixed(2)}</td>
                                        <td><button id="sellingbutton" className="glass" onClick={()=>sellholding(idx)} style={{cursor: "pointer"}}>Sell</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div id="historyarea">
                        <div className="titlesize">Transaction History</div>
                        <table className="tablegen">
                            <thead>
                                <tr>
                                    <th>Qty</th>
                                    <th>Entry</th>
                                    <th>Exit</th>
                                    <th>Date</th>
                                    <th>P/L (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>No Trades</td>
                                    </tr>
                                )}
                                {[...trades].reverse().map((t,i)=>(
                                    <tr key={i}>
                                        <td>{t.qty}</td>
                                        <td>{t.entry.toFixed(2)}</td>
                                        <td>{t.exit.toFixed(2)}</td>
                                        <td>{t.date}</td>
                                        <td>{t.pndl.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}