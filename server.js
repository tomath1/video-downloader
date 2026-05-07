const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

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

app.post("/info", (req, res) => {

    const { url } = req.body;

    if (!url) {

        return res.json({
            success: false,
            error: "No URL"
        });

    }

    const command =
        `python -m yt_dlp -j "${url}"`;

    exec(command, (error, stdout, stderr) => {

        if (error) {

            console.log(stderr);

            return res.json({

                success: false,

                error: stderr

            });

        }

        try {

            const info =
                JSON.parse(stdout);

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

        } catch {

            res.json({

                success: false,

                error: "Video info error"

            });

        }

    });

});

app.post("/download", (req, res) => {

    const {
        url,
        type
    } = req.body;

    if (!url) {

        return res.json({
            success: false,
            error: "No URL"
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

    let command = "";

    if (type === "mp3") {

        command =
        `python -m yt_dlp -x --audio-format mp3 -o "downloads/audio.%(ext)s" "${url}"`;

    } else {

        command =
        `python -m yt_dlp -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "downloads/video.%(ext)s" "${url}"`;

    }

    exec(command, (error, stdout, stderr) => {

        if (error) {

            console.log(stderr);

            return res.json({

                success: false,

                error: stderr

            });

        }

        const files =
            fs.readdirSync("downloads");

        if (files.length === 0) {

            return res.json({

                success: false,

                error: "No file found"

            });

        }

        const file =
            files[0];

        res.json({

            success: true,

            file:
            `/downloads/${file}`

        });

    });

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

app.listen(5000, "0.0.0.0", () => {

    console.log(
        "Server running on http://localhost:5000"
    );

});