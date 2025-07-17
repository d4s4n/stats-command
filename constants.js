const COMMAND_NAME = 'stats';
const PERMISSION_NAME = 'user.stats';
const PLUGIN_OWNER_ID = 'plugin:stats-command';

const PATTERNS = {
    STATS: /Статистика игрока .+: Убийств:\s*(\d+),\s*Смертей:\s*(\d+)/i,
    SEEN_ONLINE: /Игрок .+ онлайн с (?:(\d+) дн\w*\s*)?(?:(\d+) час\w*\s*)?(?:(\d+) минут\w*\s*)?(?:(\d+) секунд\w*)?/i,
    SEEN_NO_PERMISSION: /У вас нет прав на эту команду/i,
    NOT_IN_CLAN: /Игрок не состоит в вашем клане/i,
    PLAYER_OFFLINE: /Игрок не в сети\./i,
};

module.exports = {
    COMMAND_NAME,
    PERMISSION_NAME,
    PLUGIN_OWNER_ID,
    PATTERNS,
};