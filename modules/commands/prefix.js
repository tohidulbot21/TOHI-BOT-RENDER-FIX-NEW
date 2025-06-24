module.exports.config = {
    name: "prefix",
    version: "2.0.1",
    hasPermssion: 0,
    usePrefix: false, // Can be called without prefix
    credits: "TOHI-BOT-HUB",
    description: "Display current prefix info",
    commandCategory: "config",
    usages: "",
    cooldowns: 3,
};

module.exports.run = async ({ api, event, Threads }) => {
    const { threadID, messageID } = event;

    try {
        // Get global prefix
        const globalPrefix = global.config.PREFIX;

        // Get group data and current prefix
        const threadData = (await Threads.getData(threadID)).data || {};
        const currentGroupPrefix = threadData.PREFIX;

        // Simple 3-line prefix info
        let prefixInfo = `🤖 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${global.config.BOTNAME || "TOHI-BOT"}\n`;
        prefixInfo += `🌐 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: "${globalPrefix}"\n`;

        if (currentGroupPrefix && currentGroupPrefix !== globalPrefix) {
            prefixInfo += `🏠 𝐁𝐨𝐱 𝐏𝐫𝐞𝐟𝐢𝐱: "${currentGroupPrefix}"`;
        } else {
            prefixInfo += `🏠 𝐁𝐨𝐱 𝐏𝐫𝐞𝐟𝐢𝐱: "${globalPrefix}" (𝐃𝐞𝐟𝐚𝐮𝐥𝐭)`;
        }

        return api.sendMessage(prefixInfo, threadID, messageID);

    } catch (error) {
        console.log("Prefix command error:", error);
        return api.sendMessage("❌ প্রিফিক্স তথ্য লোড করতে সমস্যা হয়েছে।", threadID, messageID);
    }
};