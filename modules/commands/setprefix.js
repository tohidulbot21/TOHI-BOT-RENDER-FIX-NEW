module.exports.config = {
	name: "setprefix",
	version: "0.0.2",
	permission: 2,
	usePrefix: true,
	credits: "TOHI-BOT-HUB",
	description: "Change prefix",
	commandCategory: "admin",
	usages: "prefix",
	cooldowns: 5,
};

module.exports.languages ={
	"vi": {
		"successChange": "Đã chuyển đổi prefix của nhóm thành: %1",
		"missingInput": "Phần prefix cần đặt không được để trống",
		"resetPrefix": "Đã reset prefix về mặc định: %1",
		"confirmChange": "Bạn có chắc bạn muốn đổi prefix của nhóm thành: %1 \nReact এই message এ confirm করতে"
	},
	"en": {
		"successChange": "Changed prefix into: %1",
		"missingInput": "Prefix have not to be blank",
		"resetPrefix": "Reset prefix to: %1",
		"confirmChange": "Are you sure that you want to change prefix into: %1\nReact to this message to confirm"
	},
	"bd": {
		"successChange": "প্রিফিক্স পরিবর্তন করা হয়েছে: %1",
		"missingInput": "প্রিফিক্স খালি রাখা যাবে না",
		"resetPrefix": "প্রিফিক্স রিসেট করা হয়েছে: %1",
		"confirmChange": "আপনি কি নিশ্চিত যে প্রিফিক্স পরিবর্তন করতে চান: %1\nনিশ্চিত করতে এই মেসেজে রিয়েক্ট করুন"
	}
}

module.exports.handleReaction = async function({ api, event, Threads, handleReaction, getText }) {
	try {
		if (event.userID != handleReaction.author) return;
		
		// Double-check bot admin permission
		if (!global.config.ADMINBOT.includes(event.userID)) {
			return api.sendMessage("❌ শুধুমাত্র bot admin এই command ব্যবহার করতে পারে।", event.threadID);
		}

		const { threadID, messageID } = event;
		var data = (await Threads.getData(String(threadID))).data || {};
		data["PREFIX"] = handleReaction.PREFIX;
		await Threads.setData(threadID, { data });
		await global.data.threadData.set(String(threadID), data);
		api.unsendMessage(handleReaction.messageID);
		
		// Use fallback if getText fails
		let successMessage;
		try {
			successMessage = getText("successChange", handleReaction.PREFIX);
		} catch (langError) {
			successMessage = `✅ প্রিফিক্স সফলভাবে পরিবর্তন করা হয়েছে: ${handleReaction.PREFIX}`;
		}
		
		return api.sendMessage(successMessage, threadID, messageID);
	} catch (e) { 
		console.log("SetPrefix handleReaction error:", e);
		return api.sendMessage("❌ প্রিফিক্স পরিবর্তনে সমস্যা হয়েছে।", event.threadID);
	}
}

module.exports.run = async ({ api, event, args, Threads , getText }) => {
	// Check if user is bot admin
	if (!global.config.ADMINBOT.includes(event.senderID)) {
		return api.sendMessage("❌ শুধুমাত্র bot admin এই command ব্যবহার করতে পারে।", event.threadID, event.messageID);
	}

	// Fallback function for language errors
	const getTextSafe = (key, ...params) => {
		try {
			return getText(key, ...params);
		} catch (error) {
			console.log(`Language key error: ${key}`);
			switch(key) {
				case "missingInput":
					return "❌ প্রিফিক্স খালি রাখা যাবে না";
				case "resetPrefix":
					return `✅ প্রিফিক্স রিসেট করা হয়েছে: ${params[0]}`;
				case "confirmChange":
					return `আপনি কি নিশ্চিত যে প্রিফিক্স পরিবর্তন করতে চান: ${params[0]}\nনিশ্চিত করতে এই মেসেজে রিয়েক্ট করুন`;
				default:
					return "Language error occurred";
			}
		}
	};

	if (typeof args[0] == "undefined") return api.sendMessage(getTextSafe("missingInput"), event.threadID, event.messageID);
	let prefix = args[0].trim();
	if (!prefix) return api.sendMessage(getTextSafe("missingInput"), event.threadID, event.messageID);
	
	if (prefix == "reset") {
		var data = (await Threads.getData(event.threadID)).data || {};
		data["PREFIX"] = global.config.PREFIX;
		await Threads.setData(event.threadID, { data });
		await global.data.threadData.set(String(event.threadID), data);
		return api.sendMessage(getTextSafe("resetPrefix", global.config.PREFIX), event.threadID, event.messageID);
	} else {
		return api.sendMessage(getTextSafe("confirmChange", prefix), event.threadID, (error, info) => {
			if (error) {
				console.log("SetPrefix reaction setup error:", error);
				return api.sendMessage("❌ রিয়েকশন সেটআপে সমস্যা হয়েছে।", event.threadID, event.messageID);
			}
			global.client.handleReaction.push({
				name: "setprefix",
				messageID: info.messageID,
				author: event.senderID,
				PREFIX: prefix
			});
		});
	}
}