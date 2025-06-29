module.exports.config = {
  name: "sing2",
  version: "1.0.5",
  hasPermssion: 0,
  usePrefix: true,
  credits: "HChong",
  description: "Play music via YouTube link, SoundCloud or search keyword",
  commandCategory: "media",
  usages: "[link or content need search]",
  cooldowns: 10,
  dependencies: {
    "@distube/ytdl-core": "",
    "simple-youtube-api": "",
    "soundcloud-downloader": "",
    "fs-extra": "",
    axios: "",
  },
  envConfig: {
    YOUTUBE_API: "AIzaSyBtiD442srhczDpcg8xbhinP423BeUFXB8",
    SOUNDCLOUD_API: "MMJhwmfTYJVFm9TiUdmYYyrf6Pzpzf3YN1",
  },
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const ytdl = global.nodemodule["@distube/ytdl-core"];
  const { createReadStream, createWriteStream, unlinkSync, statSync } =
    global.nodemodule["fs-extra"];

  // Validate user input
  const selection = parseInt(event.body.trim());
  if (isNaN(selection) || selection < 1 || selection > handleReply.link.length) {
    return api.sendMessage(`❌ Invalid selection! Please reply with a number between 1 and ${handleReply.link.length}`, event.threadID, event.messageID);
  }

  const selectedIndex = selection - 1;
  const selectedLink = `https://www.youtube.com/watch?v=${handleReply.link[selectedIndex]}`;

  try {
    const info = await ytdl.getInfo(selectedLink);
    let body = info.videoDetails.title;
    const processingMsg = await api.sendMessage(
      `🎵 Processing audio...\n──────────\n${body}\n──────────\nPlease Wait!`,
      event.threadID
    );

    const stream = ytdl(selectedLink, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    stream
      .pipe(
        createWriteStream(
          __dirname + `/cache/${handleReply.link[event.body - 1]}.m4a`,
        ),
      )
      .on("close", () => {
        if (
          statSync(__dirname + `/cache/${handleReply.link[event.body - 1]}.m4a`)
            .size > 26214400
        )
          return api.sendMessage(
            "❌File cannot be sent because it is larger than 25MB.",
            event.threadID,
            () =>
              unlinkSync(
                __dirname + `/cache/${handleReply.link[event.body - 1]}.m4a`,
              ),
            event.messageID,
          );
        else
          return api.sendMessage(
            {
              body: `${body}`,
              attachment: createReadStream(
                __dirname + `/cache/${handleReply.link[event.body - 1]}.m4a`,
              ),
            },
            event.threadID,
            () =>
              unlinkSync(
                __dirname + `/cache/${handleReply.link[event.body - 1]}.m4a`,
              ),
            event.messageID,
          );
      })
      .on("error", (error) => {
        console.log("Stream error:", error);
        api.sendMessage(
          `There was a problem processing the request. Please try again later.`,
          event.threadID,
          event.messageID,
        );
      });
  } catch (error) {
    console.log("YouTube download error:", error);
    api.sendMessage(
      "❌Unable to process your request!",
      event.threadID,
      event.messageID,
    );
  }
  return api.unsendMessage(handleReply.messageID);
};

module.exports.run = async function ({ api, event, args }) {
  const ytdl = global.nodemodule["@distube/ytdl-core"];
  const YouTubeAPI = global.nodemodule["simple-youtube-api"];
  const scdl = global.nodemodule["soundcloud-downloader"].default;
  const axios = global.nodemodule["axios"];
  const { createReadStream, createWriteStream, unlinkSync, statSync } =
    global.nodemodule["fs-extra"];

  const youtube = new YouTubeAPI(
    global.configModule[this.config.name].YOUTUBE_API,
  );
  const keyapi = global.configModule[this.config.name].YOUTUBE_API;
  if (args.length == 0 || !args)
    return api.sendMessage(
      "❌The search field cannot be left blank!",
      event.threadID,
      event.messageID,
    );
  const keywordSearch = args.join(" ");
  const videoPattern =
    /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
  const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
  const urlValid = videoPattern.test(args[0]);

  if (urlValid) {
    try {
      const info = await ytdl.getInfo(args[0]);
      let body = info.videoDetails.title;
      var id = args[0].split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      id[2] !== undefined
        ? (id = id[2].split(/[^0-9a-z_\-]/i)[0])
        : (id = id[0]);

      const stream = ytdl(args[0], {
        filter: "audioonly",
        quality: "highestaudio",
      });

      stream
        .pipe(createWriteStream(__dirname + `/cache/${id}.m4a`))
        .on("close", () => {
          if (statSync(__dirname + `/cache/${id}.m4a`).size > 26214400)
            return api.sendMessage(
              "❌The file could not be sent because it is larger than 25MB.",
              event.threadID,
              () => unlinkSync(__dirname + `/cache/${id}.m4a`),
              event.messageID,
            );
          else
            return api.sendMessage(
              {
                body: `${body}`,
                attachment: createReadStream(__dirname + `/cache/${id}.m4a`),
              },
              event.threadID,
              () => unlinkSync(__dirname + `/cache/${id}.m4a`),
              event.messageID,
            );
        })
        .on("error", (error) => {
          console.log("Stream error:", error);
          api.sendMessage(
            `❌There was a problem while processing the request. Please try again later.`,
            event.threadID,
            event.messageID,
          );
        });
    } catch (e) {
      console.log("YouTube download error:", e);
      api.sendMessage(
        "❌Unable to process your request!",
        event.threadID,
        event.messageID,
      );
    }
  } else if (scRegex.test(args[0])) {
    let body;
    try {
      var songInfo = await scdl.getInfo(
        args[0],
        global.configModule[this.config.name].SOUNDCLOUD_API,
      );
      var timePlay = Math.ceil(songInfo.duration / 1000);
      body = `Title: ${songInfo.title} | ${(timePlay - (timePlay %= 60)) / 60 + (9 < timePlay ? ":" : ":0") + timePlay}]`;
    } catch (error) {
      api.sendMessage(
        "❌The request could not be processed due to an error: " +
          error.message,
        event.threadID,
        event.messageID,
      );
    }
    try {
      await scdl
        .downloadFormat(
          args[0],
          scdl.FORMATS.OPUS,
          global.configModule[this.config.name].SOUNDCLOUD_API
            ? global.configModule[this.config.name].SOUNDCLOUD_API
            : undefined,
        )
        .then((songs) =>
          songs
            .pipe(createWriteStream(__dirname + "/cache/music.mp3"))
            .on("close", () =>
              api.sendMessage(
                {
                  body,
                  attachment: createReadStream(__dirname + "/cache/music.mp3"),
                },
                event.threadID,
                () => unlinkSync(__dirname + "/cache/music.mp3"),
                event.messageID,
              ),
            ),
        );
    } catch (error) {
      await scdl
        .downloadFormat(
          args[0],
          scdl.FORMATS.MP3,
          global.configModule[this.config.name].SOUNDCLOUD_API
            ? global.configModule[this.config.name].SOUNDCLOUD_API
            : undefined,
        )
        .then((songs) =>
          songs
            .pipe(createWriteStream(__dirname + "/cache/music.mp3"))
            .on("close", () =>
              api.sendMessage(
                {
                  body,
                  attachment: createReadStream(__dirname + "/cache/music.mp3"),
                },
                event.threadID,
                () => unlinkSync(__dirname + "/cache/music.mp3"),
                event.messageID,
              ),
            ),
        );
    }
  } else {
    try {
      var link = [],
        msg = "",
        num = 0;
      var results = await youtube.searchVideos(keywordSearch, 5);
      for (let value of results) {
        if (typeof value.id == "undefined") return;
        link.push(value.id);
        let datab = (
          await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${value.id}&key=${keyapi}`,
          )
        ).data;
        let gettime = datab.items[0].contentDetails.duration;
        let time = gettime.slice(2);
        let datac = (
          await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${value.id}&key=${keyapi}`,
          )
        ).data;
        let channel = datac.items[0].snippet.channelTitle;
        msg += `${(num += 1)}. ${value.title}\nTime: ${time}\nChannel: ${channel}\n──────────\n`;
      }
      return api.sendMessage(
        `✅ Done! ${link.length} Results match your search keyword: \n${msg}\nPlease reply(feedback) choose one of the above searches\nMaximum Song Time is 10M!`,
        event.threadID,
        async (error, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            link,
          });

          // Clean up any YouTube player script files
          try {
            const fs = require('fs');
            const path = require('path');
            const rootDir = path.join(__dirname, '../..');
            const files = fs.readdirSync(rootDir);
            files.forEach(file => {
              if (file.match(/^\d+-player-script\.js$/)) {
                try {
                  fs.unlinkSync(path.join(rootDir, file));
                  console.log(`[SING2] Cleaned up script file: ${file}`);
                } catch(err) {
                  // Ignore errors
                }
              }
            });
          } catch(err) {
            // Ignore cleanup errors
          }
        },
        event.messageID,
      );
    } catch (error) {
      api.sendMessage(
        "❌The request could not be processed due to an error: " +
          error.message,
        event.threadID,
        event.messageID,
      );
    }
  }
};