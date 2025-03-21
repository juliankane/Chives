
const { ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,ButtonStyle, } = require('discord.js');

const {__cache } = require('../../CacheManager')


class Menu{
    constructor(){
        this.locations = __cache.getLocations();
        this.events = __cache.getEvents();
        this.UserSelect = this.createUserSelect();
        this.PointActionSelect = this.createPointActionSelect();
        this.EventTypeSelect = this.createEventTypeSelect();
        this.LocationSelect = this.createLocationSelect();
        this.EntryButton = this.createEntryButton();
        this.CancelButton = this.createCancelButton();
    }
    
    createUserSelect(){
        return new UserSelectMenuBuilder().setCustomId('users').setPlaceholder('Select user(s)')
            .setMinValues(1).setMaxValues(25);
    }

    createPointActionSelect(pointAction = ''){
        return new StringSelectMenuBuilder().setCustomId(('point_action')).setPlaceholder(('Award or deduct points?'))
            .addOptions(
                new StringSelectMenuOptionBuilder().setEmoji('🏆').setLabel('Award').setValue('award')
                    .setDescription('Award points to a member of the discord.').setDefault(pointAction === 'award'),
                new StringSelectMenuOptionBuilder().setEmoji('🚨').setLabel('Deduct')
                    .setDescription('Deduct points from a member of the discord.').setValue('deduct').setDefault(pointAction === 'deduct')
            
        );
    }

    createEventTypeSelect(eventType = ''){
        console.log(this.events);
        return new StringSelectMenuBuilder().setCustomId(('event_type')).setPlaceholder(('Describe the event in one or two words...'))
        .addOptions(...this.events.map(option =>
                        new StringSelectMenuOptionBuilder()
                        .setLabel(option.label)
                        .setValue(option.value)
                        .setDefault(eventType === option.value)
                    )      
                );
    }

    createLocationSelect(location = ''){
        return new StringSelectMenuBuilder().setCustomId(('location')).setPlaceholder(('Where did the event take place?'))
            .addOptions(
                        ...this.locations.map(option =>
                            new StringSelectMenuOptionBuilder()
                            .setLabel(option.label)
                            .setValue(option.value)
                            .setDefault(location === option.value)
                        )      
                    );
        
    }

    createCancelButton(){
        return new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
    }

    createEntryButton(){
        return new ButtonBuilder().setCustomId('create').setLabel('Begin log entry').setStyle(ButtonStyle.Primary)
    }

    createActionRows(){
        const rowGroups = [
            [this.UserSelect], // row1
            [this.PointActionSelect], // row2
            [this.EventTypeSelect], // row 3
            [this.LocationSelect], // row 4
            [this.EntryButton,this.CancelButton] // row 5
        ];
        
        return rowGroups.map(group => new ActionRowBuilder().addComponents(...group));

    }

    updateMenu(pointAction, eventType, location){
        this.locations = __cache.getLocations();
        this.events = __cache.getEvents();

        const updatedRowGroups = [
            [this.createPointActionSelect(pointAction = pointAction[0])],
            [this.createEventTypeSelect(eventType = eventType[0])],
            [this.createLocationSelect(location = location[0])]
        ];
        
        return updatedRowGroups.map(group => new ActionRowBuilder().addComponents(...group));
    }
}

module.exports = { Menu };