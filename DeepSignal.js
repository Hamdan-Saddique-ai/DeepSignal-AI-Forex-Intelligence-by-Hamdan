const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';

app.post('/api/signal', async (req, res) => {
    const { pair, timeframe, price, trend, rsi, ema, support, resistance } = req.body;

    const prompt = `You are a professional forex trader with strict risk management.

Analyze and provide a trading signal.

RULES:
- Only give signal if strong and clear
- No risky/uncertain trades
- Use trend, RSI, EMA, price action
- No guessing
- If no strong setup → HOLD
- Min risk-reward 1:2
- No BUY if RSI > 70
- No SELL if RSI < 30

Market Data:
Pair: ${pair}
Timeframe: ${timeframe}
Price: ${price}
Trend: ${trend}
RSI: ${rsi}
EMA Status: ${ema}
Support: ${support}
Resistance: ${resistance}

OUTPUT FORMAT (STRICT, no extra text):
Signal: BUY/SELL/HOLD
Confidence: High/Medium/Low
Entry: price
Stop Loss: price
Take Profit: price
Reason: max 10 words`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });

        const data = await response.json();
        const output = data.choices[0].message.content;
        res.json({ signal: output });
    } catch (error) {
        res.json({ signal: 'Signal: HOLD\nReason: API error' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));