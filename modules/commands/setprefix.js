
module.exports.config = {
	name: "setprefix",
	version: "0.0.3",
	permission: 2,
	usePrefix: true,
	credits: "TOHI-BOT-HUB",
	description: "Change prefix for specific group with confirmation",
	commandCategory: "admin",
	usages: "setprefix [new_prefix]",
	cooldowns: 5,
};

module.exports.languages = {
	"vi": {
		"successChange": "Đã chuyển đổi prefix của nhóm thành: %1",
		"missingInput": "Phần prefix cần đặt không được để trống",
		"resetPrefix": "Đã reset prefix về mặc định: %1",
		"confirmChange": "Bạn có chắc bạn muốn đổi prefix của nhóm thành: %1 \nReact hoặc reply এই message এ confirm করতে"
	},
	"en": {
		"successChange": "Changed prefix into: %1",
		"missingInput": "Prefix have not to be blank",
		"resetPrefix": "Reset prefix to: %1",
		"confirmChange": "Are you sure that you want to change prefix into: %1\nReact or reply to this message to confirm"
	},
	"bd": {
		"successChange": "প্রিফিক্স পরিবর্তন করা হয়েছে: %1",
		"missingInput": "প্রিফিক্স খালি রাখা যাবে না",
		"resetPrefix": "প্রিফিক্স রিসেট করা হয়েছে: %1",
		"confirmChange": "আপনি কি নিশ্চিত যে প্রিফিক্স পরিবর্তন করতে চান: %1\nনিশ্চিত করতে এই মেসেজে রিয়েক্ট বা রিপ্লাই করুন"
	}
}

// Handle reaction confirmation
module.exports.handleReaction = async function({ api, event, Threads, handleReaction, getText }) {
	try {
		if (event.userID != handleReaction.author) return;
		
		// Check bot admin permission
		if (!global.config.ADMINBOT.includes(event.userID)) {
			return api.sendMessage("❌ শুধুমাত্র bot admin এই command ব্যবহার করতে পারে।", event.threadID);
		}

		const { threadID, messageID } = event;
		
		// Set the new prefix for this specific group
		var data = (await Threads.getData(String(threadID))).data || {};
		data["PREFIX"] = handleReaction.PREFIX;
		await Threads.setData(threadID, { data });
		await global.data.threadData.set(String(threadID), data);
		
		// Remove the confirmation message
		api.unsendMessage(handleReaction.messageID);
		
		// Success message
		let successMessage;
		try {
			successMessage = getText("successChange", handleReaction.PREFIX);
		} catch (langError) {
			successMessage = `✅ প্রিফিক্স সফলভাবে পরিবর্তন করা হয়েছে: ${handleReaction.PREFIX}\n\n🔸 এই গ্রুপে এখন সব command এর জন্য "${handleReaction.PREFIX}" prefix ব্যবহার করুন\n🔸 Global config prefix "${global.config.PREFIX}" এর পাশাপাশি এই গ্রুপের জন্য "${handleReaction.PREFIX}" ও কাজ করবে`;
		}
		
		return api.sendMessage(successMessage, threadID, messageID);
	} catch (e) { 
		console.log("SetPrefix handleReaction error:", e);
		return api.sendMessage("❌ প্রিফিক্স পরিবর্তনে সমস্যা হয়েছে।", event.threadID);
	}
}

// Handle reply confirmation
module.exports.handleReply = async function({ api, event, Threads, handleReply, getText }) {
	try {
		if (event.senderID != handleReply.author) return;
		
		// Check bot admin permission
		if (!global.config.ADMINBOT.includes(event.senderID)) {
			return api.sendMessage("❌ শুধুমাত্র bot admin এই command ব্যবহার করতে পারে।", event.threadID);
		}

		const { threadID, messageID } = event;
		
		// Set the new prefix for this specific group
		var data = (await Threads.getData(String(threadID))).data || {};
		data["PREFIX"] = handleReply.PREFIX;
		await Threads.setData(threadID, { data });
		await global.data.threadData.set(String(threadID), data);
		
		// Remove the confirmation message
		api.unsendMessage(handleReply.messageID);
		
		// Success message
		let successMessage;
		try {
			successMessage = getText("successChange", handleReply.PREFIX);
		} catch (langError) {
			successMessage = `✅ প্রিফিক্স সফলভাবে পরিবর্তন করা হয়েছে: ${handleReply.PREFIX}\n\n🔸 এই গ্রুপে এখন সব command এর জন্য "${handleReply.PREFIX}" prefix ব্যবহার করুন\n🔸 Global config prefix "${global.config.PREFIX}" এর পাশাপাশি এই গ্রুপের জন্য "${handleReply.PREFIX}" ও কাজ করবে`;
		}
		
		return api.sendMessage(successMessage, threadID, messageID);
	} catch (e) { 
		console.log("SetPrefix handleReply error:", e);
		return api.sendMessage("❌ প্রিফিক্স পরিবর্তনে সমস্যা হয়েছে।", event.threadID);
	}
}

module.exports.run = async ({ api, event, args, Threads, getText }) => {
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
					return `✅ প্রিফিক্স রিসেট করা হয়েছে: ${params[0]}\n\n🔸 এই গ্রুপে আবার global prefix "${params[0]}" ব্যবহার হবে`;
				case "confirmChange":
					return `🔄 প্রিফিক্স পরিবর্তনের নিশ্চিতকরণ:\n\n🔸 নতুন প্রিফিক্স: "${params[0]}"\n🔸 এই গ্রুপের জন্য সব command এ এই prefix কাজ করবে\n🔸 Global config prefix "${global.config.PREFIX}" এর পাশাপাশি "${params[0]}" ও কাজ করবে\n\n✅ নিশ্চিত করতে এই মেসেজে যেকোনো রিয়েক্ট করুন বা যেকোনো কিছু রিপ্লাই করুন`;
				default:
					return "Language error occurred";
			}
		}
	};

	// Check if prefix is provided
	if (typeof args[0] == "undefined") {
		return api.sendMessage(getTextSafe("missingInput"), event.threadID, event.messageID);
	}
	
	let prefix = args[0].trim();
	if (!prefix) {
		return api.sendMessage(getTextSafe("missingInput"), event.threadID, event.messageID);
	}
	
	// Handle reset command
	if (prefix == "reset") {
		var data = (await Threads.getData(event.threadID)).data || {};
		data["PREFIX"] = global.config.PREFIX;
		await Threads.setData(event.threadID, { data });
		await global.data.threadData.set(String(event.threadID), data);
		return api.sendMessage(getTextSafe("resetPrefix", global.config.PREFIX), event.threadID, event.messageID);
	} else {
		// Send confirmation message that supports both reaction and reply
		return api.sendMessage(getTextSafe("confirmChange", prefix), event.threadID, (error, info) => {
			if (error) {
				console.log("SetPrefix confirmation setup error:", error);
				return api.sendMessage("❌ কনফার্মেশন সেটআপে সমস্যা হয়েছে।", event.threadID, event.messageID);
			}
			
			// Add to both reaction and reply handlers
			global.client.handleReaction.push({
				name: "setprefix",
				messageID: info.messageID,
				author: event.senderID,
				PREFIX: prefix
			});
			
			global.client.handleReply.push({
				name: "setprefix",
				messageID: info.messageID,
				author: event.senderID,
				PREFIX: prefix
			});
		});
	}
}
