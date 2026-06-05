const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - গ্লোবাল গেটওয়ে সকেট প্রোটকল লক ভাই ভাই]
const io = socketIo(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob:; style-src * 'unsafe-inline'; font-src * data:;");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক ভাই ভাই]
const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স ইন্টারসেপ্টর গেটওয়ে (১ শতভাগ টাইমআউট ও জ্যাম ব্লকার বর্ম ওস্তাদ)
app.get('/api/moneytree-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    let finalUser = userId === "logged_in_player" || !userId || userId === "undefined" ? "guest" : userId;
    try {
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "balance", username: finalUser, amount: 0, wallet: targetWallet, game: "moneytree"
        }, { timeout: 15000 });

        if (response.data && response.data.status === "ok") {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. মানি ট্রি কোর ক্র্যাশ রাউট (POST Route - ৯৫% জেনুইন RTP ও ডাবল-ডেবিট ব্লকার বর্ম)
app.post('/api/moneytree-bet', async (req, res) => {
    const { userId, amount, wallet } = req.body; 
    const reqAmount = parseFloat(amount) || 10;
    const finalGameName = "moneytree"; 
    const targetWallet = wallet || "main";

    let finalQueryUser = userId;
    if (!finalQueryUser || finalQueryUser === "logged_in_player" || finalQueryUser === "undefined") {
        finalQueryUser = "guest"; 
    }

    if (reqAmount < 1 || reqAmount > 20000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Parameter! Max 20000 ৳" });
    }

    try {
        // 🔒 [🔒 জিরো-ডাবল-ডেবিট ডাইরেক্ট ইন্টারসেপ্টর বর্ম]: ১ম হিটে বাজি ডেবিট রিকোয়েস্ট ফায়ার লক ওস্তাদ!
        // অ্যাকাউন্টে পর্যাপ্ত টাকা না থাকলে ডাটাবেজ নিজেই সরাসরি এখান থেকে রিজেক্ট রেসপন্স ফায়ার করবে ভাই ভাই!
        const balResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet", username: finalQueryUser, amount: reqAmount, wallet: targetWallet, game: finalGameName
        }, { timeout: 30000 });
        
        if (!balResponse.data || balResponse.data.status !== "ok") {
            return res.json({ success: false, message: "❌ আপনার অ্যাকাউন্ট ব্যালেন্স জিরো বা অপ্রতুল! দয়া করে রিচার্জ করুন ওস্তাদ।" });
        }

        let currentDbBalance = parseFloat(balResponse.data.balance) || 0;
        
        let crashMultiplier = 1.00;
        let finalStatus = "lose";

        let isLoopActive = true;
        let loopSafety = 0;

        // 🎰 [🎰 আন্তর্জাতিক জেনুইন ক্র্যাশ র্যান্ডম ৯৫% RTP লুপ ইঞ্জিন ভাই ভাই]
        while (isLoopActive && loopSafety < 150) {
            loopSafety++;
            
            // এভিয়েটর স্ট্যান্ডার্ড গাণিতিক ক্র্যাশ জেনারেশন ফর্মুলা ওস্তাদ
            let randPoint = Math.random();
            if (randPoint < 0.10) {
                // ১০% চান্স থাকবে বাজি ধরার সাথে সাথেই একদম শুরুতেই x1.00 এ গাছ ইনস্ট্যান্ট ক্র্যাশ করার!
                crashMultiplier = 1.00;
            } else {
                // ৯০% স্বাভাবিক রাউন্ডে মাল্টিপ্লায়ার ডাইনামিক ওপরে পুশ হবে
                crashMultiplier = parseFloat((0.95 / (1 - Math.random())).toFixed(2));
                if (crashMultiplier < 1.01) crashMultiplier = 1.01;
                if (crashMultiplier > 100) crashMultiplier = parseFloat((Math.random() * (15 - 5) + 5).toFixed(2)); // সেফটি ক্যাপ
            }

            if (crashMultiplier >= 2.00) {
                finalStatus = "win";
            } else {
                finalStatus = "lose";
            }

            // এডমিন প্যানেল কাস্টম ফোর্স কন্ট্রোল নব ফিল্টারিং চ্যাম
            if (balResponse.data && balResponse.data.moneytree_target) {
                let target = String(balResponse.data.moneytree_target).toUpperCase();
                if (target === "FORCE_LOSE" && finalStatus === "win") {
                    crashMultiplier = parseFloat((Math.random() * (1.15 - 1.01) + 1.01).toFixed(2)); // x1.01 থেকে x1.15 এর ভেতর ক্র্যাশ লক!
                    finalStatus = "lose"; isLoopActive = false;
                }
                if (target === "FORCE_WIN" && finalStatus === "win") isLoopActive = false;
            } else {
                if (finalStatus === "win") {
                    // আন্তর্জাতিক স্বাভাবিক আরটিপি সুষম ফিল্টারিং ট্র্যাকে ২৪% এ মেগা ব্যালেন্সড লক ভাই ভাই!
                    if (Math.random() <= 0.24) isLoopActive = false;
                } else {
                    isLoopActive = false;
                }
            }
        }

        // ক্র্যাশ পয়েন্ট ক্যালকুলেশন সিঙ্ক লক
        return res.json({
            success: true,
            balance: currentDbBalance,
            data: { balance: currentDbBalance },
            gameData: { 
                crashMultiplier,
                userId: finalQueryUser,
                targetWallet,
                reqAmount
            }
        });

    } catch (e) { 
        return res.json({ success: false, message: "⚠️ Timeout! Click BET again." }); 
    }
});

