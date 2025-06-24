
module.exports.config = {
    name: "prefix",
    version: "2.0.1",
    hasPermssion: 0,
    usePrefix: false, // Can be called without prefix
    credits: "TOHI-BOT-HUB",
    description: "Display current prefix and manage global/group prefixes",
    commandCategory: "config",
    usages: "[global|group|reset]",
    cooldowns: 3,
};

module.exports.languages = {
    "vi": {
        "currentPrefix": "Prefix hiện tại của nhóm này là: %1",
        "globalPrefix": "Prefix toàn cầu: %1",
        "groupPrefix": "Prefix nhóm: %1",
        "noGroupPrefix": "Nhóm này đang sử dụng prefix toàn cầu",
        "adminOnly": "Chỉ admin bot mới có thể thay đổi prefix",
        "usage": "Sử dụng: prefix [global|group|reset]"
    },
    "en": {
        "currentPrefix": "Current prefix for this group is: %1",
        "globalPrefix": "Global prefix: %1",
        "groupPrefix": "Group prefix: %1",
        "noGroupPrefix": "This group is using global prefix",
        "adminOnly": "Only bot admin can change prefix",
        "usage": "Usage: prefix [global|group|reset]"
    },
    "bd": {
        "currentPrefix": "এই গ্রুপের বর্তমান প্রিফিক্স: %1",
        "globalPrefix": "গ্লোবাল প্রিফিক্স: %1",
        "groupPrefix": "গ্রুপ প্রিফিক্স: %1",
        "noGroupPrefix": "এই গ্রুপ গ্লোবাল প্রিফিক্স ব্যবহার করছে",
        "adminOnly": "শুধুমাত্র bot admin prefix পরিবর্তন করতে পারে",
        "usage": "ব্যবহার: prefix [global|group|reset]"
    }
};

