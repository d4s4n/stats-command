const {
    PATTERNS
} = require('../constants.js');

function formatMessage(template, values = {}) {
    if (!template) return '';
    return Object.entries(values).reduce((acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'g'), value), template);
}

async function handleStatsRequest(bot, typeChat, user, targetPlayer, settings) {
    let kills, deaths;

    try {
        const statsMatch = await bot.api.sendMessageAndWaitForReply(
            `/c stats ${targetPlayer}`,
            [PATTERNS.STATS, PATTERNS.NOT_IN_CLAN, PATTERNS.PLAYER_OFFLINE],
            5000
        );

        if (PATTERNS.NOT_IN_CLAN.test(statsMatch[0])) {
            const message = formatMessage(settings.notInClanMessage, {
                player: targetPlayer
            });
            return bot.api.sendMessage(typeChat, message, user.username);
        }

        if (PATTERNS.PLAYER_OFFLINE.test(statsMatch[0])) {
            const message = formatMessage(settings.playerOfflineMessage, {
                player: targetPlayer
            });
            return bot.api.sendMessage(typeChat, message, user.username);
        }

        kills = parseInt(statsMatch[1], 10);
        deaths = parseInt(statsMatch[2], 10);

    } catch (error) {
        const message = formatMessage(settings.errorStatsMessage, {
            player: targetPlayer
        });
        return bot.api.sendMessage(typeChat, message, user.username);
    }

    try {
        const seenMatch = await bot.api.sendMessageAndWaitForReply(
            `/seen ${targetPlayer}`,
            [PATTERNS.SEEN_ONLINE, PATTERNS.SEEN_NO_PERMISSION],
            5000
        );

        let onlineTime = settings.noPermsSeenMessage || 'Нет прав';
        if (PATTERNS.SEEN_ONLINE.test(seenMatch[0])) {
            const days = parseInt(seenMatch[1] || 0);
            const hours = parseInt(seenMatch[2] || 0);
            const minutes = parseInt(seenMatch[3] || 0);
            const seconds = parseInt(seenMatch[4] || 0);

            const timeParts = [];
            if (days > 0) timeParts.push(`${days}д`);
            if (hours > 0) timeParts.push(`${hours}ч`);
            if (minutes > 0) timeParts.push(`${minutes}м`);
            if (seconds > 0) timeParts.push(`${seconds}с`);
            onlineTime = timeParts.length > 0 ? timeParts.join(' ') : 'меньше минуты';
        }

        const kdr = 100 + (kills * 1) - (deaths * 20);

        const statsLine = formatMessage(settings.statsLine, {
            kills,
            deaths,
            kdr,
            onlineTime
        });

        if (settings.showHeader) {
            const header = formatMessage(settings.header, {
                player: targetPlayer
            });
            bot.api.sendMessage(typeChat, header, user.username);
            setTimeout(() => bot.api.sendMessage(typeChat, statsLine, user.username), 300);
        } else {
            bot.api.sendMessage(typeChat, statsLine, user.username);
        }

    } catch (error) {
        const message = formatMessage(settings.errorSeenMessage, {
            player: targetPlayer
        });
        return bot.api.sendMessage(typeChat, message, user.username);
    }
}

module.exports = handleStatsRequest;