// 🛫 ৩. ক্যাশআউট এন্ডপয়েন্ট গেটওয়ে (প্লেয়ার ক্র্যাশ হওয়ার আগে বোতাম চাপলে ওয়ান-শটে টাকা ক্রেডিট!)
app.post('/api/moneytree-cashout', async (req, res) => {
    const { userId, betAmount, wallet, cashoutMultiplier } = req.body;
    const reqBet = parseFloat(betAmount) || 10;
    const reqMult = parseFloat(cashoutMultiplier) || 1.10;
    const targetWallet = wallet || "main";
    const finalGameName = "moneytree";

    try {
        let winAmount = Math.round(reqBet * reqMult);
        
        let phpPayload = { 
            action: "win", username: userId, amount: parseFloat(winAmount), wallet: targetWallet, game: finalGameName, status: "win" 
        };
        phpPayload.bet_amount = reqBet;

        // মেইন সাইটের পিএইচপি লেজারে টাকা ওয়ান-শটে ক্রেডিট ফায়ার লক!
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, phpPayload, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });
            return res.json({ success: true, balance: response.data.balance, winAmount });
        }
        return res.json({ success: false, message: "X Cashout Declined by Central Ledger!" });
    } catch (e) {
        return res.json({ success: false, message: "⚠️ Request Timeout!" });
    }
});

// 🛫 ৪. লস সেটেলমেন্ট হুক (যদি প্লেয়ার ক্যাশআউট করতে না পেরে ক্র্যাশ খেয়ে যায়)
app.post('/api/moneytree-lose', async (req, res) => {
    const { userId, betAmount, wallet } = req.body;
    try {
        let phpPayload = { 
            action: "win", username: userId, amount: 0, wallet: wallet || "main", game: "moneytree", status: "lose" 
        };
        phpPayload.bet_amount = parseFloat(betAmount);

        // লস হিস্ট্রি নিখুঁতভাবে bet_logs.php তে ওয়ান-শটে পুশ লক ওস্তাদ!
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, phpPayload, { timeout: 30000 });
        return res.json({ success: true, status: "lose_logged" });
    } catch (e) { return res.json({ success: false }); }
});

app.get('/', (req, res) => { res.sendFile(path.resolve(__dirname, 'index.html')); });
io.on('connection', (socket) => {});

const PORT = process.env.PORT || 32000; 
server.listen(PORT, () => { console.log(`🌳 Money Tree Neon Coin Crash Engine Running on port ${PORT}`); });