module.exports.run = async ({ api, event, args, Threads, getText }) => {
    const { threadID, messageID, senderID } = event;
    
    // Fallback function for language errors
    const getTextSafe = (key, ...params) => {
        try {
            return getText(key, ...params);
        } catch (error) {
            console.log(`Language key error: ${key}`);
            switch(key) {
                case "currentPrefix":
                    return `এই গ্রুপের বর্তমান প্রিফিক্স: ${params[0]}`;
                case "globalPrefix":
                    return `গ্লোবাল প্রিফিক্স: ${params[0]}`;
                case "groupPrefix":
                    return `গ্রুপ প্রিফিক্স: ${params[0]}`;
                case "noGroupPrefix":
                    return "এই গ্রুপ গ্লোবাল প্রিফিক্স ব্যবহার করছে";
                case "adminOnly":
                    return "শুধুমাত্র bot admin prefix পরিবর্তন করতে পারে";
                case "usage":
                    return "ব্যবহার: prefix [global|group|reset]";
                default:
                    return "Language error occurred";
            }
        }
    };

    try {
        // Get global prefix
        const globalPrefix = global.config.PREFIX;
        
        // Get group data and current prefix
        const threadData = (await Threads.getData(threadID)).data || {};
        const currentGroupPrefix = threadData.PREFIX;
        const activePrefix = currentGroupPrefix || globalPrefix;

        // If no arguments, show current prefix info
        if (!args[0]) {
            let prefixInfo = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prefixInfo += `                🤖 𝐓𝐎𝐇𝐈-𝐁𝐎𝐓 𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐍𝐅𝐎 🤖\n`;
            prefixInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            prefixInfo += `🎯 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${global.config.BOTNAME || "TOHI-BOT"}\n`;
            prefixInfo += `🌐 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: "${globalPrefix}"\n`;
            
            if (currentGroupPrefix && currentGroupPrefix !== globalPrefix) {
                prefixInfo += `🏠 𝐁𝐨𝐱 𝐏𝐫𝐞𝐟𝐢𝐱: "${currentGroupPrefix}"\n`;
                prefixInfo += `✅ 𝐀𝐜𝐭𝐢𝐯𝐞 𝐏𝐫𝐞𝐟𝐢𝐱: "${activePrefix}"\n`;
            } else {
                prefixInfo += `🏠 𝐁𝐨𝐱 𝐏𝐫𝐞𝐟𝐢𝐱: 𝐍𝐨𝐭 𝐒𝐞𝐭\n`;
                prefixInfo += `✅ 𝐀𝐜𝐭𝐢𝐯𝐞 𝐏𝐫𝐞𝐟𝐢𝐱: "${activePrefix}" (𝐆𝐥𝐨𝐛𝐚𝐥)\n`;
            }
            
            prefixInfo += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prefixInfo += `                    📋 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐎𝐩𝐭𝐢𝐨𝐧𝐬\n`;
            prefixInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prefixInfo += `🔹 ${activePrefix}prefix global - 𝐆𝐥𝐨𝐛𝐚𝐥 𝐢𝐧𝐟𝐨 𝐯𝐢𝐞𝐰\n`;
            prefixInfo += `🔹 ${activePrefix}prefix group - 𝐆𝐫𝐨𝐮𝐩 𝐦𝐚𝐧𝐚𝐠𝐞\n`;
            prefixInfo += `🔹 ${activePrefix}prefix reset - 𝐑𝐞𝐬𝐞𝐭 𝐩𝐫𝐞𝐟𝐢𝐱\n`;
            prefixInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            prefixInfo += `💡 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: "${activePrefix}help" - 𝐇𝐞𝐥𝐩 𝐜𝐨𝐦𝐦𝐚𝐧𝐝\n`;
            prefixInfo += `💎 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: "${activePrefix}ai hello" - 𝐀𝐈 𝐜𝐡𝐚𝐭`;
            
            return api.sendMessage(prefixInfo, threadID, messageID);
        }

        const option = args[0].toLowerCase();

        switch(option) {
            case "global":
                let globalInfo = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                globalInfo += `            🌐 𝐆𝐋𝐎𝐁𝐀𝐋 𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐍𝐅𝐎 🌐\n`;
                globalInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                globalInfo += `🎯 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${global.config.BOTNAME || "TOHI-BOT"}\n`;
                globalInfo += `🌟 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: "${globalPrefix}"\n`;
                globalInfo += `⚡ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐀𝐜𝐭𝐢𝐯𝐞 𝐚𝐜𝐫𝐨𝐬𝐬 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐬\n`;
                globalInfo += `🔧 𝐂𝐨𝐧𝐟𝐢𝐠: 𝐒𝐞𝐭 𝐢𝐧 config.json\n`;
                globalInfo += `🎮 𝐂𝐨𝐦𝐩𝐚𝐭𝐢𝐛𝐢𝐥𝐢𝐭𝐲: 𝐀𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n\n`;
                globalInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                globalInfo += `💡 𝐄𝐱𝐚𝐦𝐩𝐥𝐞𝐬:\n`;
                globalInfo += `   • "${globalPrefix}help" - 𝐇𝐞𝐥𝐩 𝐜𝐨𝐦𝐦𝐚𝐧𝐝\n`;
                globalInfo += `   • "${globalPrefix}ai hello" - 𝐀𝐈 𝐜𝐡𝐚𝐭\n`;
                globalInfo += `   • "${globalPrefix}info" - 𝐁𝐨𝐭 𝐢𝐧𝐟𝐨`;
                
                return api.sendMessage(globalInfo, threadID, messageID);

            case "group":
                if (!global.config.ADMINBOT.includes(senderID)) {
                    return api.sendMessage("❌ " + getTextSafe("adminOnly"), threadID, messageID);
                }
                
                let groupInfo = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                groupInfo += `           🏠 𝐆𝐑𝐎𝐔𝐏 𝐏𝐑𝐄𝐅𝐈𝐗 𝐌𝐀𝐍𝐀𝐆𝐄𝐌𝐄𝐍𝐓 🏠\n`;
                groupInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                
                groupInfo += `🎯 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${global.config.BOTNAME || "TOHI-BOT"}\n`;
                groupInfo += `🌐 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: "${globalPrefix}"\n`;
                groupInfo += `🏠 𝐁𝐨𝐱 𝐏𝐫𝐞𝐟𝐢𝐱: `;
                
                if (currentGroupPrefix && currentGroupPrefix !== globalPrefix) {
                    groupInfo += `"${currentGroupPrefix}"\n`;
                    groupInfo += `✅ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐂𝐮𝐬𝐭𝐨𝐦 𝐏𝐫𝐞𝐟𝐢𝐱 𝐀𝐜𝐭𝐢𝐯𝐞\n`;
                } else {
                    groupInfo += `𝐍𝐨𝐭 𝐒𝐞𝐭\n`;
                    groupInfo += `⚡ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐔𝐬𝐢𝐧𝐠 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱\n`;
                }
                
                groupInfo += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                groupInfo += `                   ⚙️ 𝐌𝐚𝐧𝐚𝐠𝐞𝐦𝐞𝐧𝐭 𝐎𝐩𝐭𝐢𝐨𝐧𝐬\n`;
                groupInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                groupInfo += `🔹 ${globalPrefix}setprefix [𝐧𝐞𝐰 𝐩𝐫𝐞𝐟𝐢𝐱] - 𝐒𝐞𝐭 𝐧𝐞𝐰\n`;
                groupInfo += `🔹 ${activePrefix}prefix reset - 𝐑𝐞𝐬𝐞𝐭 𝐭𝐨 𝐝𝐞𝐟𝐚𝐮𝐥𝐭\n`;
                groupInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                groupInfo += `💡 𝐍𝐨𝐭𝐞: 𝐆𝐫𝐨𝐮𝐩 𝐩𝐫𝐞𝐟𝐢𝐱 𝐨𝐧𝐥𝐲 𝐰𝐨𝐫𝐤𝐬 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩`;
                
                return api.sendMessage(groupInfo, threadID, messageID);

            case "reset":
                if (!global.config.ADMINBOT.includes(senderID)) {
                    return api.sendMessage("❌ " + getTextSafe("adminOnly"), threadID, messageID);
                }
                
                // Reset group prefix to global
                let data = (await Threads.getData(threadID)).data || {};
                data["PREFIX"] = globalPrefix;
                await Threads.setData(threadID, { data });
                await global.data.threadData.set(String(threadID), data);
                
                let resetMsg = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                resetMsg += `                ✅ 𝐏𝐑𝐄𝐅𝐈𝐗 𝐑𝐄𝐒𝐄𝐓 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋 ✅\n`;
                resetMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                resetMsg += `🎯 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${global.config.BOTNAME || "TOHI-BOT"}\n`;
                resetMsg += `🌐 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: "${globalPrefix}"\n`;
                resetMsg += `🏠 𝐁𝐨𝐱 𝐏𝐫𝐞𝐟𝐢𝐱: 𝐑𝐞𝐬𝐞𝐭 𝐭𝐨 𝐆𝐥𝐨𝐛𝐚𝐥\n\n`;
                resetMsg += `🔄 𝐎𝐥𝐝 𝐏𝐫𝐞𝐟𝐢𝐱: "${currentGroupPrefix || '𝐍𝐨𝐭 𝐒𝐞𝐭'}"\n`;
                resetMsg += `🔥 𝐍𝐞𝐰 𝐏𝐫𝐞𝐟𝐢𝐱: "${globalPrefix}" (𝐆𝐥𝐨𝐛𝐚𝐥)\n\n`;
                resetMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                resetMsg += `💡 𝐍𝐨𝐰 𝐮𝐬𝐢𝐧𝐠 𝐠𝐥𝐨𝐛𝐚𝐥 𝐩𝐫𝐞𝐟𝐢𝐱 "${globalPrefix}" 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩`;
                
                return api.sendMessage(resetMsg, threadID, messageID);

            default:
                return api.sendMessage("❌ " + getTextSafe("usage"), threadID, messageID);
        }
        
    } catch (error) {
        console.log("Prefix command error:", error);
        return api.sendMessage("❌ প্রিফিক্স তথ্য লোড করতে সমস্যা হয়েছে।", threadID, messageID);
    }
};
