async function getVideoInfo() {

    const url =
        document.getElementById("videoUrl").value;

    if (!url) {

        alert("Please enter URL");

        return;

    }

    try {

        const response =
            await fetch("/info", {

                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    url
                })

            });

        const data =
            await response.json();

        if (!data.success) {

            alert(data.error);

            return;

        }

        document.getElementById(
            "preview"
        ).style.display = "block";

        document.getElementById(
            "thumbnail"
        ).src = data.thumbnail;

        document.getElementById(
            "videoTitle"
        ).innerHTML = data.title;

        const quality =
            document.getElementById(
                "quality"
            );

        quality.innerHTML = "";

        data.formats.forEach(format => {

            const option =
                document.createElement("option");

            option.value =
                format.format_id;

            option.textContent =
                format.height + "p";

            quality.appendChild(option);

        });

    } catch (error) {

        console.log(error);

        alert("Server Error");

    }

}

async function downloadVideo() {

    const url =
        document.getElementById(
            "videoUrl"
        ).value;

    const type =
        document.getElementById(
            "downloadType"
        ).value;

    const status =
        document.getElementById(
            "status"
        );

    const progressBar =
        document.getElementById(
            "progress-bar"
        );

    status.innerHTML =
        "Downloading...";

    progressBar.style.width =
        "0%";

    progressBar.style.background =
        "#22c55e";

    let progress = 0;

    const loading =
        setInterval(() => {

            if (progress < 90) {

                progress += 10;

                progressBar.style.width =
                    progress + "%";

            }

        }, 500);

    try {

        const response =
            await fetch("/download", {

                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    url,
                    type

                })

            });

        const data =
            await response.json();

        clearInterval(loading);

        if (!data.success) {

            progressBar.style.width =
                "100%";

            progressBar.style.background =
                "#ef4444";

            status.innerHTML =
                "❌ " + data.error;

            return;

        }

        progressBar.style.width =
            "100%";

        status.innerHTML =
            "✅ Download completed";

        const link =
            document.createElement("a");

        link.href = data.file;

        link.download = "";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    } catch (error) {

        clearInterval(loading);

        progressBar.style.width =
            "100%";

        progressBar.style.background =
            "#ef4444";

        status.innerHTML =
            "❌ Server error";

    }

}