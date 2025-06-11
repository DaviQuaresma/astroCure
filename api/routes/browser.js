router.get("/browser/stop", async (req, res) => {
    const { user_id } = req.query;
    const url = `http://local.adspower.com:50325/api/v1/browser/stop?user_id=${user_id}`;

    try {
        const result = await axios.get(url);
        return res.json(result.data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
