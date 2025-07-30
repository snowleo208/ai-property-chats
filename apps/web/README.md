This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

Ohhhh now we’re cooking. 🔥

You're not just aiming for *"I built a testable chatbot UI"* — you’re aiming for:

> ✅ *A minimal, testable AI-powered tool that’s actually **useful**.*

That’s the sweet spot.

---

## 🎬 Idea: **“Today’s Movie Suggestion”** (AI-Powered)

A tiny app that:

1. Takes **mood / genre / time available**
2. Sends prompt to AI (`/api/movie`)
3. Streams back a **movie recommendation with explanation**
4. Bonus: Let user say “give me another one”

Mood: 😎 Chill / 😭 Sad / 🤯 Mind-blowing / 🤣 Funny

[ 😄 Happy ] [ 😢 Sad ] [ 🤔 Thoughtful ] [ ✍️ Custom... ]

Genre: Drama, Sci-fi, Animation, Romance

Length: < 90min, 1–2h, 2h+


Suggest one movie that fits the following preferences:
- Mood: {mood}
- Genre: {genre}
- Length: {length}

Include:
- Title (with release year)
- 1–2 sentence explanation of why it's a good fit
- Runtime in minutes (if known)

Do NOT include more than one movie. Only return one suggestion.


### Example Interaction:

```txt
User: I'm feeling nostalgic, want something under 2 hours.

AI:
🎬 *Stand By Me* (1986)  
A heartfelt coming-of-age story with friendship and adventure — and it clocks in at just 89 minutes.
```

---

### ✅ Why this is a great project:

| Quality                      | Why it’s awesome                                       |
| ---------------------------- | ------------------------------------------------------ |
| ✅ Useful                     | Genuinely fun and practical                            |
| ✅ Testable                   | Streams back AI suggestions you can test incrementally |
| ✅ Personalizable             | Moods, genres, length, etc.                            |
| ✅ No real data source needed | All from the LLM                                       |
| ✅ Small scope                | You can finish it in a weekend or two                  |

---

## 🧪 What you can test

* Shows loading state while streaming
* UI updates progressively
* Retry button works
* Errors handled
* Stream cancels mid-recommendation

---

## 💡 Optional Add-ons

* Save to favorites (store in localStorage)
* “Already watched” thumbs-down to reroll
* Light/dark mode toggle (just for style)
* Surprise me! button (no input needed)

---

## 📝 Blog Value

This becomes **more than a UI test article** — it’s:

* How to stream AI responses
* How to test streaming text
* How to build a *real* microproduct with LLMs

---

## 🧠 TL;DR

> You want a small, testable AI app that feels useful?
> ✅ A "Today’s Movie Suggestion" streaming chatbot is **perfect**.

It hits:

* LLM prompting
* Streaming response
* Real value
* Fully testable logic

Let me know if you want help designing the prompt or testing strategy — or if you’re ready to roll solo again like your map app 😎
