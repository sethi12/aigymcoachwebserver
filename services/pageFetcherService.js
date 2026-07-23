const axios = require("axios");

const fetchPage = async (url) => {

    try {

        const response = await axios.get(url, {

            timeout: 15000,

            headers: {

                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

            }

        });

        return response.data;

    }

    catch (err) {

        console.log("Failed:", url);

        return null;

    }

};

module.exports = {

    fetchPage

};