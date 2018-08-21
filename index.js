// Version 1.2.5

'use strict'

const Command = require('command'),

module.exports = function Vanguardian(dispatch) {
	const command = Command(dispatch),
	      
	let battleground = null,
		inbattleground = false,
		questid = 0,
		timeout = null,
		timeoutdaily = null,
		timeoutweekly = null,
		daily = 0,
		weekly = 0,
		enabled = true

	// ############# //
	// ### Hooks ### //
	// ############# //

	dispatch.game.on('enter_game', () => {
		questid = 0
		daily = 0
		weekly = 0
		timeout = null
		timeoutdaily = null
		timeoutweekly = null
	})

	dispatch.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, event => {
		questid = event.id
		if(questid != 0) timeout = setTimeout(CompleteQuest, 2000) // try to complete the quest after 2 seconds
		return false
	})

	dispatch.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 2, event => {
		daily = event.unk4
		weekly = event.unk6
	})

	// ############## //
	// ### Checks ### //
	// ############## //

	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { battleground = event.zone })

	dispatch.game.on('enter_loading_screen', () => {
		inbattleground = dispatch.game.me.zone == battleground
	})

	// ################# //
	// ### Functions ### //
	// ################# //

	function CompleteQuest() {
		clearTimeout(timeout)
		if(!enabled) return
		if(dispatch.game.me.alive && !inbattleground) { // if alive and not in a battleground
			dispatch.toServer('C_COMPLETE_DAILY_EVENT', 1, { id: questid })
			questid = 0
			if(daily < 16) {
				daily++
				weekly++
				command.message('<font color="#E69F00">[H每日任务:]你今日已经完成：</font>' + `<font color="#56B4E9">${daily}</font>` + '<font color="#56B4E9">个</font>'+'<font color="#E69F00">每日任务</font>')
			}
			else command.message('<font color="#E69F00">[H每日任务:]你今日已经完成全部：</font>' + `<font color="#56B4E9">${daily}</font>` + '<font color="#56B4E9">个</font>'+'<font color="#E69F00">每日任务</font>')
			if(daily == 3 || daily == 8) timeoutdaily = setTimeout(CompleteDaily, 1000)
			if(weekly == 16) timeoutweekly = setTimeout(CompleteWeekly, 1500)
		}
		else timeout = setTimeout(CompleteQuest, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}

	function CompleteDaily() {
		clearTimeout(timeoutdaily)
		if(!enabled) return
		if(dispatch.game.me.alive && !inbattleground) // if alive and not in a battleground
			dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 1 })
		else timeoutdaily = setTimeout(CompleteDaily, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}

	function CompleteWeekly() {
		clearTimeout(timeoutweekly)
		if(!enabled) return
		if(dispatch.game.me.alive && !inbattleground) // if alive and not in a battleground
			dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 0 })
		else timeoutweekly = setTimeout(CompleteWeekly, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}

	// ################ //
	// ### Commands ### //
	// ################ //

	command.add('vg', (param) => {
		if(param == null) {
			enabled = !enabled
			command.message('<font color="#E69F00">[H每日任务:] </font>' + (enabled ? '<font color="#56B4E9">开启</font>' : '<font color="#E69F00">关闭</font>'))
			console.log('[H每日任务:] ' + (enabled ? 'enabled' : 'disabled'))
		}
		else if(param == "show")
			command.message('<font color="#E69F00">[H每日任务:]你今日已经完成：</font>' + `<font color="#56B4E9">${daily}</font>` + '<font color="#56B4E9">个</font>'+'<font color="#E69F00">每日任务</font>')
		else command.message('Commands:<br>'
							+ ' "vg" (enable/disable Vanguardian),<br>'
							+ ' "vg daily" (Tells you how many Vanguard Requests you completed today")'
		)
	})
}
