const { 
    SlashCommandBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder,
    ButtonStyle, 
    TextInputStyle,
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('award')
		.setDescription('Award points from members in your discord'),

	async execute(interaction) {
        /** Select Menu - 
         * Select menu to select a member of the discord */
		const userSelect = new UserSelectMenuBuilder()
			.setCustomId('users')
			.setPlaceholder('Select user(s)')
			.setMinValues(1)
			.setMaxValues(10);

        /**Button - 
         * Confirm the selected users */
		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Award')
			.setStyle(ButtonStyle.Success);
        
        /**Button -
         *  Cancel your submission */ 
        const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);
        
        // adding components
		const row1 = new ActionRowBuilder().addComponents(userSelect);
		const row2 = new ActionRowBuilder().addComponents(confirm, cancel);

        // prompt for submission
        const initialPrompt = await interaction.reply({
			content: 'Award points to:',
			components: [row1, row2],
            withResponse: true,
		});

        const collector = initialPrompt.resource.message.createMessageComponentCollector({
            time: 3_600_000 // timeout after one hour
        });
        
        let selectedUserIds = []; // store selected user IDs

        /** Begin collecting interactions on this command */
        collector.on('collect', async i => {

            /** SELECTION MENU EXIT -
             * Defer update when user has selected the users AND exited the menu */ 
            if (i.customId === 'users'){
                selectedUserIds = i.values;
                console.log('Users Selected:', selectedUserIds);
				await i.deferUpdate();
            }

            /** CONFIRM - 
             * User confirmed submission */
            if (i.customId === 'confirm'){ 

                const selectedUser_names = selectedUserIds.map(id => `<@${id}>`).join(', '); // map ID to a user's @name
                const initiatorNickname = `<@${i.user.id}>`
                
                // no user selected
                if (selectedUserIds.length === 0) { 
                    await i.reply({ content: 'No users selected!'});
                    return;
                }
                

                /** Modal - 
                * Prompt the user for the reason for the submission */

                const modal = new ModalBuilder()
                    .setCustomId('award_reason')
                    .setTitle('Reason for award');

                const reasonInput = new TextInputBuilder() // creating texet input field
                    .setCustomId('reason')
                    .setLabel(`Why are you awarding points?`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);
                    
                    
                const modalRow = new ActionRowBuilder().addComponents(reasonInput); // add input field to modal
                modal.addComponents(modalRow);

                await i.showModal(modal);  // Show prompt


                try {
                    // Wait for submit from
                    //          1. Same user that began the interaction
                    //          2. Correct modal
					const modalInteraction = await i.awaitModalSubmit({
						filter: (modal) => modal.customId === 'award_reason' && modal.user.id === interaction.user.id,
						time: 3_600_000,
					});

					const reason = modalInteraction.fields.getTextInputValue('reason');
                    
                    // Reply in discord with reason
					await modalInteraction.reply({
						content: `${initiatorNickname} awarded points to ${selectedUser_names}.\n**Reason:** ${reason}`,
					});
					console.log(`Reason: ${reason}`);

                    // Stop collecting interactions
					collector.stop();

				} catch (e) {
					console.log('Modal timed out or was cancelled');
                }
            }
            
            /** CANCEL - 
             * User canceled request - stop collecting interactions */ 
            if (i.customId === 'cancel'){
                console.log('Cancel button pressed');
				await i.reply({ content: 'Cancelled award' });
				collector.stop();
            }
        });




        /** Stop collecting interactions on this command */
        collector.on('end', () => {
			console.log('Collector Stopped');
		});

	},
};