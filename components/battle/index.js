import {
	bind,
	merge,
	pipe,
	identity,
	partial,
	not,
	propEq,
	equals,
	find,
	map,
	filter,
	pathOr,
} from "ramda"
import Tilesheet from "../tilesheet"

const playerTilesheet = `/static/tilesheets/player.png`
const npcTilesheet = `/static/tilesheets/soldier.png`

const Actions = [
	{
		type: "block",
		key: "ArrowLeft",
		cooldown: 30,
		duration: 20,
		tile: "block",
	},
	{
		type: "jump",
		key: "ArrowUp",
		cooldown: 50,
		duration: 10,
		tile: "jump",
	},
	{
		type: "punch",
		key: "Space",
		cooldown: 50,
		duration: 10,
		tile: "punch",
	},
]

const clone = partial(merge, [{}])

const decreaseCooldown = action => {
	return {
		...action,
		cooldown: action.cooldown - 1,
	}
}

const decreaseCooldowns = state => {
	const newState = clone(state)
	newState.cooldowns = map(decreaseCooldown, newState.cooldowns)
	newState.cooldowns = filter(x => x.cooldown > 0, newState.cooldowns)
	return newState
}

const decreaseCurrentAction = state => {
	const newState = clone(state)
	
	if (newState.currentAction) {
		newState.currentAction.duration = newState.currentAction.duration - 1
		
		if (newState.currentAction.duration <= 0) {
			newState.currentAction = null
		}
	}
	
	return newState
}

const playerIsFreeToAct = ({ currentAction }) => !currentAction
const playerIsTryingToAct = ({ inputAction }) => inputAction

const addAction = ({ state, action }) => {
	const newState = clone(state)

	newState.currentAction = clone(action)
	newState.cooldowns.push(clone(action))
	return newState
}

const actionIsFree = ({ state, action }) => {
	return not(find(propEq("type", action.type), state.cooldowns))
}

const handleActions = state => {
	if (playerIsFreeToAct(state)) {
		if (playerIsTryingToAct(state)) {
			if (actionIsFree({ state, action: state.inputAction })) {
				return addAction({ state, action: state.inputAction })
			}
		}
	}
	
	return state
}

const getActionFromKeyCode = keyCode => find(propEq("key", keyCode))(Actions)

export default class Battle extends React.Component {
	constructor() {
		super()
		this.state = {
			cooldowns: [],
			inputAction: null,
			currentAction: null,
		}
	}

	componentDidMount() {
		window.addEventListener("keydown", bind(this.keyDown, this))
		window.addEventListener("keyup", bind(this.keyUp, this))

		this.boundLoop = bind(this.loop, this)
		requestAnimationFrame(this.boundLoop)
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			not(equals(nextProps, this.props)) || not(equals(nextState, this.state))
		)
	}

	loop() {
		const newState = pipe(
			clone,
			decreaseCooldowns,
			decreaseCurrentAction,
			handleActions,
		)(this.state)
		this.setState(newState)
		requestAnimationFrame(this.boundLoop)
	}

	keyUp(e) {
		this.setState({
			inputAction: null,
		})
	}

	keyDown(e) {
		this.setState({
			inputAction: getActionFromKeyCode(e.code),
		})
	}

	getTileStateFromPlayerState() {
		return pathOr("idle", ["state", "currentAction", "tile"], this)
	}

	render() {
		console.log("render")
		return (
			<>
				<style jsx>{`
					.arena {
						display: flex;
					}

					.player {
					}

					.npc {
						transform: scaleX(-1);
					}
				`}</style>
				<div className="arena">
					<Tilesheet
						className="player"
						src={playerTilesheet}
						state={this.getTileStateFromPlayerState()}
					/>
					<Tilesheet className="npc" src={npcTilesheet} state="idle" />
				</div>
			</>
		)
	}
}
