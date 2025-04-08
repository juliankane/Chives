//* log.js Menu Components
//      Build a menu and provide functions to log.js  */
const { ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, ButtonStyle, TextInputStyle, TextInputBuilder, ModalBuilder } = require('discord.js');

const { LogJS: {menu_strings} } = require('@constants');

class MenuComponentBuilder {
    /** Init MenuComponentBuilder */
    constructor(customIds = {}, guild_options = {}, guild_tags = [], action_type = ""){

 
        this.action_type = action_type;
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
        return new UserSelectMenuBuilder().setCustomId(this.customIds.user).setPlaceholder(menu_strings.usr_sp)
            .setMinValues(1).setMaxValues(25);
    }

    createPointActionSelect(selected_option = ""){

        if (this.customIds.pointAction === null){ // menu wasn't created
            return null;
        } 

        let _options = [10, 25, 50, 100].map(value =>
            new StringSelectMenuOptionBuilder()
                .setLabel(`${value} Points`) // Display text
                .setValue(value.toString())  // Set the value as a string
                .setDefault(selected_option === value.toString()) // Set default selection
                .setEmoji(menu_strings.poiact_arrows(this.action_type))
        );
        

        console.log(this.action_type)
        return new StringSelectMenuBuilder()
                .setCustomId(this.customIds.pointAction)
                .setPlaceholder(menu_strings.poiact_sp(this.action_type))
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
            .setLabel(menu_strings.evnt_new_sl)
            .setValue('new').setEmoji(menu_strings.new_emoji))
           
    
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
            .setLabel(menu_strings.loc_new_sl)
            .setValue('new')
            .setEmoji(menu_strings.new_emoji));

        return new StringSelectMenuBuilder().setCustomId((this.customIds.locationName)).setPlaceholder((menu_strings.loc_sp))
            .addOptions(_options);
        
    }

    createEntryButton(disable = true){
        /** Submit Button */
        return new ButtonBuilder().setCustomId(this.customIds.submit).setLabel(menu_strings.submit_bl).setStyle(ButtonStyle.Primary).setDisabled(disable);
    }

    createCancelButton(){
        /** Cancel Button  */
        return new ButtonBuilder().setCustomId(this.customIds.cancel).setLabel(menu_strings.cancel_bl).setStyle(ButtonStyle.Secondary);
    }

    createComponents(){
        /** Initialize action rows 
         *      Returns action rows to reply to the interaction
         */
        let row0 = new ActionRowBuilder().addComponents(this.UserSelect) // row 1 - user select menu
        let row2 = new ActionRowBuilder().addComponents(this.EventNameSelect) // row 3 - event name selecc menu
        let row3 = new ActionRowBuilder().addComponents(this.LocationNameSelect) // row 4 - location name select menu
        let row4 = new ActionRowBuilder().addComponents(this.EntryButton, this.CancelButton) // row 5 - Submit, Cancel buttons

    
        this.ActionRows = [row0, row2, row3, row4];
        

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