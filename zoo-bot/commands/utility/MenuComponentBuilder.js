//* log.js Menu Components
//      Build a menu and provide functions to log.js  */
const { ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, ButtonStyle, TextInputStyle, TextInputBuilder, ModalBuilder } = require('discord.js');

const { LogJS } = require('@constants');




class MenuComponentBuilder {
    /** Init MenuComponentBuilder */
    constructor(customIds = {}, guild_options = {}, guild_tags = []){
       
        this.customIds = customIds;
        this.guild_events = guild_options.events; // Guild's saved events || []
        this.guild_locations = guild_options.locations; // Guild's saved locations || []
        this.guild_tags = guild_tags
        
        // Create SelectMenuBuilders && Buttons
        this.UserSelect = this.createUserSelect();
        this.PointActionSelect = this.createPointActionSelect();
        this.EventNameSelect = this.createEventNameSelect();
        this.LocationNameSelect = this.createLocationNameSelect();
        this.EntryButton = this.createEntryButton();
        this.CancelButton = this.createCancelButton();

        /** Store action rows to update menus and default value's for..
                *      PointActionSelect (only default value's)
                *      EventNameSelect & LocationNameSelect */
        this.ActionRows = null
    } //        

    createUserSelect(){
        /** Menu of all relavent members of the discord - maximum users displayed = 25 */
        return new UserSelectMenuBuilder().setCustomId(this.customIds.user).setPlaceholder('Select user(s)')
            .setMinValues(1).setMaxValues(25);
    }

    createPointActionSelect(selected_option = ""){
        /** Menu Award or Report
         * .setDefault if user selected the option previously | (selected_option === '') = false
         */
        let _options = [   
            new StringSelectMenuOptionBuilder().setEmoji('🏆').setLabel('Award').setValue('award')
                .setDescription('Award a member of the discord.').setDefault(selected_option === 'award'),
            new StringSelectMenuOptionBuilder().setEmoji('🚨').setLabel('Report')
                .setDescription('Report a member of the discord.').setValue('report').setDefault( selected_option === 'report')]   


        return new StringSelectMenuBuilder().setCustomId((this.customIds.pointAction)).setPlaceholder(('Award or Report?'))
            .addOptions(_options);
    }

    createEventNameSelect(new_option = ""){
        /** Menu of event's from guild events or create a new event
        */
        let _options = this.guild_events.map(option =>
            new StringSelectMenuOptionBuilder()
            .setLabel(option)
            .setValue(option))
        
        /**  Add a newly created event to the list of options and set default = true
          * Only one event per log entry - Creating multiple new events in one log entry will rewrite the previous */
        if (new_option) {
            _options.push(
                new StringSelectMenuOptionBuilder()
                .setLabel(new_option)
                .setValue(`${new_option.toLowerCase()}-${Date.now()}`)
                .setDefault(true)
            )
        }

        _options.push(new StringSelectMenuOptionBuilder()
            .setLabel("New Event...")
            .setValue('new').setEmoji('✨'))
           
    
        return new StringSelectMenuBuilder().setCustomId((this.customIds.eventName)).setPlaceholder(('Describe the event in one or two words...'))
            .addOptions( _options )
        
    }

    createLocationNameSelect(new_option = ""){
        /** Menu of location's from guild locations or create a new location */
        let _options = this.guild_locations.map(option =>
                            new StringSelectMenuOptionBuilder()
                            .setLabel(option)
                            .setValue(option))   
        
        /** Add a new location | default = true
         * Only one new location per log entry - Creating multiple new locations in one log entry will rewrite the previous */ 
        if (new_option){
            _options.push(
                new StringSelectMenuOptionBuilder()
                .setLabel(new_option)
                .setValue(`${new_option.toLowerCase()}-${Date.now()}`)
                .setDefault(true)
            )
        }                   

        _options.push(new StringSelectMenuOptionBuilder()
            .setLabel("New Location...")
            .setValue('new')
            .setEmoji('✨'));

        return new StringSelectMenuBuilder().setCustomId((this.customIds.locationName)).setPlaceholder(('Where did the event take place?'))
            .addOptions(_options);
        
    }

