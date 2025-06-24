
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
            let prefixInfo = `╭─────✨ প্রিফিক্স তথ্য ✨─────╮\n`;
            prefixInfo += `│  🌐 গ্লোবাল প্রিফিক্স: "${globalPrefix}"\n`;
            
            if (currentGroupPrefix && currentGroupPrefix !== globalPrefix) {
                prefixInfo += `│  🏠 গ্রুপ প্রিফিক্স: "${currentGroupPrefix}"\n`;
                prefixInfo += `│  ✅ বর্তমান ব্যবহৃত: "${activePrefix}"\n`;
            } else {
                prefixInfo += `│  🏠 গ্রুপ প্রিফিক্স: সেট করা নেই\n`;
                prefixInfo += `│  ✅ বর্তমান ব্যবহৃত: "${activePrefix}" (গ্লোবাল)\n`;
            }
            
            prefixInfo += `│\n`;
            prefixInfo += `│  📝 কমান্ড অপশন:\n`;
            prefixInfo += `│  • prefix global - গ্লোবাল তথ্য দেখুন\n`;
            prefixInfo += `│  • prefix group - গ্রুপ প্রিফিক্স ম্যানেজ করুন\n`;
            prefixInfo += `│  • prefix reset - গ্রুপ প্রিফিক্স রিসেট করুন\n`;
            prefixInfo += `╰───────────────────────────╯\n\n`;
            prefixInfo += `💡 উদাহরণ: "${activePrefix}help" - help command চালান`;
            
            return api.sendMessage(prefixInfo, threadID, messageID);
        }

        const option = args[0].toLowerCase();

        switch(option) {
            case "global":
                let globalInfo = `╭─────🌐 গ্লোবাল প্রিফিক্স ইনফো 🌐─────╮\n`;
                globalInfo += `│  🔸 গ্লোবাল প্রিফিক্স: "${globalPrefix}"\n`;
                globalInfo += `│  🔸 সব গ্রুপে ডিফল্ট হিসেবে কাজ করে\n`;
                globalInfo += `│  🔸 config.json এ সেট করা আছে\n`;
                globalInfo += `│  🔸 সব command এর সাথে কাজ করে\n`;
                globalInfo += `╰─────────────────────────────╯\n\n`;
                globalInfo += `💡 উদাহরণ: "${globalPrefix}help", "${globalPrefix}ai hello"`;
                
                return api.sendMessage(globalInfo, threadID, messageID);

            case "group":
                if (!global.config.ADMINBOT.includes(senderID)) {
                    return api.sendMessage("❌ " + getTextSafe("adminOnly"), threadID, messageID);
                }
                
                let groupInfo = `╭─────🏠 গ্রুপ প্রিফিক্স ম্যানেজমেন্ট 🏠─────╮\n`;
                groupInfo += `│  🔸 বর্তমান গ্রুপ প্রিফিক্স: `;
                
                if (currentGroupPrefix && currentGroupPrefix !== globalPrefix) {
                    groupInfo += `"${currentGroupPrefix}"\n`;
                    groupInfo += `│  🔸 স্ট্যাটাস: কাস্টম প্রিফিক্স সক্রিয়\n`;
                } else {
                    groupInfo += `সেট করা নেই\n`;
                    groupInfo += `│  🔸 স্ট্যাটাস: গ্লোবাল প্রিফিক্স ব্যবহার করছে\n`;
                }
                
                groupInfo += `│  🔸 গ্লোবাল প্রিফিক্স: "${globalPrefix}"\n`;
                groupInfo += `│\n`;
                groupInfo += `│  ⚙️ ম্যানেজমেন্ট:\n`;
                groupInfo += `│  • /setprefix [নতুন প্রিফিক্স] - নতুন সেট করুন\n`;
                groupInfo += `│  • prefix reset - ডিফল্টে ফিরান\n`;
                groupInfo += `╰───────────────────────────────╯\n\n`;
                groupInfo += `💡 টিপ: গ্রুপ প্রিফিক্স শুধু এই গ্রুপেই কাজ করে`;
                
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
                
                let resetMsg = `✅ গ্রুপ প্রিফিক্স রিসেট সম্পন্ন!\n\n`;
                resetMsg += `🔸 পুরাতন প্রিফিক্স: "${currentGroupPrefix || 'সেট করা ছিল না'}"\n`;
                resetMsg += `🔸 নতুন প্রিফিক্স: "${globalPrefix}" (গ্লোবাল)\n\n`;
                resetMsg += `💡 এখন এই গ্রুপে গ্লোবাল প্রিফিক্স "${globalPrefix}" ব্যবহার হবে`;
                
                return api.sendMessage(resetMsg, threadID, messageID);

            default:
                return api.sendMessage("❌ " + getTextSafe("usage"), threadID, messageID);
        }
        
    } catch (error) {
        console.log("Prefix command error:", error);
        return api.sendMessage("❌ প্রিফিক্স তথ্য লোড করতে সমস্যা হয়েছে।", threadID, messageID);
    }
};
