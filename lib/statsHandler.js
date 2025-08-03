const {
    PATTERNS,
    PLUGIN_OWNER_ID
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
            [PATTERNS.STATS, PATTERNS.NOT_IN_CLAN, PATTERNS.PLAYER_OFFLINE, PATTERNS.STATS_NO_PERMISSION],
            5000
        );

        if (PATTERNS.NOT_IN_CLAN.test(statsMatch[0])) {
            const message = formatMessage(settings.notInClanMessage, { player: targetPlayer });
            return bot.api.sendMessage(typeChat, message, user.username);
        }

        if (PATTERNS.PLAYER_OFFLINE.test(statsMatch[0])) {
            const message = formatMessage(settings.playerOfflineMessage, { player: targetPlayer });
            return bot.api.sendMessage(typeChat, message, user.username);
        }

        if (PATTERNS.STATS_NO_PERMISSION.test(statsMatch[0])) {
            return bot.api.sendMessage(typeChat, "У бота нет прав для просмотра статистики клана (/c stats).", user.username);
        }

        kills = parseInt(statsMatch[1], 10);
        deaths = parseInt(statsMatch[2], 10);

    } catch (error) {
        const message = formatMessage(settings.errorStatsMessage, { player: targetPlayer });
        return bot.api.sendMessage(typeChat, message, user.username);
    }

    let onlineTime = 'неизвестно';
    try {
        const seenMatch = await bot.api.sendMessageAndWaitForReply(
            `/seen ${targetPlayer}`,
            [PATTERNS.SEEN_ONLINE, PATTERNS.SEEN_NO_PERMISSION],
            5000
        );

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
        } else if (PATTERNS.SEEN_NO_PERMISSION.test(seenMatch[0])) {
            onlineTime = 'нет прав на /seen';
        }

    } catch (error) {
         bot.sendLog(`[${PLUGIN_OWNER_ID}] Не критичная ошибка при получении времени в игре: ${error.message}`);
    }
    
    const templateData = {
        player: targetPlayer,
        kills,
        deaths,
        kdr: 100 + (kills * 1) - (deaths * 20),
        onlineTime
    };

    for (const line of settings.statsLines) {
        const messageToSend = formatMessage(line, templateData);
        bot.api.sendMessage(typeChat, messageToSend, user.username);
    }
}

module.exports = handleStatsRequest;