    createEntryButton(disable = true){
        /** Submit Button */
        return new ButtonBuilder().setCustomId(this.customIds.submit).setLabel('Begin log entry').setStyle(ButtonStyle.Primary).setDisabled(disable);
    }

    createCancelButton(){
        /** Cancel Button  */
        return new ButtonBuilder().setCustomId(this.customIds.cancel).setLabel('Cancel').setStyle(ButtonStyle.Secondary);
    }

    createComponents(){
        /** Initialize action rows 
         *      Returns action rows to reply to the interaction
         */
        let row0 = new ActionRowBuilder().addComponents(this.UserSelect) // row 1 - user select menu
        let row1 = new ActionRowBuilder().addComponents(this.PointActionSelect) // row 2 - point action select menu 
        let row2 = new ActionRowBuilder().addComponents(this.EventNameSelect) // row 3 - event name selecc menu
        let row3 = new ActionRowBuilder().addComponents(this.LocationNameSelect) // row 4 - location name select menu
        let row4 = new ActionRowBuilder().addComponents(this.EntryButton, this.CancelButton) // row 5 - Submit, Cancel buttons
        this.ActionRows = [row0, row1, row2, row3, row4];
        return this.ActionRows;
    }

    updatePointActionSelect(point_action){
        /** Recreate the PointActionSelectMenu \
         *      Replace the component the respective ActionRow */
        this.PointActionSelect = this.createPointActionSelect(point_action)
        this.ActionRows[1].setComponents(this.PointActionSelect);
    }

    updateEventSelect(event){   
        /** Recreate the EventSelectMenu PointActionSelectMenu \
         *      Replace the component the respective ActionRow */
        this.EventNameSelect = this.createEventNameSelect(event);
    }

    updateLocationSelect(location){
        /** Recreate the LocationSelect PointActionSelectMenu \
         *      Replace the component the respective ActionRow */
        this.LocationNameSelect = this.createLocationNameSelect(location)

    }

    setSubmitEnabled(){
        const disable = false;
        this.EntryButton = this.createEntryButton(disable);
    }

   

    async showModal(interaction, modal, modalId = ""){
        //**  Show a modal and return input fields */
        await interaction.showModal(modal); // Display the modal

        try{    
            // Wait for the user to submit
            const modalResponse = await interaction.awaitModalSubmit({ 
                time: 30000,
                filter: (modalInteraction) => modalInteraction.user.id === interaction.user.id && modalInteraction.customId === modalId});
            
            if (modalResponse){ 
                /* Entry submited **/
                modalResponse.deferUpdate();
                const inputText = modalResponse.fields.getTextInputValue('input');        
                return inputText; 
            }
        
        } catch (error){ 
            console.error(`Modal with ID ${modalId} was never submitted`);
            return null;
        }; // err
    }
    
    buildSingleInputModal(customId = "", title = "", label = "", placeholder = "", inputStyle = TextInputStyle.Short){
        /** build a modal for a single input fiield
         * inputStyle : TextInputStyle.Short - One line entries 
         *                                          Use:new location & new event
         *              TextInputStyle.Paragraph - Text entries
         *                                          Use: new log entry     */
        const modal = new ModalBuilder()
            .setCustomId(customId)
            .setTitle(title);
        const textInput = new TextInputBuilder()
            .setCustomId('input')
            .setLabel(label)
            .setStyle(inputStyle)
            .setPlaceholder(placeholder);
    
        if (inputStyle === TextInputStyle.Paragraph){
            textInput.setMaxLength(1024);
        }
    
        const row = new ActionRowBuilder().addComponents(textInput); // single input
        modal.addComponents(row);
        return modal;
    }


}



//** End Class */

/** Begin Module Functions */


// Exports
module.exports = { MenuComponentBuilder };