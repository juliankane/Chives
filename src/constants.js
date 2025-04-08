require('module-alias/register');


const MAX_AWARDS = 10;
const MAX_REPORTS = 10;
const REQUIRED = '🔴';

const arrow_emojis = {
    'award': '🔺',
    'reduce': '🔻',
}

const pa_heading = {
    'award': 'Awarded Members',
    'report': 'Reported Members',
}


const rr_map = {
    'reduce': 'report',
    'report': 'reduce',
    'award': 'award',
    'entry': 'entry',
}

const embd_points = {
    'award': '+',
    'report': '-',
}

const embd_titles = (points, pa) => {

    

    const titles = {
        'award': `Award 🏆 has been issued!   |  +${points} points`,
        'report': `Report 🚨 has been issued!   |  -${points} points`,
        'entry': 'Log 📝 has been entered!',
    }

    return `${titles[pa]}`
}



const embd_colors = {
    'award': 0x66CC66,
    'report': 0xFF6666,
    'entry': 0x0099FF
}



const LogJS = Object.freeze({
    log_strings: {
        cmd_descript: "Create a log",
        attch_opt_descript: "Attach an image, gif, or video",
        url_opt_descript: "Provide a link (Youtube, Gyazo, Imgur, etc.",
        main_prompt: "Create a log...",
        reprompt: "Please enter something for the required fields",
        success_followup: (text_channel) => `Your log has been submitted and posted in ${text_channel}`,
        cancel_followup: "[redacted]",
        evnt_mt: "New Event",
        evnt_ml: "Enter a few words that describe the event.",
        evnt_mp: "e.g. Trolling, Gooning, Vibe Maxing...",
        loc_mt: "New Location",
        loc_ml: "Enter a new location",
        loc_mp: "e.g. IRL, World of Warcraft, Dota 2...",
        entry_mt: "Details",
        entry_ml: "Entry",
        entry_mp: "Write in details about the event...",
        anon_opt_descript: "Post your log anonymously!"
    },
    menu_strings: {
  
        new_emoji: '✨',
        usr_sp: "Select user(s)",
        award_sl: "Award",
        award_se: '🏆',
        award_sd: "Award points to a member of the discord",
        report_sl: "Report",
        report_se: '🚨',
        report_sd: "Report a member of the discord",
        poiact_sp: (a_type) => `How many points would you like to ${a_type} ${arrow_emojis[a_type]}`,
        poiact_arrows: (a_type) => `${arrow_emojis[a_type]}`,
        evnt_new_sl: "New Event...",
        evnt_sp: 'Describe the event in one or two words...',
        loc_new_sl: 'New Location...',
        loc_sp:'Where did the event take place?',
        submit_bl: 'Begin log entry',
        cancel_bl: 'Cancel'
    },
    embed_strings: {
        embd_title: (points, point_action) => `${embd_titles(points, point_action)}`,
        loc_fname: 'Location',
        evnt_fname: 'Reason',
        entry_fname: 'Details: ',
        mmheading: `Affected Members`,
        footer: (author) => `written by ${author}`,
        colors: (pa) => embd_colors[pa],
    }
});


module.exports = { LogJS, arrow_emojis, rr_map }