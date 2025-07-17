const {
    COMMAND_NAME,
    PERMISSION_NAME,
    PLUGIN_OWNER_ID
} = require('./constants.js');
const handleStatsRequest = require('./lib/statsHandler.js');

async function onLoad(bot, options) {
    const log = bot.sendLog;
    const Command = bot.api.Command;
    const settings = options.settings;

    class StatsCommand extends Command {
        constructor() {
            super({
                name: COMMAND_NAME,
                description: 'Показывает статистику игрока.',
                aliases: ['стата', 'статистика'],
                permissions: PERMISSION_NAME,
                owner: PLUGIN_OWNER_ID,
                cooldown: 15,
                allowedChatTypes: ['clan', 'private', 'chat'],
                args: [{
                    name: 'игрок',
                    type: 'string',
                    required: false,
                    description: 'Ник игрока, чью стату вы хотите посмотреть'
                }]
            });
        }

        async handler(bot, typeChat, user, {
            игрок
        }) {
            const targetPlayer = игрок || user.username;
            await handleStatsRequest(bot, typeChat, user, targetPlayer, settings);
        }
    }

    try {
        await bot.api.registerPermissions([{
            name: PERMISSION_NAME,
            description: 'Доступ к команде stats',
            owner: PLUGIN_OWNER_ID
        }]);
        await bot.api.addPermissionsToGroup('Member', [PERMISSION_NAME]);
        await bot.api.registerCommand(new StatsCommand());
        log(`[${PLUGIN_OWNER_ID}] Команда '${COMMAND_NAME}' успешно зарегистрирована.`);
    } catch (error) {
        log(`[${PLUGIN_OWNER_ID}] Ошибка при загрузке: ${error.message}`);
    }
}

async function onUnload({
    botId,
    prisma
}) {
    console.log(`[${PLUGIN_OWNER_ID}] Удаление ресурсов для бота ID: ${botId}`);
    try {
        await prisma.command.deleteMany({
            where: {
                botId,
                owner: PLUGIN_OWNER_ID
            }
        });
        await prisma.permission.deleteMany({
            where: {
                botId,
                owner: PLUGIN_OWNER_ID
            }
        });
        console.log(`[${PLUGIN_OWNER_ID}] Команды и права плагина удалены.`);
    } catch (error) {
        console.error(`[${PLUGIN_OWNER_ID}] Ошибка при очистке ресурсов:`, error);
    }
}

module.exports = {
    onLoad,
    onUnload,
};