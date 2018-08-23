'use strict'

module.exports = function Vanguardian(mod) {
	let questid = 0,
		timeout = null,
		timeoutdaily = null,
		timeoutweekly = null,
		daily = 0,
		weekly = 0,
		enabled = true

	// ############# //
	// ### Hooks ### //
	// ############# //
	mod.game.on('enter_game', () => {
		questid = 0
		daily = 0
		weekly = 0
		timeout = null
		timeoutdaily = null
		timeoutweekly = null
	})

	mod.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, event => {
		questid = event.id
		if(questid != 0)
            timeout = setTimeout(CompleteQuest, 2000) // try to complete the quest after 2 seconds
		return false
	})

	mod.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 2, event => {
		daily = event.unk4
		weekly = event.unk6
	})

	// ################# //
	// ### Functions ### //
	// ################# //
	function CompleteQuest() {
		clearTimeout(timeout)
		if(!enabled)
            return

		if(mod.game.me.alive && !mod.game.me.inBattleground) {
			mod.send('C_COMPLETE_DAILY_EVENT', 1, { id: questid })
			questid = 0

			if(daily < 16) {
				daily++
				weekly++
				mod.command.message('<font color="#E69F00">[Vanguardian:]You have completed：</font>' + `<font color="#56B4E9">${daily}</font>` + '<font color="#56B4E9">个</font>'+'<font color="#E69F00">Vanguard Request Today</font>');
			} else {
                mod.command.message('<font color="#E69F00">[Vanguardian:]You have completed：</font>' + `<font color="#56B4E9">${daily}</font>` + '<font color="#56B4E9"></font>'+'<font color="#E69F00">Vanguard Request Today</font>');
            }

			if(daily == 3 || daily == 8)
                timeoutdaily = setTimeout(CompleteDaily, 1000)

			if(weekly == 16)
                timeoutweekly = setTimeout(CompleteWeekly, 1500)
		}
		else
            timeout = setTimeout(CompleteQuest, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}

	function CompleteDaily() {
		clearTimeout(timeoutdaily)
		if(!enabled)
            return

		if(mod.game.me.alive && !mod.game.me.inBattleground)
			mod.send('C_COMPLETE_EXTRA_EVENT', 1, { type: 1 })
		else
            timeoutdaily = setTimeout(CompleteDaily, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}

	function CompleteWeekly() {
		clearTimeout(timeoutweekly)
		if(!enabled)
            return

		if(mod.game.me.alive && !mod.game.me.inBattleground)
			mod.send('C_COMPLETE_EXTRA_EVENT', 1, { type: 0 })
		else
            timeoutweekly = setTimeout(CompleteWeekly, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}

	// ################ //
	// ### Commands ### //
	// ################ //
	mod.command.add('vg', {
		$default() {
            mod.command.message('Commands:<br>'
							+ ' "vg" (enable/disable Vanguardian),<br>'
							+ ' "vg daily" (Tells you how many Vanguard Requests you completed today")'
            );
        },
		$none() {
			enabled = !enabled
			mod.command.message('<font color="#E69F00">[Vanguardian:] </font>' + (enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
			console.log('[Vanguardian:] ' + (enabled ? 'enabled' : 'disabled'))
		},
		show() {
			mod.command.message('<font color="#E69F00">[Vanguardian:]You have completed：</font>' + `<font color="#56B4E9">${daily}</font>` + '<font color="#56B4E9">个</font>'+'<font color="#E69F00">Vanguard Request Today</font>')
        },
	})
}
