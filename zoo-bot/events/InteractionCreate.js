const { Events, MessageFlags } = require('discord.js')
const CacheManager = require('@cache');



module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		let guildSettings = CacheManager.getGuildSettings(interaction.guild.id, guildName = interaction.guild.name)

		if (guildSettings.authorized_roles && !interaction.member.permissions.has('Administrator')){
			const usr_roles = interaction.member.roles.cache.map(role=>role.id);
			const isAuthorized = usr_roles.some(roleId => guildSettings.authorized_roles.includes(roleId));
			
			if (!isAuthorized){
				await interaction.reply({content: "You do not have the roles to use this command!", Flags: MessageFlags.Ephemeral})
				return;
			}
		}




		
		const command = interaction.client.commands.get(interaction.commandName)
		if (!command) {
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
    }
}