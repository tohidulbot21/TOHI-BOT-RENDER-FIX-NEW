module.exports = function ({ api, Users, Threads, Currencies, logger, botSettings }) {
  const moment = require("moment-timezone");
  const axios = require("axios");

  // Enhanced error filtering for cleaner console
  function shouldIgnoreError(error) {
    if (!error) return true;

    const errorStr = error.toString().toLowerCase();
    const ignorablePatterns = [
      'rate limit', 'enoent', 'network timeout', 'connection reset',
      'does not exist in database', 'you can\'t use this feature',
      'took too long to execute', 'command timeout', 'execution timeout',
      'request timeout', 'socket timeout', 'network error', 'api error',
      'facebook error', 'permission denied', 'access denied',
      'invalid session', 'login required', 'cannot read properties of undefined',
      'getname is not a function', 'mqtt', 'attachment url',
      'has no valid run or onstart function', 'command has no valid',
      'no valid function', 'function is not defined', 'getthreadinfographql',
      'invalid response data', 'undefined reading', 'formatthreadgraphqlresponse',
      'thread creation error', 'cannot read properties', 'is not a function',
      'thread info', 'graphql', 'mention', 'not found in message string'
    ];

    return ignorablePatterns.some(pattern => errorStr.includes(pattern));
  }

  // Enhanced cooldown management
  const cooldowns = new Map();
  const userActivity = new Map();

  function checkCooldown(userID, commandName, cooldownTime) {
    if (!cooldownTime || cooldownTime <= 0) return true;

    const key = `${userID}_${commandName}`;
    const now = Date.now();
    const lastUsed = cooldowns.get(key) || 0;

    if (now - lastUsed < cooldownTime * 1000) {
      return false;
    }

    cooldowns.set(key, now);
    return true;
  }

  // Command execution without timeout
  async function executeCommand(command, Obj, commandName) {
    try {
      // Support run, onStart, and start functions
      if (typeof command.run === 'function') {
        return await command.run(Obj);
      } else if (typeof command.onStart === 'function') {
        return await command.onStart(Obj);
      } else if (typeof command.start === 'function') {
        return await command.start(Obj);
      } else {
        // Silently ignore commands without valid functions
        return;
      }
    } catch (error) {
      // Enhanced error handling with better categorization
      const errorMessage = error.message || error.toString();

      // Ignore common harmless errors silently
      const ignorableErrors = [
        'rate limit', 'rate', 'ENOENT', 'not found', 'timeout', 'TIMEOUT',
        'Permission', 'banned', 'not allowed', 'couldn\'t send', 'error: 3370026'
      ];

      if (ignorableErrors.some(err => errorMessage.toLowerCase().includes(err.toLowerCase()))) {
        return; // Silent handling for common errors
      }

      // Only log genuine unexpected errors
      logger.log(`Command execution error [${commandName}]: ${errorMessage}`, "DEBUG");
    }
  }

  function getCommandTimeout(commandName) {
    // Heavy commands get longer timeout
    const heavyCommands = [
      'album', 'album2', 'work', 'daily', 'video', 'video2', 'video3',
      'sing', 'sing2', 'tiktok', 'download', 'ai', 'gemini', 'imagine',
      'dalle', 'art', 'cover', 'fbcover', 'fbcover', 'insta', 'twitter', 'pinterest'
    ];

    const veryHeavyCommands = [
      'album2', 'work', 'video3', 'download', 'fbvideo'
    ];

    if (veryHeavyCommands.includes(commandName?.toLowerCase())) {
      return 300000; // 5 minutes
    } else if (heavyCommands.includes(commandName?.toLowerCase())) {
      return 180000; // 3 minutes
    } else {
      return 60000; // 1 minute
    }
  }

  // Command execution tracking to prevent duplicates
  const executedCommands = new Map();
  const DUPLICATE_TIMEOUT = 1000; // 1 second timeout

  return async function handleCommand({ event }) {
    try {
      if (!event || !event.body) return;

      const { api } = global.client;
      const { commands } = global.client;
      const { threadID, messageID, senderID, isGroup, timestamp } = event;

      // Create unique command key for duplicate detection
      const commandKey = `${senderID}-${threadID}-${event.body.trim()}-${timestamp || Date.now()}`;

      // Check for duplicate command execution
      if (executedCommands.has(commandKey)) {
        return; // Silent return for duplicates
      }

      // Mark command as executed
      executedCommands.set(commandKey, Date.now());

      // Clean up old entries
      setTimeout(() => {
        executedCommands.delete(commandKey);
      }, DUPLICATE_TIMEOUT);

      // Check if group is approved before executing any commands using new Groups system
      const Groups = require('../database/groups')({ api: global.client.api });

      // Check if user is admin/owner
      const isAdmin = global.config.ADMINBOT?.includes(senderID);
      const isOwner = global.config.ADMINBOT?.includes(senderID);

      // ========== ENHANCED GROUP APPROVAL SYSTEM ==========
      if (event.threadID && event.threadID !== event.senderID) {
        // Get current Thread ID (TID)
        const currentTID = event.threadID;

        // Check if group exists in database
        const groupData = Groups.getData(currentTID);

        if (!groupData) {
          // Group not found in database - only allow approve command for admins
          const isApproveCommand = commandName === "approve";

          // Allow approve command for admins even in non-registered groups
          if (isApproveCommand && (isAdmin || isOwner)) {
            // Continue to command execution silently
          } else {
            // Block all other commands silently for non-registered groups
            return; // Stop execution without notification
          }
        } else {
          // Group found in database - check approval status
          const isApproved = groupData.status === 'approved';
          const isPending = groupData.status === 'pending';
          const isRejected = groupData.status === 'rejected';

          // Admin bypass - allow all commands for admins/owners
          if (isAdmin || isOwner) {
            // Continue to command execution silently
          } else if (isRejected || !isApproved || isPending) {
            // Group is not approved - block all commands for non-admins
            return; // Silent block
          }
          // If group is approved, continue to command execution
        }
      }
      // For private messages (inbox), allow all commands

      // Get thread settings
      const threadData = global.data.threadData.get(threadID) || {};
      const prefix = threadData.PREFIX || global.config.PREFIX || "/";

      let commandName = "";
      let args = [];
      let command = null;
      let usedPrefix = false;

      // Check prefix commands first
      if (event.body.startsWith(prefix)) {
        args = event.body.slice(prefix.length).trim().split(/ +/);
        commandName = args.shift()?.toLowerCase();
        usedPrefix = true;

        if (commandName) {
          // Get command (check both name and aliases)
          command = commands.get(commandName);
          if (!command) {
            // Check aliases
            for (const [name, cmd] of commands) {
              if (cmd.config.aliases && Array.isArray(cmd.config.aliases)) {
                if (cmd.config.aliases.includes(commandName)) {
                  command = cmd;
                  break;
                }
              }
            }
          }
        }
      } else {
        // Check non-prefix commands (usePrefix: false)
        const words = event.body.trim().split(/ +/);
        const firstWord = words[0]?.toLowerCase();

        if (firstWord) {
          // Check for non-prefix commands
          for (const [name, cmd] of commands) {
            if (cmd.config.usePrefix === false && 
                (name === firstWord || (cmd.config.aliases && cmd.config.aliases.includes(firstWord)))) {
              command = cmd;
              commandName = firstWord;
              args = words.slice(1);
              usedPrefix = false;
              break;
            }
          }
        }
      }

      if (!commandName || !command) return;

      // If command doesn't exist, silently ignore (don't log or process)
      if (!command) return;

      // Only proceed with logging and execution for valid commands
      const isValidCommand = command && command.config && command.config.name;

      const commandConfig = command.config;

      // Permission check - use already defined admin check
      if (commandConfig.permission > 0) {
        if (!isAdmin && !isOwner && commandConfig.permission >= 2) {
          return; // Silently ignore for non-admins
        }
      }

      // Cooldown check
      if (commandConfig.cooldowns && !checkCooldown(senderID, commandName, commandConfig.cooldowns)) {
        return; // Silently ignore cooldown violations
      }

      // Thread/User ban check
      const threadBanned = global.data.threadBanned.has(threadID);
      const userBanned = global.data.userBanned.has(senderID);
      const commandBanned = global.data.commandBanned.get(threadID)?.includes(commandName) ||
                           global.data.commandBanned.get(senderID)?.includes(commandName);

      if (threadBanned || userBanned || commandBanned) {
        return; // Silently ignore banned users/threads
      }

      // Rate limiting
      if (botSettings?.RATE_LIMITING?.ENABLED) {
        const lastActivity = userActivity.get(senderID) || 0;
        const now = Date.now();
        const interval = botSettings.RATE_LIMITING.MIN_MESSAGE_INTERVAL || 8000;

        if (now - lastActivity < interval) {
          return; // Silently ignore rate limited users
        }

        userActivity.set(senderID, now);
      }

      // Create fallback getText function that works without language keys
      const fallbackGetText = (key, ...args) => {
        try {
          // Try to use global getText first
          if (global.getText && typeof global.getText === 'function') {
            const result = global.getText(key, ...args);
            if (result && result !== key) {
              return result;
            }
          }
        } catch (e) {
          // Ignore getText errors
        }

        // Fallback messages for common keys
        const fallbackMessages = {
          "moduleInfo": `
╔═────── ★ ★ ─────═╗
        💫 TOHI-BOT MODULE INFO 💫
╚═────── ★ ★ ─────═╝
🔹 Name         : %1
🔸 Usage        : %3
📝 Description   : %2
🌈 Category     : %4
⏳ Cooldown     : %5s
🔑 Permission   : %6

⚡️ Made by TOHIDUL | TOHI-BOT ⚡️`,
          "helpList": `✨ TOHI-BOT has %1 commands available!
🔍 TIP: Type %2help [command name] for details!`,
          "user": "User",
          "adminGroup": "Admin Group",
          "adminBot": "Admin Bot",
          "on": "on",
          "off": "off",
          "successText": "Success!",
          "error": "An error occurred",
          "missingInput": "Please provide required input",
          "noPermission": "You don't have permission to use this command",
          "cooldown": "Please wait before using this command again",
          "levelup": "Congratulations {name}, you leveled up to level {level}!",
          "reason": "Reason",
          "at": "at",
          "banSuccess": "User banned successfully",
          "unbanSuccess": "User unbanned successfully"
        };

        // If we have a fallback message, format it with args
        if (fallbackMessages[key]) {
          let message = fallbackMessages[key];
          for (let i = 0; i < args.length; i++) {
            message = message.replace(new RegExp(`%${i + 1}`, 'g'), args[i] || '');
            message = message.replace(new RegExp(`\\{${i + 1}\\}`, 'g'), args[i] || '');
          }
          return message;
        }

        // If no fallback found, return a generic message
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      };

      // Create enhanced run object
      const Obj = {
        api,
        event,
        args,
        Users,
        Threads,
        Currencies,
        permssion: commandConfig.permission || 0,
        getText: fallbackGetText,
        logger
      };

      // Enhanced user info
      try {
        if (!global.data.userName.has(senderID)) {
          const userInfo = await api.getUserInfo(senderID);
          if (userInfo && userInfo[senderID]) {
            global.data.userName.set(senderID, userInfo[senderID].name || "Unknown User");
          }
        }
      } catch (e) {
        // Ignore user info errors
      }

      const userName = global.data.userName.get(senderID) || "Unknown User";

      // Enhanced console logging - only show VALID commands
      try {
        let groupName = "Private Chat";
        let groupStatus = "approved"; // Default for private chats

        if (event.threadID && event.threadID !== event.senderID) {
          try {
            const threadInfo = await api.getThreadInfo(event.threadID);
            groupName = threadInfo.threadName || `Group ${event.threadID.slice(-6)}`;

            // Get group approval status
            const Groups = require('../database/groups')({ api: global.client.api });
            const groupData = Groups.getData(event.threadID);
            groupStatus = groupData ? groupData.status.toUpperCase() : "UNAPPROVED";
          } catch (e) {
            groupName = `Group ${event.threadID.slice(-6)}`;
            groupStatus = "UNKNOWN";
          }
        }

        // Only show console output for VALID commands that exist in bot
        if (command && command.config && command.config.name) {
          const chalk = require("chalk");
          const gradient = require("gradient-string");

          const displayCommand = usedPrefix ? `${prefix}${commandName}` : commandName;
           // Log command execution only for valid commands
          console.log(`📝 Command executed: ${usedPrefix ? prefix : ''}${commandName} by ${userName} (${senderID}) in ${threadID}`);
          console.log(
            chalk.cyan("⫸ ") + 
            gradient("#00ff88", "#00ccff")("TOHI-BOT") + 
            chalk.white(" ➤ ") +
            chalk.green("✓ ") +
            chalk.yellow(`[${displayCommand.toUpperCase()}]`) + 
            chalk.white(` used by `) +
            chalk.magenta(userName) + 
            chalk.white(` in `) +
            chalk.blue(groupName) +
            chalk.gray(` [${groupStatus}]`)
          );
        }
      } catch (logError) {
        // Only log for valid commands
        if (command && command.config && command.config.name) {
          const chalk = require("chalk");
          const displayCommand = usedPrefix ? `${prefix}${commandName}` : commandName;
          console.log(
            chalk.cyan("⫸ TOHI-BOT ➤ ") + 
            chalk.green("✓ ") +
            chalk.yellow(`[${displayCommand.toUpperCase()}]`) + 
            chalk.white(" command executed")
          );
        }
      }

      // Execute command with enhanced error handling
      try {
        await executeCommand(command, Obj, commandName);
      } catch (error) {
        // Clean error logging - only show critical errors
        if (!shouldIgnoreError(error)) {
          const chalk = require("chalk");
          console.log(
            chalk.cyan("⫸ TOHI-BOT ➤ ") + 
            chalk.red("✗ ") +
            chalk.yellow(`[${commandName.toUpperCase()}]`) + 
            chalk.red(" failed: ") +
            chalk.gray(error.message.substring(0, 50))
          );
        }

        // Handle specific errors
        if (error.message.includes('rate limit')) {
          return api.sendMessage("⚠️ Rate limit exceeded. Please wait before using commands.", threadID);
        }

        if (error.message.includes('permission')) {
          return api.sendMessage("❌ You don't have permission to use this command.", threadID);
        }

        // Handle mention errors silently
        if (error.message.includes('Mention') || error.message.includes('not found in message string')) {
          return; // Don't send error message for mention issues
        }

        // Generic error message
        return api.sendMessage(`❌ Command execution failed: ${error.message}`, threadID, messageID);
      }

    } catch (error) {
      if (!shouldIgnoreError(error)) {
        logger.log(`HandleCommand error: ${error.message}`, "ERROR");
      }
    }
  };
};