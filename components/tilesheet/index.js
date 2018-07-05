import { indexOf } from "ramda"
import states from "./states"

const TILE_WIDTH = 80
const TILE_HEIGHT = 110
const TILE_ROWS = 9

const getBackgroundOffsetFromState = ({ state = 'idle' }) => {
	const targetIndex = indexOf(state, states)
	const targetX = targetIndex % TILE_ROWS
	const targetY = Math.floor(targetIndex / TILE_ROWS)
	
	return `-${targetX * TILE_WIDTH}px -${targetY * TILE_HEIGHT}px`
}

export default class Tilesheet extends React.Component {
	constructor() {
		super()
		this.state = {}
	}

	render() {
		return (
			<React.Fragment>
				<style jsx>{`
					.root {
						width: ${TILE_WIDTH}px;
						height: ${TILE_HEIGHT}px;
						background: url(${this.props.src});
						background-position: ${getBackgroundOffsetFromState(this.props)};
					}
				`}</style>

				<div className={`root ${this.props.className}`} />
			</React.Fragment>
		)
	}
}
