// --- Cleaner function for exact 5 ad lines ---
function cleanText(text) {
  if (!text) return text;

  return text
    .replace(/Need proxies cheaper than the market\?\s*/gi, "")
    .replace(/https:\/\/op\.wtf\s*/gi, "")
    .replace(/Upgrade your plan to remove this message at\s*/gi, "")
    .replace(/https:\/\/api\.airforce\s*/gi, "")
    .replace(/discord\.gg\/airforce\s*/gi, "")
    .replace(/\n{2,}/g, "\n\n") // remove extra blank lines
    .trim();
}

// --- Main OpenAI-compatible proxy route ---
app.post("/v1/chat/completions", async (req, res) => {
  try {
    // Forward request to Airforce API
    const response = await axios.post(TARGET_API, req.body, {
      headers: {
        Authorization: `Bearer ${AIRFORCE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    // Clean each message in choices
    if (data.choices) {
      data.choices.forEach((choice) => {
        if (choice.message && choice.message.content) {
          choice.message.content = cleanText(choice.message.content);
        }
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      error: "Proxy failed",
      details: err?.response?.data || err.message,
    });
  }
});

// --- Health check ---
app.get("/", (req, res) => {
  res.send("✅ Clean Airforce proxy running");
});

app.listen(PORT, () => {
  console.log(`🚀 Clean proxy running on port ${PORT}`);
});