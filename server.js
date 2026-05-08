const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const youtubedl = require("yt-dlp-exec");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.use(
    "/downloads",
    express.static(
        path.join(__dirname, "downloads")
    )
);

app.post("/info", async (req, res) => {

    const { url } = req.body;

    if (!url) {

        return res.json({
            success: false
        });

    }

    try {

        const info =
            await youtubedl(url, {

                dumpSingleJson: true,

                noWarnings: true,

                noCallHome: true

            });

        const formats =
            info.formats

            .filter(f => f.height)

            .filter(f => f.height <= 2160)

            .map(f => ({
                format_id: f.format_id,
                height: f.height
            }))

            .filter(
                (value, index, self) =>
                    index === self.findIndex(
                        t => t.height === value.height
                    )
            )

            .sort((a, b) =>
                b.height - a.height
            );

        res.json({

            success: true,

            title: info.title,

            thumbnail: info.thumbnail,

            formats

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,

            error: "Video info error"

        });

    }

});

app.post("/download", async (req, res) => {

    const {
        url,
        type
    } = req.body;

    if (!url) {

        return res.json({
            success: false
        });

    }

    if (!fs.existsSync("downloads")) {

        fs.mkdirSync("downloads");

    }

    fs.readdirSync("downloads")
    .forEach(file => {

        fs.unlinkSync(
            path.join("downloads", file)
        );

    });

    try {

        if (type === "mp3") {

            await youtubedl(url, {

                extractAudio: true,

                audioFormat: "mp3",

                audioQuality: 0,

                output:
                "downloads/audio.%(ext)s"

            });

        } else {

            await youtubedl(url, {

                format:
                "bestvideo+bestaudio/best",

                mergeOutputFormat: "mp4",

                output:
                "downloads/video.%(ext)s"

            });

        }

        const files =
            fs.readdirSync("downloads");

        if (files.length === 0) {

            return res.json({

                success: false

            });

        }

        res.json({

            success: true,

            file:
            `/downloads/${files[0]}`

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,

            error: "Download failed"

        });

    }

});

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
